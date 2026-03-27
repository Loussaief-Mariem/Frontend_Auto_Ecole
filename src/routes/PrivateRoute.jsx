import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/tokenHelper";

const PrivateRoute = ({ children }) => {
  const token = getAccessToken();

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
