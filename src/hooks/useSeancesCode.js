import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getSeancesByAutoEcole,
  annulerSeance,
  desannulerSeance,
} from "../api/seanceCodeService";
import {
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parseISO,
} from "date-fns";

export const useSeancesCode = (user) => {
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
        const autoEcoleId = user?.user?.idAutoEcole || user?.autoEcoleId;
        if (!autoEcoleId) {
          setSeances([]);
          return;
        }
        const response = await getSeancesByAutoEcole(autoEcoleId);

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
    [user],
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

      // Search filter (Theme)
      if (
        searchTerm &&
        !seance.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

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

  const handleAnnuler = async (id) => {
    await annulerSeance(id);
    await loadSeances(true);
  };

  const handleDesannuler = async (id) => {
    await desannulerSeance(id);
    await loadSeances(true);
  };

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
    handleAnnuler,
    handleDesannuler,
  };
};
