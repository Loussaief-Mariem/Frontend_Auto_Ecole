// src/hooks/useContrats.js
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllContratsByAutoEcole,
  getContratsByMoniteur,
  getContratsCompletTheorique,
  getContratsCompletPratique,
  getContratPdf,
} from "../api/contratService";

export const useContrats = (autoEcoleIdOrUser, options = {}) => {
  // États principaux
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // États de filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(
    options.initialFilterType || "all",
  );
  const [selectedMoniteurId, setSelectedMoniteurId] = useState(
    options.moniteurId || null,
  );
  const [typeFormationFilter, setTypeFormationFilter] = useState("");
  const [typePermisFilter, setTypePermisFilter] = useState("");
  const [dateDebutFilter, setDateDebutFilter] = useState(null);
  const [dateFinFilter, setDateFinFilter] = useState(null);
  const [sortBy, setSortBy] = useState("dateCreation");
  const [sortOrder, setSortOrder] = useState("desc");

  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Extraire l'autoEcoleId (supporte soit l'ID directement, soit l'objet user)
  const autoEcoleId = useMemo(() => {
    if (typeof autoEcoleIdOrUser === 'number') {
      return autoEcoleIdOrUser;
    }
    if (typeof autoEcoleIdOrUser === 'object' && autoEcoleIdOrUser !== null) {
      return autoEcoleIdOrUser?.user?.idAutoEcole || autoEcoleIdOrUser?.autoEcoleId;
    }
    return null;
  }, [autoEcoleIdOrUser]);

  // Charger les contrats
  const loadContrats = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        if (!autoEcoleId) {
          console.log("Pas d'autoEcoleId, chargement annulé");
          setContrats([]);
          setTotalItems(0);
          if (!isRefresh) setLoading(false);
          return;
        }

        let responseData = [];

        console.log("Chargement des contrats avec:", { autoEcoleId, filterType, selectedMoniteurId });

        // Choisir la méthode API selon le type de filtre
        switch (filterType) {
          case "theorique":
            responseData = await getContratsCompletTheorique(autoEcoleId);
            break;
          case "pratique":
            responseData = await getContratsCompletPratique(
              autoEcoleId,
              selectedMoniteurId,
            );
            break;
          case "byMoniteur":
            if (selectedMoniteurId) {
              const moniteurData = await getContratsByMoniteur(selectedMoniteurId);
              if (moniteurData && moniteurData.data && Array.isArray(moniteurData.data)) {
                responseData = moniteurData.data;
              } else if (Array.isArray(moniteurData)) {
                responseData = moniteurData;
              } else {
                responseData = [];
              }
            } else {
              responseData = await getAllContratsByAutoEcole(autoEcoleId);
            }
            break;
          default:
            responseData = await getAllContratsByAutoEcole(autoEcoleId);
        }

        // S'assurer que responseData est un tableau
        const contratsData = Array.isArray(responseData) ? responseData : [];
        
        console.log("Contrats chargés:", contratsData.length);
        setContrats(contratsData);
        setTotalItems(contratsData.length);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur de chargement des contrats",
        );
        console.error("Erreur loadContrats:", err);
        setContrats([]);
        setTotalItems(0);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [autoEcoleId, filterType, selectedMoniteurId],
  );

  // Recharger au changement des dépendances
  useEffect(() => {
    loadContrats();
  }, [loadContrats]);

  // Helper pour obtenir le libellé du type de formation
  const getTypeFormationLabel = (type) => {
    switch(type) {
      case 0: return "Complet";
      case 1: return "Théorique";
      case 2: return "Pratique";
      default: return "Inconnu";
    }
  };

  // Contrats filtrés
  const filteredContrats = useMemo(() => {
    let result = [...contrats];

    // Filtre par recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((contrat) => {
        const candidatNom =
          `${contrat.candidatNom || contrat.candidat?.nom || ""} ${contrat.candidatPrenom || contrat.candidat?.prenom || ""}`.toLowerCase();
        const candidatCin = (contrat.cin || contrat.candidat?.numeroCIN || "").toLowerCase();
        const typePermis = (contrat.typePermisCode || "").toLowerCase();
        const typeFormation = getTypeFormationLabel(contrat.typeFormation).toLowerCase();

        return (
          candidatNom.includes(term) ||
          candidatCin.includes(term) ||
          typePermis.includes(term) ||
          typeFormation.includes(term)
        );
      });
    }

    // Filtre par type de formation
    if (typeFormationFilter) {
      result = result.filter(
        (contrat) => getTypeFormationLabel(contrat.typeFormation) === typeFormationFilter,
      );
    }

    // Filtre par type de permis
    if (typePermisFilter) {
      result = result.filter(
        (contrat) => contrat.typePermisCode === typePermisFilter,
      );
    }

    // Filtre par date de création
    if (dateDebutFilter) {
      result = result.filter(
        (contrat) =>
          new Date(contrat.dateCreation) >= new Date(dateDebutFilter),
      );
    }
    if (dateFinFilter) {
      result = result.filter(
        (contrat) => new Date(contrat.dateCreation) <= new Date(dateFinFilter),
      );
    }

    // Tri
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "candidatNom":
          aVal = `${a.candidatNom || a.candidat?.nom || ""} ${a.candidatPrenom || a.candidat?.prenom || ""}`;
          bVal = `${b.candidatNom || b.candidat?.nom || ""} ${b.candidatPrenom || b.candidat?.prenom || ""}`;
          break;
        case "typePermis":
          aVal = a.typePermisCode || "";
          bVal = b.typePermisCode || "";
          break;
        default:
          aVal = new Date(a.dateCreation).getTime();
          bVal = new Date(b.dateCreation).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [
    contrats,
    searchTerm,
    typeFormationFilter,
    typePermisFilter,
    dateDebutFilter,
    dateFinFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const paginatedContrats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredContrats.slice(startIndex, endIndex);
  }, [filteredContrats, currentPage, itemsPerPage]);

  // Total des pages
  const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);

  // Statistiques des contrats
  const stats = useMemo(() => {
    return {
      total: contrats.length,
      complet: contrats.filter((c) => getTypeFormationLabel(c.typeFormation) === "Complet").length,
      theorique: contrats.filter((c) => getTypeFormationLabel(c.typeFormation) === "Théorique").length,
      pratique: contrats.filter((c) => getTypeFormationLabel(c.typeFormation) === "Pratique").length,
    };
  }, [contrats]);

  // Types de permis uniques pour le filtre
  const availablePermisTypes = useMemo(() => {
    const types = new Set();
    contrats.forEach((contrat) => {
      if (contrat.typePermisCode) types.add(contrat.typePermisCode);
    });
    return Array.from(types).sort();
  }, [contrats]);

  // Générer le PDF d'un contrat
  const generatePdf = useCallback(async (contratId, candidatNom) => {
    setPdfGenerating(true);
    setPdfError(null);

    try {
      const pdfBlob = await getContratPdf(contratId);

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrat_${candidatNom || contratId}_${new Date().toISOString().split("T")[0]}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la génération du PDF",
      );
      console.error("Erreur generatePdf:", err);
    } finally {
      setPdfGenerating(false);
    }
  }, []);

  // Obtenir un contrat spécifique
  const getContratById = useCallback(
    (id) => {
      const contrat = contrats.find((c) => c.id === parseInt(id));
      setSelectedContrat(contrat);
      return contrat;
    },
    [contrats],
  );

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFormationFilter("");
    setTypePermisFilter("");
    setDateDebutFilter(null);
    setDateFinFilter(null);
    setSortBy("dateCreation");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  // Changer de page
  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  // Rafraîchir les données
  const refresh = useCallback(() => {
    loadContrats(true);
  }, [loadContrats]);

  return {
    // Données
    contrats: paginatedContrats,
    allContrats: contrats,
    filteredContrats,
    selectedContrat,
    stats,

    // États de chargement
    loading,
    error,
    pdfGenerating,
    pdfError,

    // Pagination
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    setItemsPerPage,
    goToPage,

    // Filtres
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedMoniteurId,
    setSelectedMoniteurId,
    typeFormationFilter,
    setTypeFormationFilter,
    typePermisFilter,
    setTypePermisFilter,
    dateDebutFilter,
    setDateDebutFilter,
    dateFinFilter,
    setDateFinFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    availablePermisTypes,

    // Actions
    resetFilters,
    refresh,
    getContratById,
    generatePdf,
    setSelectedContrat,
  };
};