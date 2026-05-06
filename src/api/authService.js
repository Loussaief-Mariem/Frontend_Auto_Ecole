import axios from "./axios";

const API_URL = "/auth";

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const logout = async (refreshToken) => {
  const res = await axios.post(`${API_URL}/logout`, null, {
    params: { refreshToken },
  });
  return res.data;
};
export const activateAccount = async (token, password) => {
  const res = await axios.post(`/auth/reset-password`, null, {
    params: { token, newPassword: password },
  });
  return res.data;
};

export const resendActivation = async (email) => {
  const res = await axios.post(
    `/auth/forgot-password?login=${encodeURIComponent(email)}`
  );
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await axios.post(`/auth/reset-password`, null, {
    params: { token, newPassword },
  });
  return res.data;
};

// Dans authService.js
export const forgotPassword = async (email) => {
  console.log(email); 
  console.log(encodeURIComponent(email)); 
  const res = await axios.post(
    `/auth/forgot-password?login=${encodeURIComponent(email)}`,
  );
  return res.data;
};

export const verifyToken = async (token) => {

  const res = await axios.get(`/auth/verify-token?token=${token}`);
  return res.data;
};
