import { useState, useEffect, useCallback } from "react";
import {
  getCandidatProfile,
  updateCandidatProfil,
  uploadCandidatPhoto,
} from "../api/candidatService";

const useCandidatProfile = (candidatId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!candidatId) return;

    try {
      const data = await getCandidatProfile(candidatId);
      setProfile(data);
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
      await updateCandidatProfil(candidatId, updatedData);
      const fresh = await getCandidatProfile(candidatId);
      setProfile(fresh);
      return fresh;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors de la modification",
      );
    }
  };

  const uploadPhoto = useCallback(
    async (file) => {
      if (!candidatId || !file) return;
      try {
        await uploadCandidatPhoto(candidatId, file);
        const fresh = await getCandidatProfile(candidatId);
        setProfile(fresh);
        return fresh;
      } catch (err) {
        console.error("Erreur upload photo:", err);
        throw new Error(
          err.response?.data?.message ||
            "Échec du téléversement de la photo",
        );
      }
    },
    [candidatId],
  );

  const getAdresse = () => profile?.adresse ?? profile?.Adresse ?? null;
  const getCompte = () => profile?.compte ?? profile?.Compte ?? null;
  const getDossierCandidat = () =>
    profile?.dossierCandidat ?? profile?.DossierCandidat ?? null;
  const getContrats = () => profile?.contrats ?? profile?.Contrats ?? [];
  const getDocuments = () =>
    getDossierCandidat()?.documents ?? getDossierCandidat()?.Documents ?? [];

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
    uploadPhoto,

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
