// src/hooks/useSeancesCode.js
import { useState, useEffect, useCallback } from "react";
import {
  getAllSeancesCode,
  getSeancesCodeBySecretaire,
  planifierSeanceCode,
  ajouterParticipants,
  marquerPresenceCode,
  updateSeanceCode,
  deleteSeanceCode,
  getSeancesCodeByDate,
} from "../api/seanceCodeService";

export const useSeancesCode = (secretaireId = null) => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger toutes les séances ou celles d'un secrétaire
  const fetchSeances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = secretaireId
        ? await getSeancesCodeBySecretaire(secretaireId)
        : await getAllSeancesCode();
      setSeances(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des séances",
      );
      console.error("Erreur fetchSeances:", err);
    } finally {
      setLoading(false);
    }
  }, [secretaireId]);

  // Charger les séances par date
  const fetchSeancesByDate = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSeancesCodeByDate(date);
      setSeances(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des séances",
      );
      console.error("Erreur fetchSeancesByDate:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Planifier une nouvelle séance
  const planifier = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const nouvelleSeance = await planifierSeanceCode(data);
      setSeances((prev) => [...prev, nouvelleSeance]);
      return nouvelleSeance;
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la planification",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter des participants
  const ajouterParticipantsSeance = useCallback(
    async (seanceId, candidatsIds) => {
      setLoading(true);
      try {
        const seance = await ajouterParticipants(seanceId, candidatsIds);
        setSeances((prev) => prev.map((s) => (s.id === seanceId ? seance : s)));
        return seance;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de l'ajout des participants",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Marquer la présence d'un candidat
  const marquerPresence = useCallback(async (seanceId, candidatId, present) => {
    setLoading(true);
    try {
      const seance = await marquerPresenceCode(seanceId, candidatId, present);
      setSeances((prev) => prev.map((s) => (s.id === seanceId ? seance : s)));
      return seance;
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du marquage de présence",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une séance
  const mettreAJour = useCallback(async (seanceId, data) => {
    setLoading(true);
    try {
      const seance = await updateSeanceCode(seanceId, data);
      setSeances((prev) => prev.map((s) => (s.id === seanceId ? seance : s)));
      return seance;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une séance
  const supprimer = useCallback(async (seanceId) => {
    setLoading(true);
    try {
      await deleteSeanceCode(seanceId);
      setSeances((prev) => prev.filter((s) => s.id !== seanceId));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir les séances du jour
  const getSeancesAujourdhui = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return seances.filter((s) => s.date?.split("T")[0] === today);
  }, [seances]);

  // Obtenir les prochaines séances
  const getProchainesSeances = useCallback(
    (nombre = 5) => {
      const maintenant = new Date();
      return seances
        .filter((s) => new Date(s.date) > maintenant)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, nombre);
    },
    [seances],
  );

  useEffect(() => {
    fetchSeances();
  }, [fetchSeances]);

  return {
    seances,
    loading,
    error,
    planifier,
    ajouterParticipantsSeance,
    marquerPresence,
    mettreAJour,
    supprimer,
    fetchSeances,
    fetchSeancesByDate,
    getSeancesAujourdhui,
    getProchainesSeances,
  };
};
