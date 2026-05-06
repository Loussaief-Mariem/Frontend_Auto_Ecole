import { useState } from "react";
import { activateAccount } from "../../api/authService";
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";

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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { authPageSx, authPaperSx, authSubmitSx } from "./authStyles";

const ActivationPage = () => {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(pass)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(pass)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passError = validatePassword(form.password);
    if (passError) {
      setError(passError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      if (token) {
        await activateAccount(token, form.password);
        setSuccess("Compte activé avec succès ! Vous allez être redirigé vers la page de connexion...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Token invalide ou manquant.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'activation. Le lien est peut-être expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={authPageSx}>
      <Paper elevation={0} sx={authPaperSx}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center">
          Activation du compte
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Veuillez créer votre mot de passe pour activer votre compte.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
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

            <TextField
              label="Confirmer le mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={authSubmitSx}
              disabled={loading || !token || !!success}
            >
              {loading ? "Activation en cours..." : "Activer mon compte"}
            </Button>
          </Stack>
        </form>

        <Typography textAlign="center" mt={3}>
          <Link component={RouterLink} to="/login" fontWeight={600}>
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ActivationPage;
