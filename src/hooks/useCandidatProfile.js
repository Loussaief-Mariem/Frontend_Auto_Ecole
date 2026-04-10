import { useState, useEffect, useCallback } from "react";
import { getCandidatProfile, updateCandidat } from "../api/candidatService";

const useCandidatProfile = (candidatId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!candidatId) return;

    try {
      const data = await getCandidatProfile(candidatId);
      setProfile(data);
      console.log(data);
      return data;
    } catch (err) {
      console.error("Erreur lors du chargement du profil complet:", err);
      setError("Impossible de charger le profil complet du candidat");
      throw err;
    }
  }, [candidatId]);

  useEffect(() => {
    const load = async () => {
      if (!candidatId) {
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
  }, [candidatId, fetchProfile]);

  const updateCandidatInfo = async (updatedData) => {
    try {
      const response = await updateCandidat(candidatId, updatedData);

      setProfile((prev) => (prev ? { ...prev, ...response } : null));

      return response;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors de la modification",
      );
    }
  };

  const getAdresse = () => profile?.adresse || null;
  const getCompte = () => profile?.compte || null;
  const getDossierCandidat = () => profile?.dossierCandidat || null;
  const getContrats = () => profile?.contrats || [];
  const getDocuments = () => profile?.dossierCandidat?.documents || [];

  const getContratActif = () => {
    const contrats = getContrats();
    return contrats.length > 0 ? contrats[0] : null;
  };

  return {
    candidat: profile,
    profile,
    loading,
    error,

    updateCandidat: updateCandidatInfo,

    adresse: getAdresse(),
    compte: getCompte(),
    dossierCandidat: getDossierCandidat(),
    contrats: getContrats(),
    documents: getDocuments(),
    contratActif: getContratActif(),

    getAdresse,
    getCompte,
    getDossierCandidat,
    getContrats,
    getDocuments,
    getContratActif,

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
