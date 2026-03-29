// Stocke les tokens dans le localStorage
export const setTokens = (data) => {
  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
};

// Supprime les tokens
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Récupérer le token d'accès
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Récupérer les infos utilisateur stockées
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
