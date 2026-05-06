// src/api/contratService.js
import api from "./axios";

// 🔹 Télécharger le contrat PDF
export const getContratPdf = async (id) => {
  const response = await api.get(`/Contrats/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

// 🔹 Récupérer tous les contrats par auto-école
export const getAllContratsByAutoEcole = async (autoEcoleId) => {
  const res = await api.get(`/contrats/autoecole/${autoEcoleId}`);
  // Normaliser la réponse
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

// 🔹 Récupérer tous les contrats par moniteur
export const getContratsByMoniteur = async (moniteurId) => {
  const res = await api.get(`/contrats/moniteur/${moniteurId}`);
  return res.data;
};

// 🔹 Contrats "Complet + Théorique"
export const getContratsCompletTheorique = async (autoEcoleId) => {
  const res = await api.get(`/contrats/autoecole/${autoEcoleId}/theorique`);
  // Normaliser la réponse
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

// 🔹 Contrats "Complet + Pratique" (avec filtre optionnel par moniteur)
export const getContratsCompletPratique = async (
  autoEcoleId,
  moniteurId = null,
) => {
  const url = moniteurId
    ? `/contrats/autoecole/${autoEcoleId}/pratique?moniteurId=${moniteurId}`
    : `/contrats/autoecole/${autoEcoleId}/pratique`;
  const res = await api.get(url);
 
  console.log("Réponse API getContratsCompletPratique:", res.data);

  // Normaliser la réponse pour toujours retourner un tableau
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return res.data.data;
  }

  if (Array.isArray(res.data)) {
    return res.data;
  }

  return [];
};
