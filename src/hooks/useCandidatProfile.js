import { useState, useEffect, useCallback } from "react";
import {
  getCandidatProfile,
  updateCandidatProfil,
  uploadCandidatPhoto,
} from "../api/candidatService";

const useCandidatProfile = (candidatId, autoEcoleId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const fetchProfile = useCallback(async () => {
    if (!candidatId || !autoEcoleId) return;
 
    try {
      const data = await getCandidatProfile(candidatId, autoEcoleId);
      
      console.log("Données brutes du candidat:", data);
      setProfile(data);
      console.log("Profil complet du candidat chargé:", data);
 
      return data;
    } catch (err) {
      console.error("Erreur lors du chargement du profil complet:", err);
      setError("Impossible de charger le profil complet du candidat");
      throw err;
    }
  }, [candidatId, autoEcoleId]);
 
  useEffect(() => {
    const load = async () => {
      if (!candidatId || !autoEcoleId) {
        setProfile(null);
        setLoading(false);
        return;
      }
 
      setLoading(true);
      setError("");
      try {
        await fetchProfile();
      } catch {
        /* déjà journalisé dans fetchProfile */
      } finally {
        setLoading(false);
      }
    };
 
    load();
  }, [candidatId, autoEcoleId, fetchProfile]);
 
  const updateCandidatInfo = async (updatedData) => {
    try {
      await updateCandidatProfil(candidatId, updatedData);
      const fresh = await getCandidatProfile(candidatId, autoEcoleId);
      setProfile(fresh);
      return fresh;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors de la modification",
      );
    }
  };
 
  const uploadPhoto = useCallback(
    async (file) => {
      if (!candidatId || !file) return;
      try {
        await uploadCandidatPhoto(candidatId, file);
        const fresh = await getCandidatProfile(candidatId, autoEcoleId);
        setProfile(fresh);
        return fresh;
      } catch (err) {
        console.error("Erreur upload photo:", err);
        throw new Error(
          err.response?.data?.message || "Échec du téléversement de la photo",
        );
      }
    },
    [candidatId, autoEcoleId],
  );
 
  const getAdresse = () => profile?.adresse ?? profile?.Adresse ?? null;
  const getCompte = () => profile?.compte ?? profile?.Compte ?? null;
  const getDossierCandidat = () =>
    profile?.dossierCandidat ?? profile?.DossierCandidat ?? null;
  const getContrats = () => profile?.contrat ? [profile.contrat] : [];
  const getDocuments = () =>
    getDossierCandidat()?.documents ?? getDossierCandidat()?.Documents ?? [];
 
  // Ajout: Récupérer les séances de code
  const getSeancesCode = () =>
    profile?.seancesCode ?? profile?.SeancesCode ?? [];
 
  // Ajout: Récupérer les séances pratiques (si existent)
  const getSeancesPratique = () =>
    profile?.seancesPratique ?? profile?.SeancesPratique ?? [];
 
  const getContratActif = () => {
    return profile?.contrat ?? null;
  };

  // Ajout: Vérifier si le candidat a des séances
  const hasSeances = () => {
    const seancesCode = getSeancesCode();
    const seancesPratique = getSeancesPratique();
    return seancesCode.length > 0 || seancesPratique.length > 0;
  };

  // Ajout: Récupérer toutes les séances (code + pratique)
  const getAllSeances = () => {
    const seancesCode = getSeancesCode();
    const seancesPratique = getSeancesPratique();

    // Transformer les séances de code
    const formattedCodeSeances = seancesCode.map((seance) => ({
      ...seance,
      type: "code",
      typeLabel: "Séance de code",
    }));

    // Transformer les séances pratiques
    const formattedPratiqueSeances = seancesPratique.map((seance) => ({
      ...seance,
      type: "pratique",
      typeLabel: "Séance de conduite",
    }));

    // Combiner et trier par date
    return [...formattedCodeSeances, ...formattedPratiqueSeances].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  };

  // Ajout: Récupérer les séances à venir
  const getSeancesAVenir = () => {
    const allSeances = getAllSeances();
    const now = new Date();
    return allSeances.filter((seance) => {
      const seanceDate = new Date(seance.date);
      return seanceDate >= now && !seance.estAnnulee;
    });
  };

  // Ajout: Récupérer les séances passées
  const getSeancesPassees = () => {
    const allSeances = getAllSeances();
    const now = new Date();
    return allSeances.filter((seance) => {
      const seanceDate = new Date(seance.date);
      return seanceDate < now || seance.estAnnulee;
    });
  };

  // Ajout: Calculer le nombre total d'heures de séances
  const getTotalHeures = () => {
    const allSeances = getAllSeances();
    return allSeances.reduce((total, seance) => {
      const heures = seance.dureeMinutes ? seance.dureeMinutes / 60 : 0;
      return total + heures;
    }, 0);
  };

  // Ajout: Vérifier si le candidat a assisté à une séance spécifique
  const isPresentToSeance = (seanceId) => {
    const allSeances = getAllSeances();
    const seance = allSeances.find((s) => s.id === seanceId);
    if (!seance || !seance.participants) return false;

    const currentParticipant = seance.participants.find(
      (p) => p.candidatId === parseInt(candidatId),
    );
    return currentParticipant?.present || false;
  };

  return {
    // Données principales
    candidat: profile,
    profile,
    loading,
    error,

    // Actions
    updateCandidat: updateCandidatInfo,
    uploadPhoto,

    // Getters principaux
    adresse: getAdresse(),
    compte: getCompte(),
    dossierCandidat: getDossierCandidat(),
    contrats: getContrats(),
    documents: getDocuments(),
    contratActif: getContratActif(),

    // Nouveaux getters pour les séances
    seancesCode: getSeancesCode(),
    seancesPratique: getSeancesPratique(),
    allSeances: getAllSeances(),
    seancesAVenir: getSeancesAVenir(),
    seancesPassees: getSeancesPassees(),
    totalHeures: getTotalHeures(),
    hasSeances: hasSeances(),

    // Fonctions utilitaires
    getAdresse,
    getCompte,
    getDossierCandidat,
    getContrats,
    getDocuments,
    getContratActif,
    getSeancesCode,
    getSeancesPratique,
    getAllSeances,
    getSeancesAVenir,
    getSeancesPassees,
    getTotalHeures,
    isPresentToSeance,

    // Rafraîchissement
    refreshProfile: fetchProfile,
    refreshData: async () => {
      setLoading(true);
      setError("");
      try {
        await fetchProfile();
      } finally {
        setLoading(false);
      }
    },
  };
};

export default useCandidatProfile;
