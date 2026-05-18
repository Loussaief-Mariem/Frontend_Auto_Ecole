import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Button from "@mui/material/Button";
import {
  getAuthDisplayName,
  getAutoEcoleNom,
  getRoleLabel,
} from "../../../utils/dashboardUserLabels";
import { blueGradients } from "../../../theme/muiTheme";

const Topbar = ({ onToggleSidebar, hideToggle }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  console.log(user);  
  // Navigation for Candidat
  const candidatMenu = [
    { text: "Accueil", path: "/dashboard/candidat" },
    { text: "Mes séances", path: "/dashboard/candidat/seances" },
    { text: "Mes examens", path: "/dashboard/candidat/examens" },
    { text: "Mes paiements", path: "/dashboard/candidat/finances" },
    { text: "Espace Entraînement", path: "/dashboard/candidat/tests" },
  ];

  const roleLabel = useMemo(() => getRoleLabel(user?.role) || "Dashboard", [user?.role]);
  const displayName = useMemo(() => getAuthDisplayName(user), [user]);
  const autoEcoleNom = useMemo(() => getAutoEcoleNom(user), [user]);
console.log(displayName);
console.log(autoEcoleNom);
console.log(user.autoEcoleNom);
  const handleProfileClick = () => {
    handleCloseMenu();
    if (user?.role === "Candidat") {
      navigate("/dashboard/candidat/profile");
    } else {
      navigate("/dashboard/proprietaire/profile");
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 68, md: 72 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ flex: 1 }}
        >
          {!hideToggle && (
            <IconButton
              onClick={onToggleSidebar}
              sx={{ display: { xs: "inline-flex", lg: "none" } }}
              color="primary"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={850} lineHeight={1.2} noWrap color="primary.main">
              {displayName || "AutoPilot"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap fontWeight={600}>
              {user?.role === "Candidat" 
                ? (autoEcoleNom ? (autoEcoleNom.toLowerCase().startsWith("auto") ? autoEcoleNom : `Auto-École ${autoEcoleNom}`) : "Espace Candidat") 
                : `${roleLabel}${autoEcoleNom ? ` · Auto-École ${autoEcoleNom}` : ""}`}
            </Typography>
          </Box>
        </Stack>

        {user?.role === "Candidat" && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" }, flex: 2, justifyContent: "center" }}
          >
            {candidatMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: isActive ? "primary.main" : "text.secondary",
                    fontWeight: isActive ? 800 : 500,
                    borderBottom: isActive ? "2px solid" : "none",
                    borderColor: "primary.main",
                    borderRadius: 0,
                    textTransform: "none",
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: "transparent",
                      color: "primary.main",
                    }
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
          </Stack>
        )}

        <Stack direction="row" spacing={1} alignItems="center">


          {user?.role !== "Candidat" && (
            <Tooltip title="Profil">
              <IconButton
                color="primary"
                onClick={handleProfileClick}
              >
                <PersonRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Paramètres">
            <IconButton color="primary" onClick={handleOpenMenu}>
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontSize: 13,
            }}
          >
            {(displayName?.[0] || user?.login?.[0] || "A").toUpperCase()}
          </Avatar>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          {user?.role !== "Candidat" && (
            <MenuItem
              onClick={handleProfileClick}
            >
              <PersonRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
              Mon profil
            </MenuItem>
          )}

          {user?.role === "Candidat" && candidatMenu.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => {
                handleCloseMenu();
                navigate(item.path);
              }}
              sx={{ display: { md: "none" } }}
            >
              {item.text}
            </MenuItem>
          ))}

          {user?.role === "Proprietaire" && [
            <MenuItem
              key="add-secretaire"
              onClick={() => {
                handleCloseMenu();
                navigate("/dashboard/proprietaire/adduser");
              }}
            >
              <PersonAddAlt1Icon fontSize="small" sx={{ mr: 1 }} />
              Ajouter Utilisateur
            </MenuItem>,
          ]}

          <MenuItem onClick={handleLogout}>
            <LogoutRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
