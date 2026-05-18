// src/api/candidatService.js
import api from "./axios";

//  Register candidat (avec création compte + token)
export const registerCandidat = async (data) => {
  const response = await api.post("/Candidats/register", data);
  return response.data;
};

//  Ajouter candidat (sans token)
export const createCandidat = async (data) => {
  const response = await api.post("/Candidats", data);
  return response.data;
};

//  Récupérer tous les candidats
export const getAllCandidats = async () => {
  const response = await api.get("/Candidats");
  return response.data;
};

//  Récupérer un candidat par ID
export const getCandidatById = async (id) => {
  const response = await api.get(`/Candidats/${id}`);
  return response.data;
};

//  Modifier un candidat
export const updateCandidat = async (id, data) => {
  const response = await api.put(`/Candidats/${id}`, data);
  return response.data;
};

//  Supprimer un candidat
export const deleteCandidat = async (id) => {
  const response = await api.delete(`/Candidats/${id}`);
  return response.data;
};
//  Archiver candidat
export const archiverCandidat = async (id) => {
  const response = await api.put(`/Candidats/archiver/${id}`);
  return response.data;
};
//  Pagination globale
export const getPagedCandidats = async (page = 1, pageSize = 10) => {
  const response = await api.get(
    `/Candidats/paged?page=${page}&pageSize=${pageSize}`,
  );
  return response.data;
};

//  Pagination par auto-école
export const getPagedCandidatsByAutoEcole = async (
  autoEcoleId,
  page = 1,
  pageSize = 10,
) => {
  const response = await api.get(
    `/Candidats/paged/auto-ecole/${autoEcoleId}?page=${page}&pageSize=${pageSize}`,
  );
  return response.data;
};
//  Récupérer le profil complet du candidat
export const getCandidatProfile = async (id, autoEcoleId) => {
  const response = await api.get(`/Candidats/${id}/profile?autoEcoleId=${autoEcoleId}`);
  return response.data;
};

/**
 * Mise à jour du profil candidat (corps attendu côté API).
 * id, nom, prenom, nomEpoux, numeroCIN, dates ISO, sexe, adresse { rue, ville, gouvernorat, pays },
 * compte { id, login, telephone }, idContrat, typePermisCode, typeFormation, centreExamen,
 * dossier { id, etatDossier, candidatId, documents: [{ id, statutDocument }] }
 */
export const updateCandidatProfil = async (id, data) => {
  const response = await api.put(`/Candidats/${id}`, data);
  return response.data;
};

/** Met à jour PhotoPath côté serveur (multipart). */
export const uploadCandidatPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/Candidats/upload-photo/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Télécharger fiche PDF candidat
export const getCandidatFichePdf = async (id, autoEcoleId) => {
  const response = await api.get(`/Candidats/${id}/fiche-pdf?autoEcoleId=${autoEcoleId}`, {
    responseType: "blob", // très important
  });

  return response.data;
};
export const getAllActiveCandidats = async () => {
  const response = await api.get("/Candidats/active");
  return response.data;
};

// Récupérer un candidat par CIN
export const getCandidatByCin = async (cin, autoEcoleId) => {
  const response = await api.get(`/Candidats/by-cin/${cin}?autoEcoleId=${autoEcoleId}`);
  return response.data;
};

// Réinscrire un candidat
export const reinscrireCandidat = async (id, data) => {
  const response = await api.post(`/Candidats/${id}/reinscrire`, data);
  return response.data;
};
