// src/hooks/useExamens.js
import { useState, useEffect, useCallback } from "react";
import ExamenService from "../api/ExamenService";

const useExamens = (contratId) => {
  const [examensAVenir, setExamensAVenir] = useState([]);
  const [historiqueExamens, setHistoriqueExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExamens = useCallback(async () => {
    console.log("Chargement des examens pour contratId:", contratId);
    if (!contratId) return;

    setLoading(true);
    setError(null);
    try {
      const [avenir, historique] = await Promise.all([
        ExamenService.getExamensAVenir(contratId),
        ExamenService.getHistorique(contratId),
      ]);
      setExamensAVenir(avenir || []);
      setHistoriqueExamens(historique || []);
      console.log("Examens à venir chargés:", avenir);
      console.log("Historique des examens chargé:", historique);
    } catch (err) {
      console.error("Erreur chargement examens:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement des examens",
      );
    } finally {
      setLoading(false);
    }
  }, [contratId]);

  useEffect(() => {
    loadExamens();
  }, [loadExamens]);

  const programmerExamen = async (data) => {
    console.log("Données pour programmer examen:", data);
    try {
      const result = await ExamenService.programmer(data);
      await loadExamens();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const enregistrerResultat = async (data) => {
    try {
      const result = await ExamenService.enregistrerResultat(data);
      await loadExamens();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const reporterExamen = async (data) => {
    try {
      const result = await ExamenService.reporter(data);
      await loadExamens();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const telechargerConvocation = async (examenId) => {
    try {
      await ExamenService.downloadPdf(examenId);
    } catch (err) {
      throw err;
    }
  };

  return {
    examensAVenir,
    historiqueExamens,
    loading,
    error,
    programmerExamen,
    enregistrerResultat,
    reporterExamen,
    telechargerConvocation,
    refresh: loadExamens,
  };
};

export default useExamens;
