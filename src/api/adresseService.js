import api from "./axios"; // ton fichier axios

const AdresseService = {
  // ------------------------------
  // CRUD
  // ------------------------------

  createAdresse: async (data) => {
    const response = await api.post("/adresse", data);
    return response.data;
  },

  getAdresseById: async (id) => {
    const response = await api.get(`/adresse/${id}`);
    return response.data;
  },

  getAllAdresses: async () => {
    const response = await api.get("/adresse");
    return response.data;
  },

  updateAdresse: async (id, data) => {
    const response = await api.put(`/adresse/${id}`, data);
    return response.data;
  },

  deleteAdresse: async (id) => {
    await api.delete(`/adresse/${id}`);
  },

  // ------------------------------
  // Pays / Villes / Gouvernorats
  // ------------------------------
  // les api publique pour les listes déroulantes

  getPays: async () => {
    const response = await api.get("/adresse/pays");
    return response.data;
  },

  getVillesByPays: async (pays) => {
    const response = await api.get(`/adresse/villes/${pays}`);
    return response.data;
  },

  getGouvernoratsByPays: async (pays) => {
    const response = await api.get(`/adresse/gouvernorats/${pays}`);
    return response.data;
  },
  getVillesByPaysEtGouvernorats: async (pays, gouvernorat) => {
    const reponse = await api.get(`/adresse/villes/${pays}/${gouvernorat}`);
    return reponse.data;
  },
};

export default AdresseService;
