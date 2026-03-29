// src/api/typePermis.js
import axiosInstance from "./axios"; // ton instance axios configurée

// 🔹 Récupérer tous les codes de TypePermis
export const getAllTypePermisCodes = async () => {
  try {
    const response = await axiosInstance.get("/TypePermis/codes");
    return response.data; // la liste des codes
  } catch (error) {
    console.error("Erreur lors de la récupération des codes de permis:", error);
    throw error;
  }
};

// 🔹 Récupérer tous les TypePermis complets
export const getAllTypePermis = async () => {
  try {
    const response = await axiosInstance.get("/TypePermis");
    return response.data; // la liste complète des TypePermis
  } catch (error) {
    console.error("Erreur lors de la récupération des TypePermis:", error);
    throw error;
  }
};

// 🔹 Récupérer un TypePermis par code
export const getTypePermisByCode = async (code) => {
  try {
    const response = await axiosInstance.get(`/TypePermis/${code}`);
    return response.data; // un seul TypePermis
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du TypePermis ${code}:`,
      error,
    );
    throw error;
  }
};
