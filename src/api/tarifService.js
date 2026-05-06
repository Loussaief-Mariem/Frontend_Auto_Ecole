// src/api/tarifService.js
import api from "../api/axios";

// 🔹 créer ou mettre à jour un tarif
export const createOrUpdateTarif = async (data) => {
  try {
    const response = await api.post("/tarifs", data);
    return response.data;
  } catch (error) {
    console.error("Erreur createOrUpdateTarif:", error);
    throw error;
  }
};

// 🔹 récupérer les tarifs d'une auto-école
export const getTarifsByAutoEcole = async (autoEcoleId) => {
  try {
    const response = await api.get(`/tarifs/autoecole/${autoEcoleId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur getTarifsByAutoEcole:", error);
    throw error;
  }
};

// 🔹 créer plusieurs tarifs
export const createManyTarifs = async (data) => {
  try {
    const response = await api.post("/tarifs/collection", data);
    return response.data;
  } catch (error) {
    console.error("Erreur createManyTarifs:", error);
    throw error;
  }
};

// 🔹 update plusieurs tarifs
export const updateManyTarifs = async (data) => {
  try {
    const response = await api.put("/tarifs/collection", data);
    return response.data;
  } catch (error) {
    console.error("Erreur updateManyTarifs:", error);
    throw error;
  }
};
