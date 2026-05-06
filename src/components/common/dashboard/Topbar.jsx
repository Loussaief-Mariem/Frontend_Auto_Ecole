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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import {
  getAuthDisplayName,
  getAutoEcoleNom,
  getRoleLabel,
} from "../../../utils/dashboardUserLabels";

const Topbar = ({ onToggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const roleLabel = useMemo(() => getRoleLabel(user?.role) || "Dashboard", [user?.role]);
  const displayName = useMemo(() => getAuthDisplayName(user), [user]);
  const autoEcoleNom = useMemo(() => getAutoEcoleNom(user), [user]);

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
          <IconButton
            onClick={onToggleSidebar}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
            color="primary"
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.1} noWrap>
              AutoPilot
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {displayName ? `${displayName} · ${roleLabel}` : `Espace ${roleLabel}`}
            </Typography>
            {autoEcoleNom ? (
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {autoEcoleNom}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <TextField
          size="small"
          placeholder="Rechercher..."
          sx={{
            width: { xs: 150, sm: 240, md: 300 },
            mx: { xs: 1, sm: 2 },
            display: { xs: "none", sm: "block" },
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Notifications">
            <IconButton color="primary">
              <NotificationsNoneRoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profil">
            <IconButton
              color="primary"
              onClick={handleProfileClick}
            >
              <PersonRoundedIcon />
            </IconButton>
          </Tooltip>

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
          <MenuItem
            onClick={handleProfileClick}
          >
            <PersonRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Mon profil
          </MenuItem>

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
