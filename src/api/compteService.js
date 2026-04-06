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

  //  Modifier un compte
  updateCompte: async (data) => {
    const response = await api.put("/Compte", data);
    return response.data;
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
