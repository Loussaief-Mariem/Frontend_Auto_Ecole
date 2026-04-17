import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import HomePage from "../pages/user/HomePage";

import DashboardLayout from "../components/common/dashboard/DashboardLayout";
import HomeProprietaire from "../pages/Dashboard/Proprietaire/HomeProprietaire";
import ProfileProprietaire from "../pages/Dashboard/Proprietaire/ProfileProprietaire";
import AddUser from "../pages/Dashboard/Proprietaire/AddUser";
import GestionUtilisateurs from "../pages/Dashboard/Proprietaire/GestionUtilisateurs";

import HomeMoniteur from "../pages/Dashboard/Moniteur/HomeMoniteur";
import HomeSecretaire from "../pages/Dashboard/Secretaire/HomeSecretaire";
import AddCandidatPage from "../pages/Dashboard/Secretaire/AddCandidatPage";

import PrivateRoute from "./PrivateRoute";
import CandidatProfilePage from "../pages/Dashboard/Secretaire/CandidatProfilePage";
import CandidatsListPage from "../pages/Dashboard/Secretaire/CandidatsListPage";
import PlanningConduitePage from "../pages/Dashboard/Moniteur/PlanningConduitePage";
import CandidatProfilMoniteur from "../pages/Dashboard/Moniteur/CandidatProfilMoniteur"; // Ajout

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Routes privées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Propriétaire */}
          <Route path="proprietaire">
            <Route index element={<HomeProprietaire />} />
            <Route path="profile" element={<ProfileProprietaire />} />
            <Route path="adduser" element={<AddUser />} />
            <Route
              path="gestion-utilisateurs"
              element={<GestionUtilisateurs />}
            />
          </Route>

          {/* Moniteur */}
          <Route path="moniteur">
            <Route index element={<HomeMoniteur />} />
            <Route
              path="planning-conduite"
              element={<PlanningConduitePage />}
            />
            {/* Ajout de la route pour voir le profil d'un candidat */}
            <Route path="candidats/:id" element={<CandidatProfilMoniteur />} />
          </Route>

          {/* Secrétaire */}
          <Route path="secretaire">
            <Route index element={<HomeSecretaire />} />
            <Route path="add-candidat" element={<AddCandidatPage />} />

            <Route path="candidats/:id" element={<CandidatProfilePage />} />
          </Route>
          <Route path="candidats" element={<CandidatsListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
