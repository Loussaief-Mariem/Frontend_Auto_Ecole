import { useState, useEffect, useCallback, useMemo } from "react";
import { getSeancesByAutoEcole } from "../api/seanceCodeService";
import { getAllSeancesConduite, getPlanningMoniteur } from "../api/seanceConduiteService";

export const useSeancesGlobales = (user) => {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSeances = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const autoEcoleId = user?.user?.idAutoEcole || user?.autoEcoleId || user?.user?.autoEcoleId;
      const role = user?.role || user?.user?.role;
      const userId = user?.id || user?.user?.id;

      if (!autoEcoleId) {
        setSeances([]);
        return;
      }

      let codeData = [];
      let conduiteData = [];

      // Fetch Code Sessions (for Proprietaire and Secretaire)
      if (role === "Proprietaire" || role === "Secretaire") {
        const resCode = await getSeancesByAutoEcole(autoEcoleId);
        if (Array.isArray(resCode)) codeData = resCode;
        else if (resCode?.data && Array.isArray(resCode.data)) codeData = resCode.data;
        else if (resCode?.data?.data && Array.isArray(resCode.data.data)) codeData = resCode.data.data;
        
        // Add type for differentiation
        codeData = codeData.map(s => ({ ...s, globalType: "code" }));
      }

      // Fetch Conduite Sessions
      if (role === "Proprietaire" || role === "Secretaire") {
        // Proprietaire and Secretaire can see all auto-ecole sessions
        const resConduite = await getAllSeancesConduite(autoEcoleId);
        if (Array.isArray(resConduite)) conduiteData = resConduite;
        else if (resConduite?.data && Array.isArray(resConduite.data)) conduiteData = resConduite.data;
        else if (resConduite?.data?.data && Array.isArray(resConduite.data.data)) conduiteData = resConduite.data.data;
      } else if (role === "Moniteur") {
        // Moniteur only sees their own conduite sessions
        const resConduite = await getPlanningMoniteur(userId);
        if (Array.isArray(resConduite)) conduiteData = resConduite;
        else if (resConduite?.data && Array.isArray(resConduite.data)) conduiteData = resConduite.data;
        else if (resConduite?.data?.data && Array.isArray(resConduite.data.data)) conduiteData = resConduite.data.data;
      }

      // Add type for differentiation
      conduiteData = conduiteData.map(s => ({ ...s, globalType: "conduite" }));

      setSeances([...codeData, ...conduiteData]);
    } catch (err) {
      console.error("Erreur chargement séances globales:", err);
      setError(err.message || "Erreur lors du chargement des séances.");
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSeances();
  }, [loadSeances]);

  return {
    seances,
    loading,
    error,
    refresh: loadSeances,
  };
};
