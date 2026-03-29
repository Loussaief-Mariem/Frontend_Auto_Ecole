import api from "./axios";

//  Créer un moniteur (register)
export const registerMoniteur = async (data) => {
  const response = await api.post("/Moniteur/register", data);
  return response.data;
};

//  Récupérer tous les moniteurs
export const getAllMoniteurs = async () => {
  const response = await api.get("/Moniteur");
  return response.data;
};

//  Récupérer un moniteur par ID
export const getMoniteurById = async (id) => {
  const response = await api.get(`/Moniteur/${id}`);
  return response.data;
};

//  Modifier un moniteur
export const updateMoniteur = async (id, data) => {
  const response = await api.put(`/Moniteur/${id}`, data);
  return response.data;
};

//  Supprimer un moniteur
export const deleteMoniteur = async (id) => {
  const response = await api.delete(`/Moniteur/${id}`);
  return response.data;
};
