import axios from "../api/axios";

const BASE_URL = "/auto-ecole";

const autoEcoleService = {
  // 🔹 Get all auto-écoles
  getAll: async () => {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  // 🔹 Get auto-école by ID
  getById: async (id) => {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  // 🔹 Create auto-école
  create: async (data) => {
    const res = await axios.post(BASE_URL, data);
    return res.data;
  },

  // 🔹 Update auto-école
  update: async (data) => {
    const res = await axios.put(BASE_URL, data);
    return res.data;
  },

  // 🔹 Delete auto-école
  delete: async (id) => {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },


  getDashboard: async (id) => {
    const res = await axios.get(`${BASE_URL}/${id}/dashboard`);
    return res.data;
  },
};

export default autoEcoleService;
