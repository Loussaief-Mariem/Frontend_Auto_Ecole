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
    const response = await api.patch(`/Compte/activer/${id}`);
    return response.data;
  },

  //  Désactiver (si tu ajoutes backend)
  desactiverCompte: async (id) => {
    const response = await api.patch(`/Compte/desactiver/${id}`);
    return response.data;
  },

  //  Bloquer (si tu ajoutes backend)
  bloquerCompte: async (id) => {
    const response = await api.patch(`/Compte/bloquer/${id}`);
    return response.data;
  },
};

export default CompteService;
