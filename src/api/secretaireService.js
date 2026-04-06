// src/api/secretaireService.js
import api from "./axios";

// Register secrétaire
export const registerSecretaire = async (data) => {
  const response = await api.post("/Secretaire/register", data);
  return response.data;
};

//  Récupérer toutes les secrétaires
export const getAllSecretaires = async () => {
  const response = await api.get("/Secretaire");
  return response.data;
};

//  Récupérer une secrétaire par ID
export const getSecretaireById = async (id) => {
  const response = await api.get(`/Secretaire/${id}`);
  return response.data;
};

//  Modifier une secrétaire
export const updateSecretaire = async (id, data) => {
  const response = await api.put(`/Secretaire/${id}`, data);
  return response.data;
};

// Supprimer une secrétaire
export const deleteSecretaire = async (id) => {
  const response = await api.delete(`/Secretaire/${id}`);
  return response.data;
};

// Secretaire
export const archiverSecretaire = async (id) => {
  const res = await api.put(`/Secretaire/archiver/${id}`);
  return res.data;
};
//  Pagination globale
export const getPagedSecretaires = async (page = 1, pageSize = 10) => {
  const response = await api.get(
    `/Secretaire/paged?page=${page}&pageSize=${pageSize}`,
  );
  return response.data;
};

//  Pagination par auto-école
export const getPagedSecretairesByAutoEcole = async (
  autoEcoleId,
  page = 1,
  pageSize = 10,
) => {
  const response = await api.get(
    `/Secretaire/paged/auto-ecole/${autoEcoleId}?page=${page}&pageSize=${pageSize}`,
  );
  return response.data;
};
