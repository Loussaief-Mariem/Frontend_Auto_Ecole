import api from "./axios";

export const getDashboardStats = async (autoEcoleId) => {
  const res = await api.get(`/dashboard/proprietaire/${autoEcoleId}`);
  return res.data;
};

export const getSecretaireDashboardStats = async (autoEcoleId) => {
  const res = await api.get(`/dashboard/secretaire/${autoEcoleId}`);
  return res.data;
};

export const getMoniteurDashboardStats = async (moniteurId) => {
  const res = await api.get(`/dashboard/moniteur/${moniteurId}`);
  return res.data;
};
