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
  Collapse,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import { getProfile, updateProfile } from "../../../api/propretaireService";
import { useAuth } from "../../../context/AuthContext";

// ✅ liste des permis
const PERMIS_OPTIONS = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];

const ProfileProprietaire = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [backup, setBackup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({
    show: false,
    text: "",
    severity: "success",
  });

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        setProfile({
          nom: data.nomProp || "",
          prenom: data.prenomProp || "",
          email: data.email || "",
          telephone: data.telephone || "",
          codeEtablissement: data.codeEtablissement || "",
          nomAutoEcole: data.nomAutoEcole || "",
          identifiantFiscal: data.identifiantFiscal || "",
          typePermisCodes: data.typePermisCodes || [],
          adresse: {
            rue: data.adresse?.rue || "",
            ville: data.adresse?.ville || "",
            gouvernorat: data.adresse?.gouvernorat || "",
            pays: data.adresse?.pays || "",
          },
        });
      } catch (error) {
        showMessage("Erreur lors du chargement du profil", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Afficher un message temporaire au-dessus du formulaire
  const showMessage = (text, severity = "success") => {
    setMessage({
      show: true,
      text,
      severity,
    });

    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      setMessage((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // ✅ HANDLE INPUT
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

  // ✅ HANDLE PERMIS
  const handlePermisChange = (code) => {
    setProfile((prev) => {
      const exists = prev.typePermisCodes.includes(code);
      return {
        ...prev,
        typePermisCodes: exists
          ? prev.typePermisCodes.filter((c) => c !== code)
          : [...prev.typePermisCodes, code],
      };
    });
  };

  const startEdit = () => {
    setBackup(JSON.parse(JSON.stringify(profile)));
    setEditMode(true);
    // Masquer tout message existant
    setMessage({ show: false, text: "", severity: "success" });
  };

  const cancelEdit = () => {
    if (backup) setProfile(backup);
    setEditMode(false);
    setMessage({ show: false, text: "", severity: "success" });
  };

  // ✅ SAVE
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ show: false, text: "", severity: "success" });

      // Validation des champs requis
      if (!profile.nom?.trim()) {
        showMessage("Le nom est requis", "error");
        setSaving(false);
        return;
      }

      if (!profile.prenom?.trim()) {
        showMessage("Le prénom est requis", "error");
        setSaving(false);
        return;
      }

      if (!profile.telephone?.trim()) {
        showMessage("Le téléphone est requis", "error");
        setSaving(false);
        return;
      }

      if (user?.role === "Proprietaire") {
        if (!profile.nomAutoEcole?.trim()) {
          showMessage("Le nom de l'auto-école est requis", "error");
          setSaving(false);
          return;
        }

        if (!profile.codeEtablissement?.trim()) {
          showMessage("Le code établissement est requis", "error");
          setSaving(false);
          return;
        }

        if (!profile.identifiantFiscal?.trim()) {
          showMessage("L'identifiant fiscal est requis", "error");
          setSaving(false);
          return;
        }

        if (!profile.adresse.rue?.trim()) {
          showMessage("La rue est requise", "error");
          setSaving(false);
          return;
        }

        if (!profile.adresse.ville?.trim()) {
          showMessage("La ville est requise", "error");
          setSaving(false);
          return;
        }

        if (!profile.adresse.gouvernorat?.trim()) {
          showMessage("Le gouvernorat est requis", "error");
          setSaving(false);
          return;
        }
      }

      const dataToSend = {
        nomProp: profile.nom,
        prenomProp: profile.prenom,
        telephone: profile.telephone,
        nomAutoEcole: profile.nomAutoEcole,
        codeEtablissement: profile.codeEtablissement,
        identifiantFiscal: profile.identifiantFiscal,
        typePermisCodes: profile.typePermisCodes,
        adresse: {
          rue: profile.adresse.rue,
          ville: profile.adresse.ville,
          gouvernorat: profile.adresse.gouvernorat,
          pays: profile.adresse.pays,
        },
      };

      await updateProfile(dataToSend);

      const updatedProfile = await getProfile();

      setProfile({
        nom: updatedProfile.nomProp || "",
        prenom: updatedProfile.prenomProp || "",
        email: updatedProfile.email || "",
        telephone: updatedProfile.telephone || "",
        codeEtablissement: updatedProfile.codeEtablissement || "",
        nomAutoEcole: updatedProfile.nomAutoEcole || "",
        identifiantFiscal: updatedProfile.identifiantFiscal || "",
        typePermisCodes: updatedProfile.typePermisCodes || [],
        adresse: {
          rue: updatedProfile.adresse?.rue || "",
          ville: updatedProfile.adresse?.ville || "",
          gouvernorat: updatedProfile.adresse?.gouvernorat || "",
          pays: updatedProfile.adresse?.pays || "",
        },
      });

      setEditMode(false);
      showMessage("Profil mis à jour avec succès !", "success");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour du profil";
      showMessage(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const fieldProps = {
    fullWidth: true,
    variant: "outlined",
    size: "medium",
    disabled: !editMode,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Alert severity="error">Erreur chargement profil</Alert>
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
          <Typography color="text.secondary">Gérez vos informations</Typography>
        </Box>

        {/* BOUTONS */}
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

      {/* ✅ MESSAGE TEMPORAIRE AU-DESSUS DU FORMULAIRE AVEC COULEURS PERSONNALISÉES */}
      <Collapse in={message.show}>
        <Alert
          severity={message.severity}
          sx={{
            mb: 3,
            backgroundColor:
              message.severity === "success" ? "#d4edda" : "#f8d7da",
            color: message.severity === "success" ? "#155724" : "#721c24",
            border:
              message.severity === "success"
                ? "1px solid #c3e6cb"
                : "1px solid #f5c6cb",
            "& .MuiAlert-icon": {
              color: message.severity === "success" ? "#155724" : "#721c24",
            },
          }}
          onClose={() => setMessage({ ...message, show: false })}
          icon={false}
        >
          {message.text}
        </Alert>
      </Collapse>

      {/* CONTENU */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* INFORMATIONS PERSONNELLES + TYPES DE PERMIS */}
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
              required
            />
            <TextField
              {...fieldProps}
              label="Prénom"
              name="prenom"
              value={profile.prenom}
              onChange={handleChange}
              required
            />
            <TextField
              {...fieldProps}
              label="Email"
              value={profile.email}
              disabled
            />
            <TextField
              {...fieldProps}
              label="Téléphone"
              name="telephone"
              value={profile.telephone}
              onChange={handleChange}
              required
            />

            {/* ✅ TYPES DE PERMIS BLEU CLAIR */}
            <Typography fontWeight={600} mt={2}>
              Types de permis
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {PERMIS_OPTIONS.map((code) => {
                const selected = profile.typePermisCodes.includes(code);

                return (
                  <Button
                    key={code}
                    onClick={() => handlePermisChange(code)}
                    disabled={!editMode}
                    sx={{
                      borderRadius: "20px",
                      px: 2,
                      fontWeight: 600,
                      backgroundColor: selected ? "#bbdefb" : "transparent",
                      color: "#0d47a1",
                      border: "1px solid #90caf9",
                      "&:hover": {
                        backgroundColor: selected ? "#90caf9" : "#e3f2fd",
                      },
                    }}
                  >
                    {code}
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        </Paper>

        {/* AUTO-ECOLE */}
        {user?.role === "Proprietaire" && (
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
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
              <TextField
                {...fieldProps}
                label="Code établissement"
                name="codeEtablissement"
                value={profile.codeEtablissement}
                onChange={handleChange}
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
              <TextField
                {...fieldProps}
                label="Identifiant fiscal"
                name="identifiantFiscal"
                value={profile.identifiantFiscal}
                onChange={handleChange}
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />

              {/* ✅ ADRESSE */}
              <Typography fontWeight={600}>Adresse</Typography>
              <TextField
                {...fieldProps}
                label="Rue"
                name="adresse.rue"
                value={profile.adresse.rue}
                onChange={handleChange}
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
              <TextField
                {...fieldProps}
                label="Ville"
                name="adresse.ville"
                value={profile.adresse.ville}
                onChange={handleChange}
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
              <TextField
                {...fieldProps}
                label="Gouvernorat"
                name="adresse.gouvernorat"
                value={profile.adresse.gouvernorat}
                onChange={handleChange}
                required={user?.role === "Proprietaire"}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
              <TextField
                {...fieldProps}
                label="Pays"
                name="adresse.pays"
                value={profile.adresse.pays}
                onChange={handleChange}
                disabled={!editMode || user?.role !== "Proprietaire"}
              />
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default ProfileProprietaire;
