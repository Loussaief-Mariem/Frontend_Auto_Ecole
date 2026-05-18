import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ActivationPage from "../pages/auth/ActivationPage";
import CheckEmailPage from "../pages/auth/CheckEmailPage";
import HomePage from "../pages/user/HomePage";
import DashboardLayout from "../components/common/dashboard/DashboardLayout";
import HomeProprietaire from "../pages/Dashboard/Proprietaire/HomeProprietaire";
import ProfileProprietaire from "../pages/Dashboard/Proprietaire/ProfileProprietaire";
import AddUser from "../pages/Dashboard/Proprietaire/AddUser";
import GestionUtilisateurs from "../pages/Dashboard/Proprietaire/GestionUtilisateurs";
import HomeMoniteur from "../pages/Dashboard/Moniteur/HomeMoniteur";
import HomeSecretaire from "../pages/Dashboard/Secretaire/HomeSecretaire";
import AddCandidatPage from "../pages/Dashboard/Secretaire/AddCandidatPage";
import TestManagementPage from "../pages/Dashboard/Secretaire/TestManagementPage";
import PrivateRoute from "./PrivateRoute";
import CandidatProfilePage from "../pages/Dashboard/Secretaire/CandidatProfilePage";
import CandidatsListPage from "../pages/Dashboard/Secretaire/CandidatsListPage";
import PlanningConduitePage from "../pages/Dashboard/Moniteur/PlanningConduitePage";
import CandidatProfilMoniteur from "../pages/Dashboard/Moniteur/CandidatProfilMoniteur";
import TarifsManagement from "../pages/Dashboard/Proprietaire/TarifsManagement";
// NOUVEAUX IMPORTS
import PlanningSeancesPage from "../pages/Dashboard/Secretaire/PlanningSeancesPage";
import PlanningConduiteMoniteur from "../pages/Dashboard/Moniteur/PlanningConduiteMoniteur";
import PlanningGlobalPage from "../pages/Dashboard/PlanningGlobalPage";

// CANDIDAT PAGES
import HomeCandidat from "../pages/Dashboard/Candidat/HomeCandidat";
import ProfileCandidat from "../pages/Dashboard/Candidat/ProfileCandidat";
import SessionsCandidat from "../pages/Dashboard/Candidat/SessionsCandidat";

import ExamsCandidat from "../pages/Dashboard/Candidat/ExamsCandidat";
import FinancesCandidat from "../pages/Dashboard/Candidat/FinancesCandidat";
import TestsCandidat from "../pages/Dashboard/Candidat/TestsCandidat";
import TestSessionPage from "../pages/TestSessionPage";



const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
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
            <Route path="tarifs" element={<TarifsManagement />} />
            <Route path="calendrier" element={<PlanningGlobalPage />} />
          </Route>

          {/* Moniteur */}
          <Route path="moniteur">
            <Route index element={<HomeMoniteur />} />
            {/* Route existante */}
            <Route
              path="planning-conduite"
              element={<PlanningConduitePage />}
            />
            {/* NOUVELLE ROUTE pour le planning avec calendrier */}
            <Route path="planning" element={<PlanningConduiteMoniteur />} />
            <Route path="calendrier" element={<PlanningGlobalPage />} />
            <Route path="candidats/:id" element={<CandidatProfilMoniteur />} />
          </Route>

          {/* Secrétaire */}
          <Route path="secretaire">
            <Route index element={<HomeSecretaire />} />
            <Route path="add-candidat" element={<AddCandidatPage />} />
            <Route path="candidats/:id" element={<CandidatProfilePage />} />
            {/* NOUVELLE ROUTE pour la planification des séances */}
            <Route path="planning" element={<PlanningSeancesPage />} />
            <Route path="calendrier" element={<PlanningGlobalPage />} />
            <Route path="test-management" element={<TestManagementPage />} />
          </Route>
          
          {/* Candidat */}
          <Route path="candidat">
            <Route index element={<HomeCandidat />} />
            <Route path="profile" element={<ProfileCandidat />} />
            <Route path="seances" element={<SessionsCandidat />} />

            <Route path="examens" element={<ExamsCandidat />} />
            <Route path="finances" element={<FinancesCandidat />} />
            <Route path="tests" element={<TestsCandidat />} />
            <Route path="test/:testId" element={<TestSessionPage />} />


          </Route>

          {/* Routes communes */}
          <Route path="candidats" element={<CandidatsListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
