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
