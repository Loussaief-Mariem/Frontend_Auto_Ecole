// fichier : src/api/propretaireService.js
import axios from "./axios";

const API_URL = "/proprietaire";

//  récupérer profil
export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axios.put(`${API_URL}/profile`, data);
  return res.data;
};
