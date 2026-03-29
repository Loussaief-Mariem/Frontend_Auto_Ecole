// fichier : src/pages/ProfileProprietaire.jsx (ou votre composant)
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import { getProfile, updateProfile } from "../../../api/propretaireService";

const ProfileProprietaire = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Charger les données depuis API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        console.log("Données reçues du backend:", data);

        setProfile({
          nom: data.nomProp || "",
          prenom: data.prenomProp || "",
          email: data.email || "",
          telephone: data.telephone || "",
          codeEtablissement: data.codeEtablissement || "",
          nomAutoEcole: data.nomAutoEcole || "",
          identifiantFiscal: data.identifiantFiscal || "",
          adresse: {
            rue: data.adresse?.rue || "",
            ville: data.adresse?.ville || "",
            gouvernorat: data.adresse?.gouvernorat || "",
            pays: data.adresse?.pays || "",
          },
        });
      } catch (error) {
        console.error("Erreur chargement profile", error);
        setSnackbar({
          open: true,
          message: "Erreur lors du chargement du profil",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Gestion des champs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("adresse.")) {
      const key = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        adresse: { ...prev.adresse, [key]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const startEdit = () => {
    setBackup(JSON.parse(JSON.stringify(profile)));
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (backup) setProfile(backup);
    setBackup(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Préparer les données pour l'API
      const dataToSend = {
        nomProp: profile.nom,
        prenomProp: profile.prenom,
        telephone: profile.telephone,
        nomAutoEcole: profile.nomAutoEcole,
        codeEtablissement: profile.codeEtablissement,
        identifiantFiscal: profile.identifiantFiscal,
        adresse: {
          rue: profile.adresse.rue,
          ville: profile.adresse.ville,
          gouvernorat: profile.adresse.gouvernorat,
          pays: profile.adresse.pays,
        },
      };

      console.log("Données à envoyer :", dataToSend);

      // Appel API pour mettre à jour le profil
      await updateProfile(dataToSend);

      // Recharger le profil après la mise à jour
      const updatedProfile = await getProfile();

      console.log("Profil mis à jour reçu:", updatedProfile);

      // Mettre à jour le state avec les nouvelles données
      setProfile({
        nom: updatedProfile.nomProp || profile.nom,
        prenom: updatedProfile.prenomProp || profile.prenom,
        email: updatedProfile.email || profile.email,
        telephone: updatedProfile.telephone || profile.telephone,
        codeEtablissement:
          updatedProfile.codeEtablissement || profile.codeEtablissement,
        nomAutoEcole: updatedProfile.nomAutoEcole || profile.nomAutoEcole,
        identifiantFiscal:
          updatedProfile.identifiantFiscal || profile.identifiantFiscal,
        adresse: {
          rue: updatedProfile.adresse?.rue || profile.adresse.rue,
          ville: updatedProfile.adresse?.ville || profile.adresse.ville,
          gouvernorat:
            updatedProfile.adresse?.gouvernorat || profile.adresse.gouvernorat,
          pays: updatedProfile.adresse?.pays || profile.adresse.pays,
        },
      });

      setBackup(null);
      setEditMode(false);

      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: "Profil mis à jour avec succès !",
        severity: "success",
      });
    } catch (error) {
      console.error("Erreur détaillée:", error);
      console.error("Réponse erreur:", error.response?.data);

      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du profil",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fieldProps = {
    fullWidth: true,
    variant: "outlined",
    size: "medium",
    disabled: !editMode,
  };

  // Loading UI
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // sécurité (si null)
  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Alert severity="error">Erreur lors du chargement du profil</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", width: "100%" }}>
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Mon Profil
          </Typography>
          <Typography color="text.secondary">
            Gérez vos informations personnelles et votre auto-école
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={startEdit}
            >
              Modifier
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={cancelEdit}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : "Enregistrer"}
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* CONTENU */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* INFO PERSO */}
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Informations personnelles
          </Typography>

          <Stack spacing={2} mt={2}>
            <TextField
              {...fieldProps}
              label="Nom"
              name="nom"
              value={profile.nom}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Prénom"
              name="prenom"
              value={profile.prenom}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              disabled={true} // Email ne devrait pas être modifiable
            />
            <TextField
              {...fieldProps}
              label="Téléphone"
              name="telephone"
              value={profile.telephone}
              onChange={handleChange}
            />
          </Stack>
        </Paper>

        {/* AUTO ECOLE */}
        <Paper sx={{ flex: 1, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Auto-école
          </Typography>

          <Stack spacing={2} mt={2}>
            <TextField
              {...fieldProps}
              label="Nom auto-école"
              name="nomAutoEcole"
              value={profile.nomAutoEcole}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Code établissement"
              name="codeEtablissement"
              value={profile.codeEtablissement}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Identifiant fiscal"
              name="identifiantFiscal"
              value={profile.identifiantFiscal}
              onChange={handleChange}
            />

            <Typography fontWeight={600} mt={1}>
              Adresse
            </Typography>

            <TextField
              {...fieldProps}
              label="Rue"
              name="adresse.rue"
              value={profile.adresse.rue}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Ville"
              name="adresse.ville"
              value={profile.adresse.ville}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Gouvernorat"
              name="adresse.gouvernorat"
              value={profile.adresse.gouvernorat}
              onChange={handleChange}
            />
            <TextField
              {...fieldProps}
              label="Pays"
              name="adresse.pays"
              value={profile.adresse.pays}
              onChange={handleChange}
            />
          </Stack>
        </Paper>
      </Stack>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileProprietaire;
