// src/api/contratService.js
import api from "./axios";

// 🔹 Télécharger le contrat PDF
export const getContratPdf = async (id) => {
  const response = await api.get(`/Contrats/${id}/pdf`, {
    responseType: "blob", // ⚠️ obligatoire pour PDF
  });

  return response.data;
};
