// src/api/seanceConduiteService.js
import api from "./axios";

// 🔹 Planifier séance conduite
export const planifierSeanceConduite = async (data) => {
  const res = await api.post("/seance-conduite", data);
  return res.data;
};

// 🔹 Get planning moniteur
export const getPlanningMoniteur = async (id) => {
  const res = await api.get(`/seance-conduite/moniteur/${id}`);
  return res.data;
};

// 🔹 Marquer présence
export const marquerPresence = async (id, present) => {
  const res = await api.put(
    `/seance-conduite/${id}/presence?present=${present}`,
  );
  return res.data;
};

// 🔹 Ajouter remarque + note
export const ajouterRemarque = async (id, remarque, note) => {
  const res = await api.put(
    `/seance-conduite/${id}/remarque?remarque=${remarque}&note=${note}`,
  );
  return res.data;
};

//  Annuler séance
export const annulerSeanceConduite = async (id) => {
  const res = await api.put(`/seance-conduite/${id}/annuler`);
  return res.data;
};

//  Désannuler séance
export const desannulerSeance = async (id) => {
  const res = await api.put(`/seance-conduite/${id}/desannuler`);
  return res.data;
};

//  Planning moniteur par date
export const getPlanningMoniteurByDate = async (id, date) => {
  const res = await api.get(
    `/seance-conduite/moniteur/${id}/date?date=${date}`,
  );
  return res.data;
};
// 🔹 Planifier plusieurs séances
export const planifierSeancesBatch = async (seances) => {
  const res = await api.post("/seance-conduite/batch", seances);
  return res.data;
};
