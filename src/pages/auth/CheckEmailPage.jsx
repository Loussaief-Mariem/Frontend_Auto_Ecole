import { Box, Paper, Typography, Button, Stack, Link, TextField } from "@mui/material";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { authPageSx, authPaperSx } from "./authStyles";
import { forgotPassword } from "../../api/authService";
import CompteService from "../../api/compteService";
import { useState } from "react";

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentEmail, setCurrentEmail] = useState(location.state?.email || "");
  const id = location.state?.id;
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(!location.state?.email);
  const [editEmailValue, setEditEmailValue] = useState("");
console.log("ID:", id);

 const handleResend = async () => {
  setLoading(true);
  setSuccessMsg("");

  try {
    await forgotPassword(currentEmail);
    setSuccessMsg("Un nouvel email vous a été envoyé !");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Erreur lors de l'envoi");
  } finally {
    setLoading(false);
  }
};


  const handleUpdateEmail = async () => {
    if (!editEmailValue || editEmailValue === currentEmail) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    try {
      if (id) {
        await CompteService.updateCompte({ id, login: editEmailValue });
      }
      setCurrentEmail(editEmailValue);
      setIsEditing(false);
      await forgotPassword(editEmailValue);
      setSuccessMsg(id ? "L'email a été modifié et un nouveau lien vous a été envoyé !" : "Un nouveau lien vous a été envoyé !");
    } catch {
      alert("Erreur lors de la demande. Vérifiez que l'email est correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={authPageSx}>
      <Paper elevation={0} sx={authPaperSx}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <EmailOutlinedIcon sx={{ fontSize: 60, color: "primary.main", mb: 1 }} />
          <Typography variant="h5" fontWeight={800}>
            Vérifiez votre boîte mail
          </Typography>
        </Box>

        <Typography textAlign="center" mb={1} color="text.secondary">
          Nous avons envoyé un lien d'activation à l'adresse suivante :
        </Typography>
        
        {!isEditing ? (
          <Typography textAlign="center" fontWeight={800} color="primary.main" fontSize="1.1rem" mb={4}>
            {currentEmail}
          </Typography>
        ) : (
          <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={editEmailValue}
              onChange={(e) => setEditEmailValue(e.target.value)}
              placeholder="Nouvelle adresse email"
              autoFocus
            />
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button size="small" variant="contained" onClick={handleUpdateEmail} disabled={loading}>
                Sauvegarder
              </Button>
              <Button size="small" variant="outlined" onClick={() => setIsEditing(false)} disabled={loading}>
                Annuler
              </Button>
            </Stack>
          </Box>
        )}

        {successMsg && (
          <Typography textAlign="center" color="success.main" fontWeight={600} mb={3}>
            {successMsg}
          </Typography>
        )}

        <Stack spacing={2}>
          {currentEmail && (
            <Button
              variant="contained"
              onClick={() => window.open("https://mail.google.com", "_blank")}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Ouvrir ma messagerie
            </Button>
          )}

          {currentEmail && !isEditing && (
            <Button
              variant="outlined"
              onClick={handleResend}
              disabled={loading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {loading ? "Envoi en cours..." : "Renvoyer l'email"}
            </Button>
          )}

          {currentEmail && !isEditing && (
            <Button
              variant="text"
              onClick={() => {
                setEditEmailValue(currentEmail);
                setIsEditing(true);
                setSuccessMsg("");
              }}
              fullWidth
              color="inherit"
              disabled={loading}
            >
              Modifier l'email
            </Button>
          )}
        </Stack>

        <Typography textAlign="center" mt={4}>
          <Link component={RouterLink} to="/login" fontWeight={600}>
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CheckEmailPage;
