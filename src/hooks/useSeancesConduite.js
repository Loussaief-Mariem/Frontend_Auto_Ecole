// src/hooks/useSeancesConduite.js
import { useState, useEffect, useCallback } from "react";
import {
  getPlanningMoniteur,
  planifierSeanceConduite,
  marquerPresence,
  ajouterRemarque,
  annulerSeanceConduite,
  getPlanningMoniteurByDate,
} from "../api/seanceConduiteService";

export const useSeancesConduite = (moniteurId) => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger toutes les séances du moniteur
  const fetchSeances = useCallback(async () => {
    if (!moniteurId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getPlanningMoniteur(moniteurId);
      setSeances(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des séances",
      );
      console.error("Erreur fetchSeances:", err);
    } finally {
      setLoading(false);
    }
  }, [moniteurId]);

  // Charger les séances par date
  const fetchSeancesByDate = useCallback(
    async (date) => {
      if (!moniteurId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getPlanningMoniteurByDate(moniteurId, date);
        setSeances(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement des séances",
        );
        console.error("Erreur fetchSeancesByDate:", err);
      } finally {
        setLoading(false);
      }
    },
    [moniteurId],
  );

  // Planifier une nouvelle séance
  const planifier = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const nouvelleSeance = await planifierSeanceConduite(data);
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

  // Marquer la présence
  const marquerPresenceSeance = useCallback(async (seanceId, present) => {
    setLoading(true);
    try {
      const seance = await marquerPresence(seanceId, present);
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

  // Ajouter une remarque
  const ajouterRemarqueSeance = useCallback(
    async (seanceId, remarque, note) => {
      setLoading(true);
      try {
        const seance = await ajouterRemarque(seanceId, remarque, note);
        setSeances((prev) => prev.map((s) => (s.id === seanceId ? seance : s)));
        return seance;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de l'ajout de la remarque",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Annuler une séance
  const annulerSeance = useCallback(async (seanceId) => {
    setLoading(true);
    try {
      const seance = await annulerSeanceConduite(seanceId);
      setSeances((prev) => prev.map((s) => (s.id === seanceId ? seance : s)));
      return seance;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer les séances par statut
  const getSeancesByStatut = useCallback(
    (statut) => {
      return seances.filter((s) => s.estAnnulee === (statut === "annulee"));
    },
    [seances],
  );

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
        .filter((s) => new Date(s.date) > maintenant && !s.estAnnulee)
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
    marquerPresenceSeance,
    ajouterRemarqueSeance,
    annulerSeance,
    fetchSeances,
    fetchSeancesByDate,
    getSeancesByStatut,
    getSeancesAujourdhui,
    getProchainesSeances,
  };
};
