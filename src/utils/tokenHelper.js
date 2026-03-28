// fichier : src/utils/tokenHelper.js
export const setTokens = (data) => {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
};
console.log("Access Token set:", localStorage.getItem("accessToken"));
console.log("Refresh Token set:", localStorage.getItem("refreshToken"));

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
