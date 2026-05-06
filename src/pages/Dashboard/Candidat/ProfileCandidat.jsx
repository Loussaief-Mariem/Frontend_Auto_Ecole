import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
  Chip,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { useCandidat } from "../../../hooks/useCandidat";
import { TypeFormation, EtatDossier, StatutDocument, TypeDocument } from "../../../enums";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const getTypeFormationLabel = (type) => {
  switch (type) {
    case TypeFormation.Theorique:
      return "Théorique";
    case TypeFormation.Pratique:
      return "Pratique";
    case TypeFormation.Complet:
      return "Complet";
    default:
      return "Non défini";
  }
};

const getEtatDossierLabel = (etat) => {
  switch (etat) {
    case EtatDossier.Incomplet:
      return "Incomplet";
    case EtatDossier.Complet:
      return "Complet";
    case EtatDossier.Annule:
      return "Annulé";
    case EtatDossier.Cloture:
      return "Clôturé";
    default:
      return "Non défini";
  }
};

const getDocumentTypeLabel = (type) => {
  switch (type) {
    case TypeDocument.PhotoIdentite:
      return "Photo d'identité";
    case TypeDocument.CopieCIN:
      return "Copie CIN";
    case TypeDocument.CertificatMedical:
      return "Certificat médical";
    default:
      return "Document";
  }
};

const ProfileCandidat = () => {
  const { user } = useAuth();
  const candidatId = user?.user?.id;
  const autoEcoleId = user?.autoEcoleId;
  const { profile, loading, error, updating, updateProfile, uploadPhoto } =
    useCandidat(candidatId, autoEcoleId);

  const [form, setForm] = useState({
    email: "",
    telephone: "",
  });
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        email: profile.compte?.login || "",
        telephone: profile.telephone || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: profile.id,
        telephone: form.telephone,
        autoEcoleId: autoEcoleId,
        compte: {
          id: profile.compte.id,
          login: form.email,
        },
      };
      await updateProfile(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadPhoto(file);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Mon Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "fit-content",
                mx: "auto",
                mb: 3,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    size="small"
                    onClick={handlePhotoClick}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      border: "2px solid white",
                    }}
                  >
                    <CameraAltIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  src={
                    profile?.photoPath
                      ? `http://localhost:5000${profile.photoPath}`
                      : undefined
                  }
                  sx={{
                    width: 140,
                    height: 140,
                    bgcolor: "primary.main",
                    fontSize: "3.5rem",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  {profile?.nom?.charAt(0) || "C"}
                </Avatar>
              </Badge>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </Box>

            <Typography variant="h5" fontWeight={800}>
              {profile?.nom} {profile?.prenom}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Candidat • {getTypeFormationLabel(profile?.contrat.typeFormation)}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={2} textAlign="left">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BadgeOutlinedIcon color="primary" fontSize="small" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Numéro CIN
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile?.numeroCIN}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnOutlinedIcon color="primary" fontSize="small" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Adresse
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile?.adresse}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneOutlinedIcon color="primary" fontSize="small" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Téléphone
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile?.telephone}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={3}>
              Informations Personnelles
            </Typography>

            {success && (
              <Alert
                severity="success"
                sx={{ mb: 3 }}
                onClose={() => setSuccess(false)}
              >
                Profil mis à jour avec succès.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nom"
                    fullWidth
                    disabled
                    value={profile?.nom || ""}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Prénom"
                    fullWidth
                    disabled
                    value={profile?.prenom || ""}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Adresse Email (Login)"
                    fullWidth
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <EmailOutlinedIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Téléphone"
                    fullWidth
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <PhoneOutlinedIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={updating}
                    sx={{
                      borderRadius: 3,
                      px: 5,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                    }}
                  >
                    {updating ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 4,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(0,0,0,0.02)",
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={2}>
              Statut du Dossier
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Numéro de dossier :{" "}
                <Box component="span" fontWeight={700} color="text.primary">
                  {profile?.dossierCandidat?.numDossier || "—"}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                État actuel :{" "}
                <Box
                  component="span"
                  fontWeight={700}
                  color={
                    profile?.dossierCandidat?.etatDossier ===
                    EtatDossier.Complet
                      ? "success.main"
                      : "primary.main"
                  }
                >
                  {getEtatDossierLabel(profile?.dossierCandidat?.etatDossier)}
                </Box>
              </Typography>
            </Box>

            {profile?.dossierCandidat?.documents && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.primary"
                  mb={2}
                >
                  Pièces du dossier :
                </Typography>
                <Stack spacing={1.5}>
                  {profile.dossierCandidat.documents.map((doc) => {
                    const isRecu = doc.statutDocument === StatutDocument.Recu;
                    return (
                      <Box
                        key={doc.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isRecu
                            ? "rgba(76, 175, 80, 0.08)"
                            : "rgba(244, 67, 54, 0.08)",
                          border: "1px solid",
                          borderColor: isRecu
                            ? "rgba(76, 175, 80, 0.2)"
                            : "rgba(244, 67, 54, 0.2)",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          {isRecu ? (
                            <CheckCircleIcon
                              sx={{ color: "success.main", fontSize: 20 }}
                            />
                          ) : (
                            <CancelIcon
                              sx={{ color: "error.main", fontSize: 20 }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {getDocumentTypeLabel(doc.typeDocument)}
                            </Typography>
                            {isRecu && doc.dateReception && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                Reçu le{" "}
                                {new Date(doc.dateReception).toLocaleDateString(
                                  "fr-TN",
                                )}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Chip
                          label={isRecu ? "Reçu" : "Manquant"}
                          size="small"
                          color={isRecu ? "success" : "error"}
                          variant="filled"
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileCandidat;
