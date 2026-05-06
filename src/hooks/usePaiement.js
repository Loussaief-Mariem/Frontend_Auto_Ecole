// src/hooks/usePaiement.js
import { useCallback, useEffect, useState } from "react";
import * as PaiementService from "../api/paiementService";

export default function usePaiement(contratId) {
  const [historique, setHistorique] = useState([]);
  const [situation, setSituation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistorique = useCallback(async () => {
    if (!contratId) return;
    setLoading(true);
    try {
      const data = await PaiementService.getHistorique(contratId);
      setHistorique(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  }, [contratId]);

  const fetchSituation = useCallback(async () => {
    if (!contratId) return;
    setLoading(true);
    try {
      const data = await PaiementService.getSituation(contratId);
      setSituation(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement de la situation");
    } finally {
      setLoading(false);
    }
  }, [contratId]);

  const addPaiement = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await PaiementService.createPaiement(payload);
      await fetchHistorique();
      await fetchSituation();
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du paiement");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contratId) {
      fetchHistorique();
      fetchSituation();
    }
  }, [contratId, fetchHistorique, fetchSituation]);

  return {
    historique,
    situation,
    loading,
    error,
    addPaiement,
    refresh: () => {
      fetchHistorique();
      fetchSituation();
    }
  };
}
