import { useState, useCallback, useEffect } from "react";
import { getCandidatProfile, updateCandidatProfil, uploadCandidatPhoto } from "../api/candidatService";

export const useCandidat = (candidatId, autoEcoleId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!candidatId || !autoEcoleId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidatProfile(candidatId, autoEcoleId);
      setProfile(data);
      console.log("Profil candidat chargé:", data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [candidatId, autoEcoleId]);

  const updateProfile = async (data) => {
    setUpdating(true);
    setError(null);
    try {
      const result = await updateCandidatProfil(candidatId, data);
      await fetchProfile(); // Recharger le profil après mise à jour
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const uploadPhoto = async (file) => {
    setUpdating(true);
    try {
      const result = await uploadCandidatPhoto(candidatId, file);
      setProfile(prev => ({ ...prev, photoPath: result.photoPath }));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'upload de la photo");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    uploadPhoto,
    refresh: fetchProfile
  };
};
