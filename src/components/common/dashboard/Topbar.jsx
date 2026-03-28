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

const Topbar = ({ onToggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const roleLabel = useMemo(() => {
    const map = {
      Proprietaire: "Propriétaire",
      Secretaire: "Secrétaire",
      Moniteur: "Moniteur",
    };
    return map[user?.role] || "Dashboard";
  }, [user?.role]);

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

          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
              AutoPilot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Espace {roleLabel}
            </Typography>
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
              onClick={() => navigate("/dashboard/proprietaire/profile")}
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
            {user?.login?.[0]?.toUpperCase() || "A"}
          </Avatar>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              navigate("/dashboard/proprietaire/profile");
            }}
          >
            <PersonRoundedIcon fontSize="small" style={{ marginRight: 8 }} />
            Mon profil
          </MenuItem>
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
