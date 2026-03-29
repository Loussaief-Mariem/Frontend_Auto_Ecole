import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Stack,
  InputAdornment,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { authPageSx, authPaperSx, authSubmitSx } from "./authStyles";

const LoginPage = () => {
  const [form, setForm] = useState({ Login: "", MotDePasse: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      const role = res.role; // <-- ici, pas res.user.role

      if (role === "Proprietaire") {
        navigate("/dashboard/proprietaire");
      } else if (role === "Moniteur") {
        navigate("/dashboard/moniteur");
      } else if (role === "Secretaire") {
        navigate("/dashboard/secretaire"); // Candidat
      } else {
        navigate("/"); // fallback
      }
    } catch {
      alert("Erreur de connexion : identifiant ou mot de passe incorrect");
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={authPageSx}>
      <Paper elevation={0} sx={authPaperSx}>
        <IconButton
          onClick={() => navigate("/")}
          aria-label="Retour à l’accueil"
          sx={{ mb: 1, color: "text.secondary" }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center" mb={0.5}>
          Connexion
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Accédez à votre espace élève
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Identifiant"
              fullWidth
              autoComplete="username"
              value={form.Login}
              onChange={(e) => setForm({ ...form, Login: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              autoComplete="current-password"
              value={form.MotDePasse}
              onChange={(e) => setForm({ ...form, MotDePasse: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      onClick={handleTogglePassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon color="primary" />
                      ) : (
                        <VisibilityOutlinedIcon color="primary" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={authSubmitSx}
            >
              Se connecter
            </Button>
          </Stack>
        </form>

        <Typography textAlign="center" mt={2.5} fontSize={14}>
          Pas de compte ?{" "}
          <Link component={RouterLink} to="/register" fontWeight={700}>
            S&apos;inscrire
          </Link>
        </Typography>

        <Typography textAlign="center" mt={1} fontSize={13}>
          <Link
            component={RouterLink}
            to="/reset-password"
            color="text.secondary"
          >
            Mot de passe oublié ?
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
