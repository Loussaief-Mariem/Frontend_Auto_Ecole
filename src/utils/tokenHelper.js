// fichier : src/utils/tokenHelper.js
export const setTokens = (data) => {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
