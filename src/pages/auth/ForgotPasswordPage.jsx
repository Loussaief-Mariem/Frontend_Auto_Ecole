// fichier : src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { forgotPassword } from "../../api/authService";
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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { authPageSx, authPaperSx, authSubmitSx } from "./authStyles";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      alert("Email envoyé !");
      navigate("/reset-password");
    } catch {
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <Box sx={authPageSx}>
      <Paper elevation={0} sx={authPaperSx}>
        <IconButton onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center">
          Mot de passe oublié
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" variant="contained" sx={authSubmitSx}>
              Envoyer
            </Button>
          </Stack>
        </form>

        <Typography textAlign="center" mt={2}>
          <Link component={RouterLink} to="/login">
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
