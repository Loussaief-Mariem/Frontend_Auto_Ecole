// src/api/userStateService.js
import api from "./axios";

const userStateService = {
  // 🔹 Archiver utilisateur
  archiver: async (type, id) => {
    const res = await api.patch(`/users/${type}/${id}/archiver`);
    return res.data;
  },

  // 🔹 Désarchiver utilisateur
  desarchiver: async (type, id) => {
    const res = await api.patch(`/users/${type}/${id}/desarchiver`);
    return res.data;
  },
};

export default userStateService;
