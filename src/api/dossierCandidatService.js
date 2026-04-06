// src/api/dossierCandidatService.js
import api from "../api/axios";

// Service pour gérer les dossiers candidats
const DossierCandidatService = {
  // 🔹 Récupérer tous les dossiers
  getAll: async () => {
    try {
      const response = await api.get("/dossiers");
      return response.data;
    } catch (error) {
      console.error("Erreur getAll:", error);
      throw error;
    }
  },

  // Récupérer un dossier par id
  getById: async (id) => {
    try {
      const response = await api.get(`/dossiers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getById(${id}):`, error);
      throw error;
    }
  },

  //  Créer un nouveau dossier
  create: async (dossierData) => {
    try {
      const response = await api.post("/dossiers", dossierData);
      return response.data;
    } catch (error) {
      console.error("Erreur create:", error);
      throw error;
    }
  },

  // 🔹 Supprimer un dossier par id
  delete: async (id) => {
    try {
      await api.delete(`/dossiers/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur delete(${id}):`, error);
      throw error;
    }
  },
};

export default DossierCandidatService;
