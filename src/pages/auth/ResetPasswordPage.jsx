import { useState } from "react";
import { resetPassword, forgotPassword } from "../../api/authService";
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
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import { authPageSx, authPaperSx, authSubmitSx } from "./authStyles";

const ResetPasswordPage = () => {
  const [form, setForm] = useState({
    newPassword: "",
    email: "", // pour renvoyer email
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); //  IMPORTANT

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(token, form.newPassword); // ✅ TOKEN
      alert("Mot de passe changé et compte activé !");
      navigate("/login");
    } catch {
      alert("Erreur");
    }
  };

  const handleResend = async () => {
    try {
      await forgotPassword(form.email);
      alert("Email renvoyé !");
    } catch {
      alert("Erreur lors du renvoi");
    }
  };

  if (!token) {
    return <Typography>Token invalide</Typography>;
  }

  return (
    <Box sx={authPageSx}>
      <Paper elevation={0} sx={authPaperSx}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center">
          Nouveau mot de passe
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              fullWidth
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" sx={authSubmitSx}>
              Réinitialiser
            </Button>
          </Stack>
        </form>

        {/* 🔁 resend email */}
        <Typography textAlign="center" mt={2}>
          Vous n'avez pas reçu l'email ?
        </Typography>

        <Stack spacing={1} mt={1}>
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="outlined" onClick={handleResend}>
            Renvoyer email
          </Button>
        </Stack>

        <Typography textAlign="center" mt={2}>
          <Link component={RouterLink} to="/login">
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
