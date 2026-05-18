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
import { TypeFormation } from "../../../enums";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";


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
    <Box sx={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={850} color="text.primary" gutterBottom>
            Mon Profil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos informations personnelles et vos coordonnées
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Profile Card & Basic Info */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
            width: "100%"
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center">
            <Box
              sx={{
                position: "relative",
                width: "fit-content"
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
                    width: 120,
                    height: 120,
                    bgcolor: "primary.main",
                    fontSize: "3rem",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
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

            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h5" fontWeight={850} gutterBottom>
                {profile?.nom} {profile?.prenom}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  label={`Candidat · ${getTypeFormationLabel(profile?.contrat?.typeFormation)}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                />
              </Stack>
              
              <Grid container spacing={2} sx={{ textAlign: "left", mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <BadgeOutlinedIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        Numéro CIN
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {profile?.numeroCIN || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocationOnOutlinedIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        Adresse
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {profile?.adresse || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>

        {/* Edit Form */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
            width: "100%"
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={3}>
            Informations de Contact
          </Typography>

          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}
              onClose={() => setSuccess(false)}
            >
              Profil mis à jour avec succès.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nom"
                    fullWidth
                    disabled
                    value={profile?.nom || ""}
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Prénom"
                    fullWidth
                    disabled
                    value={profile?.prenom || ""}
                    variant="filled"
                    InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Adresse Email"
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
                  sx: { borderRadius: 2 }
                }}
              />

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
                  sx: { borderRadius: 2 }
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={updating}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 750,
                  }}
                >
                  {updating ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ProfileCandidat;
