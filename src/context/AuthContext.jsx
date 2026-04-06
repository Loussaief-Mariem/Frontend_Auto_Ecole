import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../api/authService";
import { setTokens, clearTokens, getStoredUser } from "../utils/tokenHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialiser l'utilisateur depuis localStorage si déjà connecté
  const [user, setUser] = useState(getStoredUser());
  console.log("AuthProvider initialized with user:", user);
  // 🔹 Login
  const login = async (data) => {
    const res = await authService.login(data);

    console.log("Login response:", res);

    // 🔐 tokens
    setTokens(res);
    console.log("Tokens stored:", {
      token: res.token,
      refreshToken: res.refreshToken,
    });

    // 🎯 user
    const userInfo = {
      login: res.login,
      role: res.role,
      user: res.user, //
    };
    console.log("User info to store:", userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);

    return res;
  };

  // 🔹 Register
  const register = async (data) => {
    const res = await authService.register(data);

    // Stocker tokens si renvoyés
    if (res.token && res.refreshToken) {
      setTokens(res);
    }

    // Stocker infos utilisateur
    const userInfo = {
      login: res.login,
      role: res.role || "Proprietaire",
      proprietaireId: res.idProprietaire,
      autoEcoleId: res.autoEcoleId,
      nomAutoEcole: res.nomAutoEcole,
    };
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);

    return res;
  };

  // 🔹 Logout
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    clearTokens();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);
