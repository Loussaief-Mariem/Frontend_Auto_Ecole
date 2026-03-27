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
export const resetPassword = async (token, newPassword) => {
  const res = await axios.post(`/auth/reset-password`, null, {
    params: { token, newPassword },
  });
  return res.data;
};

export const forgotPassword = async (login) => {
  const res = await axios.post(`/auth/forgot-password`, null, {
    params: { login },
  });
  return res.data;
};


