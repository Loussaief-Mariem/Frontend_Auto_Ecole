import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getPlanningMoniteur,
  planifierSeanceConduite,
  planifierSeancesConduiteBatch,
  annulerSeanceConduite,
  desannulerSeance,
  marquerPresence,
  ajouterRemarque,
  modifierSeanceConduite,
} from "../api/seanceConduiteService";
import {
  isAfter,
  isBefore,
  startOfDay,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export const useSeancesConduite = (moniteurId) => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [tabValue, setTabValue] = useState(0); // 0: Upcoming, 1: Past, 2: Cancelled

  const loadSeances = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);
      try {
        if (!moniteurId) {
          setSeances([]);
          return;
        }
        const response = await getPlanningMoniteur(moniteurId);

        let seancesData = [];
        if (Array.isArray(response)) seancesData = response;
        else if (response.data && Array.isArray(response.data))
          seancesData = response.data;
        else if (response.data?.data && Array.isArray(response.data.data))
          seancesData = response.data.data;

        setSeances(seancesData);
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [moniteurId],
  );

  useEffect(() => {
    loadSeances();
  }, [loadSeances]);

  const filteredSeances = useMemo(() => {
    const now = startOfDay(new Date());

    return seances.filter((seance) => {
      const seanceDate = parseISO(seance.date);
      const isCancelled = seance.estAnnulee;
      const isPast = isBefore(seanceDate, now) && !isSameDay(seanceDate, now);
      const isUpcoming = isAfter(seanceDate, now) || isSameDay(seanceDate, now);

      // Category filter (Tabs)
      if (tabValue === 0 && (isCancelled || isPast)) return false; // Upcoming
      if (tabValue === 1 && (isCancelled || isUpcoming)) return false; // Past
      if (tabValue === 2 && !isCancelled) return false; // Cancelled

      // Search filter (Candidate name)
      if (searchTerm) {
        const fullName =
          `${seance.candidat?.prenom || ""} ${seance.candidat?.nom || ""}`.toLowerCase();
        if (!fullName.includes(searchTerm.toLowerCase())) return false;
      }

      // Date Range filter
      if (dateFilter === "today" && !isSameDay(seanceDate, now)) return false;
      if (
        dateFilter === "week" &&
        (!isAfter(seanceDate, startOfWeek(now)) ||
          !isBefore(seanceDate, endOfWeek(now)))
      )
        return false;
      if (
        dateFilter === "month" &&
        (!isAfter(seanceDate, startOfMonth(now)) ||
          !isBefore(seanceDate, endOfMonth(now)))
      )
        return false;

      return true;
    });
  }, [seances, tabValue, searchTerm, dateFilter]);

  const counts = useMemo(() => {
    const now = startOfDay(new Date());
    return {
      upcoming: seances.filter(
        (s) =>
          !s.estAnnulee &&
          (isAfter(parseISO(s.date), now) || isSameDay(parseISO(s.date), now)),
      ).length,
      past: seances.filter(
        (s) =>
          !s.estAnnulee &&
          isBefore(parseISO(s.date), now) &&
          !isSameDay(parseISO(s.date), now),
      ).length,
      cancelled: seances.filter((s) => s.estAnnulee).length,
    };
  }, [seances]);

  const planifier = useCallback(
    async (data) => {
      setLoading(true);
      try {
        if (Array.isArray(data)) {
          await planifierSeancesConduiteBatch(data);
        } else {
          await planifierSeanceConduite(data);
        }
        await loadSeances(true);
        return true;
      } catch (err) {
        setError(err.message || "Erreur lors de la planification");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadSeances],
  );

  const modifier = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        await modifierSeanceConduite(id, data);
        await loadSeances(true);
        return true;
      } catch (err) {
        setError(err.message || "Erreur lors de la modification");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadSeances],
  );

  const handleAnnuler = async (id) => {
    await annulerSeanceConduite(id);
    await loadSeances(true);
  };

  const handleDesannuler = async (id) => {
    await desannulerSeance(id);
    await loadSeances(true);
  };

  const marquerPresenceSeance = useCallback(
    async (seanceId, present) => {
      setLoading(true);
      try {
        await marquerPresence(seanceId, present);
        await loadSeances(true);
      } catch (err) {
        setError(err.message || "Erreur lors du marquage de présence");
      } finally {
        setLoading(false);
      }
    },
    [loadSeances],
  );

  const ajouterRemarqueSeance = useCallback(
    async (seanceId, contratId, remarque, note) => {
      setLoading(true);
      try {
        await ajouterRemarque(seanceId, remarque, note);
        await loadSeances(true);
      } catch (err) {
        setError(err.message || "Erreur lors de l'ajout de la remarque");
      } finally {
        setLoading(false);
      }
    },
    [loadSeances],
  );

  return {
    seances,
    filteredSeances,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    tabValue,
    setTabValue,
    counts,
    refresh: loadSeances,
    planifier,
    modifier,
    handleAnnuler,
    handleDesannuler,
    marquerPresenceSeance,
    ajouterRemarqueSeance,
  };
};
