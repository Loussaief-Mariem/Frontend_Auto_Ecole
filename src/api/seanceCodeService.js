// src/api/seanceCodeService.js
import api from "./axios";

// 🔹 Planifier séance
export const planifierSeance = async (data) => {
  const res = await api.post("/seancecode", data);
  return res.data;
};

// 🔹 Get all
export const getAllSeances = async () => {
  const res = await api.get("/seancecode");
  return res.data;
};

// 🔹 Get by ID
export const getSeanceById = async (id) => {
  const res = await api.get(`/seancecode/${id}`);
  return res.data;
};

// 🔹 Get by secrétaire
export const getSeancesBySecretaire = async (id) => {
  const res = await api.get(`/seancecode/secretaire/${id}`);
  return res.data;
};

// 🔹 Get by date
export const getSeancesByDate = async (date) => {
  const res = await api.get(`/seancecode/date?date=${date}`);
  return res.data;
};

// 🔹 Ajouter participants
export const ajouterParticipants = async (id, candidatsIds) => {
  const res = await api.post(`/seancecode/${id}/participants`, candidatsIds);
  return res.data;
};

// 🔹 Update
export const updateSeance = async (seance) => {
  const res = await api.put("/seancecode", seance);
  return res.data;
};

// 🔹 Delete
export const deleteSeance = async (id) => {
  const res = await api.delete(`/seancecode/${id}`);
  return res.data;
};
