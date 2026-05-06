// paiementService.js
import api from "../api/axios";

// ===============================
//  PAIEMENT SERVICE
// ===============================

// ➜ Créer un paiement
export const createPaiement = async (data) => {
  const response = await api.post("/paiement", data);
  return response.data;
};

// ➜ Historique des paiements d’un contrat
export const getHistorique = async (contratId) => {
  const response = await api.get(`/paiement/historique/${contratId}`);
  return response.data;
};

// ➜ Situation financière d’un contrat
export const getSituation = async (contratId) => {
  const response = await api.get(`/paiement/situation/${contratId}`);
  return response.data;
};
