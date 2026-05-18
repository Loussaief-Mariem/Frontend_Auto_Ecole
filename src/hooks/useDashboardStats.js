import { useEffect, useState, useCallback } from "react";
import { getDashboardStats } from "../api/dashboardService";

const useDashboardStats = (autoEcoleId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!autoEcoleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats(autoEcoleId);
      setStats(data);
    } catch (err) {
      console.error("Erreur dashboard stats:", err);
      setError("Impossible de charger les statistiques du tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, [autoEcoleId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default useDashboardStats;
