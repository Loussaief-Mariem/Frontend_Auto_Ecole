import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import HomePage from "../pages/user/HomePage";
import PrivateRoute from "./PrivateRoute";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardLayout from "../components/common/dashboard/DashboardLayout";
import HomeMoniteur from "../pages/Dashboard/Moniteur/HomeMoniteur";
import HomeProprietaire from "../pages/Dashboard/Proprietaire/HomeProprietaire";
import HomeSecretaire from "../pages/Dashboard/Secretaire/HomeSecretaire";
import ProfileProprietaire from "../pages/Dashboard/Proprietaire/ProfileProprietaire";
import AddUser from "../pages/Dashboard/Proprietaire/AddUser";
import GestionUtilisateurs from "../pages/Dashboard/Proprietaire/GestionUtilisateurs";
import AddCandidatPage from "../pages/Dashboard/Secretaire/AddCandidatPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="proprietaire">
            <Route index element={<HomeProprietaire />} />
            <Route path="profile" element={<ProfileProprietaire />} />
            <Route path="adduser" element={<AddUser />} />
            <Route
              path="gestion-utilisateurs"
              element={<GestionUtilisateurs />}
            />
          </Route>
          <Route path="moniteur" element={<HomeMoniteur />} />
          <Route path="secretaire">
            <Route index element={<HomeSecretaire />} />
            <Route path="add-candidat" element={<AddCandidatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
