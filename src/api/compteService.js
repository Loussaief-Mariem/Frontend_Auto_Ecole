// src/api/compteService.js
import api from "./axios";

const CompteService = {
  // ------------------------------
  // CRUD
  // ------------------------------

  //  Récupérer tous les comptes
  getAllComptes: async () => {
    const response = await api.get("/Compte");
    return response.data;
  },

  //  Récupérer un compte par ID
  getCompteById: async (id) => {
    const response = await api.get(`/Compte/${id}`);
    return response.data;
  },

  //  Créer un compte
  createCompte: async (data) => {
    const response = await api.post("/Compte", data);
    return response.data;
  },

  // In compteService.js - updateCompte method
  updateCompte: async (data) => {
    console.log("Sending PUT request to /Compte with data:", data);
    try {
      const response = await api.put("/Compte", data);
      console.log("Response:", response);
      return response.data;
    } catch (error) {
      console.error("Error response:", error.response);
      throw error;
    }
  },

  //  Supprimer un compte
  deleteCompte: async (id) => {
    const response = await api.delete(`/Compte/${id}`);
    return response.data;
  },

  // ------------------------------
  // Actions sur le compte
  // ------------------------------

  //  Activer un compte
  activerCompte: async (id) => {
    const res = await api.patch(`/Compte/activer/${id}`);
    return res.data;
  },

  bloquerCompte: async (id) => {
    const res = await api.patch(`/Compte/compte/${id}/bloquer`);
    return res.data;
  },

  debloquerCompte: async (id) => {
    const res = await api.patch(`/Compte/compte/${id}/debloquer`);
    return res.data;
  },
};

export default CompteService;
