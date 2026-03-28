import { createContext, useContext, useState } from "react";
import * as authService from "../api/authService";
import { setTokens, clearTokens } from "../utils/tokenHelper";

const AuthContext = createContext();
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (data) => {
    const res = await authService.login(data);
    console.log("Login response:  Auth hhh", res);

    // Stocke les tokens
    setTokens(res);

    // Stocke les infos utilisateur correctement
    setUser({ login: res.login, role: res.role });

    return res;
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    await authService.logout(refreshToken);

    clearTokens();
    setUser(null);
  };
  console.log("Access Token:", localStorage.getItem("accessToken"));
  console.log("Refresh Token:", localStorage.getItem("refreshToken"));

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
