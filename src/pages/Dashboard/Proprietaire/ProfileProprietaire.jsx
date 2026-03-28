import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import { getProfile } from "../../../api/propretaireService";

const ProfileProprietaire = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  //  Charger les données depuis API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        setProfile({
          nom: data.nomProp,
          prenom: data.prenomProp,
          email: data.email,
          telephone: data.telephone,
          codeEtablissement: data.codeEtablissement,
          nomAutoEcole: data.nomAutoEcole,
          identifiantFiscal: data.identifiantFiscal,
          adresse: {
            rue: data.adresse.rue,
            ville: data.adresse.ville,
            gouvernorat: data.adresse.gouvernorat,
            pays: data.adresse.pays,
          },
        });
        console.log("Fetching profile data...", data);
      } catch (error) {
        console.error("Erreur chargement profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔥 Gestion des champs
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
      console.log("Data à envoyer :", profile);

      // 🔥 ici tu vas appeler PUT API plus tard
      // await updateProfile(profile)

      setBackup(null);
      setEditMode(false);
    } catch (error) {
      console.error("Erreur update", error);
    }
  };

  const fieldProps = {
    fullWidth: true,
    variant: "outlined",
    size: "medium",
    disabled: !editMode,
  };
  console.log("Profile data:", profile);
  // 🔥 Loading UI
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // 🔥 sécurité (si null)
  if (!profile) {
    return <Typography>Erreur chargement profil</Typography>;
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
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* CONTENU */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* 🔹 INFO PERSO */}
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
              value={profile.email}
              onChange={handleChange}
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

        {/* 🔹 AUTO ECOLE */}
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

            <Typography fontWeight={600}>Adresse</Typography>

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
    </Box>
  );
};

export default ProfileProprietaire;
