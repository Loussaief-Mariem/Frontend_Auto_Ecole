import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Utiliser ton AuthContext

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Si pas d'utilisateur connecté, redirige vers /login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
