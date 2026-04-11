// hooks/useCandidatsList.js
import { useState, useEffect, useCallback } from "react";
import { getPagedCandidatsByAutoEcole } from "../api/candidatService";
import usePagination from "../components/common/pagination/usePagination"; // Correction du chemin

const useCandidatsList = (autoEcoleId) => {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    page,
    pageSize,
    total,
    setTotal,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(1, 10);

  const fetchCandidats = useCallback(async () => {
    if (!autoEcoleId) return;

    setLoading(true);
    setError("");

    try {
      const response = await getPagedCandidatsByAutoEcole(
        autoEcoleId,
        page,
        pageSize,
      );

      // Adaptation selon la structure de votre API
      // La réponse contient: { data: [], totalCount: number, page: number, pageSize: number }
      setCandidats(response.data || []);
      setTotal(response.totalCount || 0);
    } catch (err) {
      setError("Erreur lors du chargement des candidats");
      console.error("Erreur fetch candidats:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, autoEcoleId, setTotal]);

  useEffect(() => {
    fetchCandidats();
  }, [fetchCandidats]);

  const handleRefresh = () => {
    fetchCandidats();
  };

  return {
    candidats,
    loading,
    error,
    totalCount: total,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
    fetchCandidats,
  };
};

export default useCandidatsList;
