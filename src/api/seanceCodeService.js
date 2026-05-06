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

//  Get by ID
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

// 🔹 Marquer présence
export const marquerPresence = async (seanceId, contratId, present) => {
  const res = await api.post(
    `/seancecode/${seanceId}/presence?contratId=${contratId}&present=${present}`,
  );
  return res.data;
};
// 🔹 Annuler séance
export const annulerSeance = async (id) => {
  const res = await api.put(`/seancecode/${id}/annuler`);
  return res.data;
};
// 🔹 Désannuler séance
export const desannulerSeance = async (id) => {
  const res = await api.put(`/seancecode/${id}/desannuler`);
  return res.data;
};

// 🔹 Retirer un participant
export const retirerParticipant = async (seanceId, candidatId) => {
  const res = await api.delete(`/seancecode/${seanceId}/participants/${candidatId}`);
  return res.data;
};
// 🔹 Ajouter remarque et note pour un participant
export const ajouterRemarqueEtNote = async (
  seanceId,
  contratId,
  remarque,
  note,
) => {
  const params = new URLSearchParams();
  params.append("contratId", contratId);
  params.append("remarque", remarque);
  if (note !== null && note !== undefined) {
    params.append("note", note);
  }

  const res = await api.post(
    `/seancecode/${seanceId}/remarque?${params.toString()}`,
  );
  return res.data;
};
// 🔹 NOUVEAU - Get seances by auto ecole
export const getSeancesByAutoEcole = async (autoEcoleId) => {
  const res = await api.get(`/seancecode/autoecole/${autoEcoleId}`); 
  
  return res.data;
};

// 🔹 NOUVEAU - Get seances by contrat
export const getSeancesByContrat = async (contratId) => {
  const res = await api.get(`/seancecode/contrat/${contratId}`);
  return res.data;
};

// 🔹 NOUVEAU - Get seances by secrétaire and date
export const getBySecretaireAndDate = async (id, date) => {
  const res = await api.get(`/seancecode/secretaire/${id}/date?date=${date}`);
  return res.data;
};
