import api from "./axios";

export const getDashboardStats = async (autoEcoleId) => {
  const res = await api.get(`/dashboard/proprietaire/${autoEcoleId}`);
  return res.data;
};
