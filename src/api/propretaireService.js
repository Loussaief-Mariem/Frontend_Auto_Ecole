import axios from "./axios";

const API_URL = "/proprietaire";

// 🔹 récupérer profil
export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`);
  return res.data;
};
