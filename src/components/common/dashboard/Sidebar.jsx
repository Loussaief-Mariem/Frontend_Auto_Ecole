import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { blueGradients } from "../../../theme/muiTheme";

const SIDEBAR_WIDTH = 280;

const menusByRole = {
  Proprietaire: [
    {
      text: "Dashboard",
      icon: <DashboardRoundedIcon />,
      path: "/dashboard/proprietaire",
    },
    {
      text: "Gestion du personnel",
      icon: <PeopleAltOutlinedIcon />,
      path: "/dashboard/proprietaire/gestion-utilisateurs",
    },



    {
      text: "Tarifs",
      icon: <PriceChangeOutlinedIcon />,
      path: "/dashboard/proprietaire/tarifs",
    },
    {
      text: "Gestion séance de conduite",
      icon: <CalendarMonthOutlinedIcon />,
      path: "/dashboard/moniteur/planning-conduite",
    },
    {
      text: "Calendrier Global",
      icon: <CalendarMonthOutlinedIcon />,
      path: "/dashboard/proprietaire/calendrier",
    },
    {
      text: "Mes candidats",
      icon: <SchoolOutlinedIcon />,
      path: "/dashboard/candidats",
    },
  ],

  Secretaire: [
    {
      text: "Dashboard",
      icon: <DashboardRoundedIcon />,
      path: "/dashboard/secretaire",
    },
    {
      text: "Gestion des candidats",
      icon: <SchoolOutlinedIcon />,
      path: "/dashboard/candidats",
    },

    {
      text: "Gestion séance de code",
      icon: <EventAvailableOutlinedIcon />,
      path: "/dashboard/secretaire/planning",
    },
    {
      text: "Calendrier Global",
      icon: <CalendarMonthOutlinedIcon />,
      path: "/dashboard/secretaire/calendrier",
    },
    {
      text: "Gestion Tests Blancs",
      icon: <AssignmentOutlinedIcon />,
      path: "/dashboard/secretaire/test-management",
    },
  ],

  Moniteur: [
    {
      text: "Dashboard",
      icon: <DashboardRoundedIcon />,
      path: "/dashboard/moniteur",
    },
    {
      text: "Gestion des séances",
      icon: <EventAvailableOutlinedIcon />,
      path: "/dashboard/moniteur/planning",
    },
    {
      text: "Gestion séance de conduite",
      icon: <EventAvailableOutlinedIcon />,
      path: "/dashboard/moniteur/planning-conduite",
    },
    {
      text: "Mon Calendrier",
      icon: <CalendarMonthOutlinedIcon />,
      path: "/dashboard/moniteur/calendrier",
    },
    {
      text: "Mes candidats",
      icon: <SchoolOutlinedIcon />,
      path: "/dashboard/candidats",
    },
  ],
  Candidat: [
    {
      text: "Accueil",
      icon: <DashboardRoundedIcon />,
      path: "/dashboard/candidat",
    },

    {
      text: "Mes séances",
      icon: <CalendarMonthOutlinedIcon />,
      path: "/dashboard/candidat/seances",
    },

    {
      text: "Mes examens",
      icon: <AssignmentOutlinedIcon />,
      path: "/dashboard/candidat/examens",
    },
    {
      text: "Mes paiements",
      icon: <PaymentsOutlinedIcon />,
      path: "/dashboard/candidat/finances",
    },
    {
      text: "Espace Entraînement",
      icon: <FactCheckOutlinedIcon />,
      path: "/dashboard/candidat/tests",
    },
  ],
};

const SidebarContent = ({ role, onCloseMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = menusByRole[role] ?? [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        height: "100%",
        color: "white",
        background: blueGradients.heroSoft,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack sx={{ px: 2.5, py: 2.5 }} spacing={0.5}>
        <Typography variant="h6" fontWeight={800} letterSpacing="0.02em">
          AutoPilot
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          Plateforme de gestion auto-école
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.16)" }} />

      <List sx={{ px: 1.5, py: 1.5, flex: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={`${item.path}-${item.text}`}
            component={NavLink}
            to={item.path}
            onClick={onCloseMobile}
            sx={{
              borderRadius: 2,
              mb: 0.75,
              color: "#ffffff",
              "& .MuiListItemIcon-root": {
                color: "#ffffff",
                minWidth: 36,
              },
              "& .MuiListItemText-primary": {
                color: "#ffffff",
              },
              "&.active": {
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
              },
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
                color: "#fff",
              }}
            />
          </ListItemButton>
        ))}

        {/* Logout Button */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mb: 0.75,
            color: "#ffffff",
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
              minWidth: 36,
            },
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.12)",
            },
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
            }}
          />
        </ListItemButton>
      </List>

      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Espace {role || "utilisateur"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            border: "none",
          },
        }}
      >
        <SidebarContent role={role} onCloseMobile={onCloseMobile} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <SidebarContent role={role} onCloseMobile={onCloseMobile} />
      </Drawer>
    </>
  );
};

export default Sidebar;
