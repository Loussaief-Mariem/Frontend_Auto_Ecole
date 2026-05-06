import { Typography } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import {
  getAuthDisplayName,
  getAutoEcoleNom,
  getRoleLabel,
} from "../../../utils/dashboardUserLabels";

/** Ligne sous le titre : « Prénom Nom · rôle · nom auto-école » */
export default function DashboardUserMeta() {
  const { user } = useAuth();
  const name = getAuthDisplayName(user);
  const role = getRoleLabel(user?.role);
  const ae = getAutoEcoleNom(user);
  " Auto-école : " + ae;
  const segments = [];
  if (name) segments.push(name);
  if (role) segments.push(role);
  if (ae) segments.push(ae);
  if (!segments.length) return null;

  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {segments.join(" · ")}
    </Typography>
  );
}
