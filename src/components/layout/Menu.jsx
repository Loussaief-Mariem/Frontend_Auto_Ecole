import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useAuth } from "../../context/AuthContext";
import { blueGradients } from "../../theme/muiTheme";

const Menu = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);

  const closeDrawer = () => setOpen(false);

  const navButtonSx = {
    color: "text.primary",
    fontWeight: 600,
    "&:hover": { bgcolor: "action.hover", color: "primary.main" },
  };

  const drawerItems = (
    <Box sx={{ width: 280, pt: 2 }} role="presentation">
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}>
        <IconButton onClick={closeDrawer} aria-label="Fermer le menu">
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItemButton component={RouterLink} to="/" onClick={closeDrawer}>
          <ListItemText primary="Accueil" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
        {!user && (
          <>
            <ListItemButton component={RouterLink} to="/login" onClick={closeDrawer}>
              <ListItemText primary="Connexion" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/register" onClick={closeDrawer}>
              <ListItemText primary="Inscription" />
            </ListItemButton>
          </>
        )}
        {user && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemText
              sx={{ px: 2, py: 1 }}
              primary={`Connecté : ${user.login}`}
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
            <ListItemButton
              onClick={() => {
                closeDrawer();
                logout();
              }}
            >
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
            justifyContent: "space-between",
            gap: 2,
            minHeight: { xs: 64, sm: 72 },
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
                background: blueGradients.button,
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
              }}
            >
              <DirectionsCarFilledIcon />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background: blueGradients.bar,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Auto-École
            </Typography>
          </Box>

          {isMdUp ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button component={RouterLink} to="/" sx={navButtonSx}>
                Accueil
              </Button>
              {user ? (
                <>
                  <Chip
                    icon={
                      <AccountCircleOutlinedIcon sx={{ "&&": { fontSize: 18 } }} />
                    }
                    label={user.login}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    variant="contained"
                    onClick={logout}
                    sx={{
                      ml: 1,
                      color: "common.white",
                      background: blueGradients.button,
                      boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)",
                      "&:hover": {
                        filter: "brightness(1.05)",
                        boxShadow: "0 6px 20px rgba(29, 78, 216, 0.4)",
                      },
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" sx={navButtonSx}>
                    Connexion
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    sx={{
                      ml: 1,
                      color: "common.white",
                      background: blueGradients.button,
                      boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)",
                      "&:hover": {
                        filter: "brightness(1.05)",
                        boxShadow: "0 6px 20px rgba(29, 78, 216, 0.4)",
                      },
                    }}
                  >
                    Inscription
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <IconButton
              color="primary"
              edge="end"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={closeDrawer}>
        {drawerItems}
      </Drawer>
    </>
  );
};

export default Menu;
