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
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { authPageSx, authPaperSx, authSubmitSx } from "./authStyles";

const LoginPage = () => {
  const [form, setForm] = useState({ Login: "", MotDePasse: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!form.Login.trim()) {
      newErrors.Login = "L'identifiant est requis";
    }
    if (!form.MotDePasse) {
      newErrors.MotDePasse = "Le mot de passe est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      const role = res.role;

      if (role === "Proprietaire") {
        navigate("/dashboard/proprietaire");
      } else if (role === "Moniteur") {
        navigate("/dashboard/moniteur");
      } else if (role === "Secretaire") {
        navigate("/dashboard/secretaire");
      } else if (role === "Candidat") {
        navigate("/dashboard/candidat");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur de connexion : identifiant ou mot de passe incorrect.";
      
      // Si le backend renvoie une erreur spécifique pour un compte inactif
      if (errorMsg.toLowerCase().includes("inactif") || errorMsg.toLowerCase().includes("non activé")) {
        setError("Votre compte n'est pas encore activé. Veuillez vérifier vos emails.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
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
          Accédez à votre espace
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Identifiant"
              fullWidth
              autoComplete="username"
              value={form.Login}
              onChange={(e) => {
                setForm({ ...form, Login: e.target.value });
                if (errors.Login) setErrors({ ...errors, Login: "" });
              }}
              error={!!errors.Login}
              helperText={errors.Login}
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
              onChange={(e) => {
                setForm({ ...form, MotDePasse: e.target.value });
                if (errors.MotDePasse) setErrors({ ...errors, MotDePasse: "" });
              }}
              error={!!errors.MotDePasse}
              helperText={errors.MotDePasse}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
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
            to="/forgot-password"
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
