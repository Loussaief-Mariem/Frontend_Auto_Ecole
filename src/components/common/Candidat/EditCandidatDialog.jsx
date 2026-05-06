import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CompteForm from "./CompteForm";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import candidatPlaceholder from "../../../assets/candidat.jpg";
import {
  Sexe,
  TypeFormation,
  TypeDocument,
  StatutDocument,
} from "../../../enums";

const DOCUMENT_TYPES = [
  TypeDocument.PhotoIdentite,
  TypeDocument.CopieCIN,
  TypeDocument.CertificatMedical,
];

const DOCUMENT_TYPE_LABELS = {
  [TypeDocument.PhotoIdentite]: "Photo d'identité",
  [TypeDocument.CopieCIN]: "Copie CIN",
  [TypeDocument.CertificatMedical]: "Certificat médical",
};

function initDocumentChecks(dossierCandidat) {
  const docs = dossierCandidat?.documents || [];
  const next = {};
  for (const type of DOCUMENT_TYPES) {
    const found = docs.find((d) => Number(d.typeDocument) === type);
    next[type] = found
      ? {
          id: found.id,
          recu: Number(found.statutDocument) === StatutDocument.Recu,
        }
      : { id: 0, recu: false };
  }
  return next;
}

function buildDocumentsPayload(formData) {
  return DOCUMENT_TYPES.map((type) => {
    const meta = formData.documentChecks?.[type] ?? { id: 0, recu: false };
    return {
      id: meta.id ?? 0,
      statutDocument: meta.recu
        ? StatutDocument.Recu
        : StatutDocument.Manquant,
    };
  });
}

function getApiOrigin() {
  const base = api.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/i, "") || "";
}

function resolveCandidatPhotoSrc(photoPath, placeholder) {
  const raw =
    photoPath == null || photoPath === ""
      ? ""
      : String(photoPath).trim();
  if (!raw) return placeholder;
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = getApiOrigin();
  if (!origin) return placeholder;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

/** Corps PUT `updateCandidatProfil` (aligné sur le contrat API). */
function buildUpdateProfilPayload(formData, candidat, autoEcoleId) {
  const sexeVal =
    formData.sexe === "" ? null : Number(formData.sexe);

  const concatenatedAdresse = `${formData.adresse?.rue || ""}, ${formData.adresse?.ville || ""}`;

  const compte = {
    id: candidat?.compte?.id ?? 0,
    login: formData.compte?.login ?? "",
    telephone: formData.compte?.telephone ?? "",
  };

  const contrat = candidat?.contrat;
  const idContrat = contrat?.id ?? 0;

  const dossierCandidat = candidat?.dossierCandidat;
  const documentsPayload = buildDocumentsPayload(formData);
  const dossier = dossierCandidat
    ? {
        id: dossierCandidat.id,
        etatDossier: dossierCandidat.etatDossier,
        candidatId: dossierCandidat.candidatId ?? candidat?.id ?? 0,
        documents: documentsPayload,
      }
    : {
        id: 0,
        etatDossier: 0,
        candidatId: candidat?.id ?? 0,
        documents: documentsPayload,
      };

  const typeFormationVal =
    formData.typeFormation === ""
      ? null
      : Number(formData.typeFormation);

  return {
    id: Number(formData.id) || 0,
    nom: formData.nom,
    prenom: formData.prenom,
    nomEpoux: sexeVal === Sexe.Homme ? "" : (formData.nomEpoux ?? ""),
    numeroCIN: formData.numeroCIN,
    dateNaissance: formData.dateNaissance
      ? new Date(formData.dateNaissance).toISOString()
      : null,
    lieuDeNaissance: formData.lieuDeNaissance ?? "",
    dateDelivranceCIN: formData.dateDelivranceCIN
      ? new Date(formData.dateDelivranceCIN).toISOString()
      : null,
    sexe: sexeVal,
    adresse: concatenatedAdresse,
    autoEcoleId: autoEcoleId,
    compte: {
      id: candidat?.compte?.id ?? 0,
      login: formData.compte?.login ?? "",
    },
    telephone: formData.compte?.telephone ?? "",
    idContrat,
    typePermisCode: formData.typePermisCode ?? "",
    typeFormation: typeFormationVal,
    dossier,
  };
}

const EditCandidatDialog = ({ open, onClose, candidat, onSave, onUploadPhoto }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id: "",
    nom: "",
    prenom: "",
    nomEpoux: "",
    numeroCIN: "",
    dateNaissance: null,
    dateDelivranceCIN: null,
    lieuDeNaissance: "",
    sexe: "",
    typePermisCode: "B",
    typeFormation: "",
    adresse: {
      rue: "",
      ville: "",
    },
    compte: {
      login: "",
      telephone: "",
    },
    documentChecks: initDocumentChecks(null),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateErrors, setDateErrors] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const photoInputRef = useRef(null);

  const typePermisList = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];

  useEffect(() => {
    if (candidat && open) {
      const sexeNum =
        candidat.sexe !== undefined && candidat.sexe !== null
          ? Number(candidat.sexe)
          : "";
      setFormData({
        id: candidat.id || "",
        nom: candidat.nom || "",
        prenom: candidat.prenom || "",
        nomEpoux:
          sexeNum === Sexe.Homme ? "" : candidat.nomEpoux || "",
        numeroCIN: candidat.numeroCIN || "",
        dateNaissance: candidat.dateNaissance
          ? new Date(candidat.dateNaissance)
          : null,
        dateDelivranceCIN: candidat.dateDelivranceCIN
          ? new Date(candidat.dateDelivranceCIN)
          : null,
        lieuDeNaissance: candidat.lieuDeNaissance || "",
        sexe: sexeNum === "" ? "" : sexeNum,
        typePermisCode: candidat.typePermisCode || "B",
        typeFormation:
          candidat.typeFormation !== undefined &&
          candidat.typeFormation !== null
            ? Number(candidat.typeFormation)
            : "",
        adresse: typeof candidat.adresse === "string" 
          ? {
              rue: (candidat.adresse.split(",")[0] || "").trim(),
              ville: (candidat.adresse.split(",")[1] || "").trim(),
            }
          : {
              rue: candidat.adresse?.rue || "",
              ville: candidat.adresse?.ville || "",
            },
        compte: {
          login: candidat.compte?.login ?? "",
          telephone: candidat.telephone || candidat.compte?.telephone || "",
        },
        documentChecks: initDocumentChecks(candidat.dossierCandidat),
      });
    }
  }, [candidat, open]);

  useEffect(() => {
    setPhotoPreviewError(false);
  }, [candidat?.id, candidat?.photoPath, candidat?.PhotoPath, open]);

  const validateCINDates = (dateNaissance, dateDelivranceCIN) => {
    const errors = {};

    if (!dateDelivranceCIN) {
      errors.dateDelivranceCIN = "La date de délivrance CIN est requise";
      return errors;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthDate = new Date(dateNaissance);
    birthDate.setHours(0, 0, 0, 0);

    const deliverDate = new Date(dateDelivranceCIN);
    deliverDate.setHours(0, 0, 0, 0);

    if (deliverDate > today) {
      errors.dateDelivranceCIN =
        "La date de délivrance CIN ne peut pas être dans le futur";
    }

    if (deliverDate <= birthDate) {
      errors.dateDelivranceCIN =
        "La date de délivrance CIN doit être postérieure à la date de naissance";
    }

    const ageAtDeliver = deliverDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = deliverDate.getMonth() - birthDate.getMonth();
    let exactAge = ageAtDeliver;
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && deliverDate.getDate() < birthDate.getDate())
    ) {
      exactAge--;
    }

    if (exactAge < 18) {
      errors.dateDelivranceCIN = `La CIN ne peut pas être délivrée avant 18 ans (âge: ${exactAge} ans)`;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "sexe" && Number(value) === Sexe.Homme) {
        next.nomEpoux = "";
      }
      return next;
    });
  };

  const handleDateChange = (field, date) => {
    setFormData({ ...formData, [field]: date });

    if (field === "dateDelivranceCIN" && formData.dateNaissance) {
      const errors = validateCINDates(formData.dateNaissance, date);
      setDateErrors(errors);
    }
  };

  const setCompte = (compte) => {
    setFormData((prev) => ({ ...prev, compte }));
  };

  const handleDocumentRecuChange = (typeDocument, checked) => {
    setFormData((prev) => ({
      ...prev,
      documentChecks: {
        ...prev.documentChecks,
        [typeDocument]: {
          ...(prev.documentChecks?.[typeDocument] ?? { id: 0, recu: false }),
          recu: checked,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    // Validation des dates CIN
    if (formData.dateNaissance && formData.dateDelivranceCIN) {
      const errors = validateCINDates(
        formData.dateNaissance,
        formData.dateDelivranceCIN,
      );
      if (Object.keys(errors).length > 0) {
        setError(Object.values(errors).join(", "));
        return;
      }
    }

    if (!formData.dateDelivranceCIN) {
      setError("La date de délivrance CIN est obligatoire");
      return;
    }

    if (formData.sexe === "") {
      setError("Le sexe est obligatoire");
      return;
    }

    if (formData.typeFormation === "") {
      setError("Le type de formation est obligatoire");
      return;
    }

    setLoading(true);
    setError("");

    const payload = buildUpdateProfilPayload(formData, candidat, user?.autoEcoleId);

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de la modification du candidat");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoInputChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || typeof onUploadPhoto !== "function") return;
    setPhotoUploading(true);
    setError("");
    try {
      await onUploadPhoto(file);
      setPhotoPreviewError(false);
    } catch (err) {
      setError(err.message || "Échec du téléversement de la photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const photoPathRaw =
    candidat?.photoPath ?? candidat?.PhotoPath ?? null;
  const avatarPhotoSrc = photoPreviewError
    ? candidatPlaceholder
    : resolveCandidatPhotoSrc(photoPathRaw, candidatPlaceholder);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: "90vh" },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: "primary.main", color: "white" }}>
        <Typography variant="h6" component="div">
          Modifier le candidat
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {candidat ? (
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Avatar
              src={avatarPhotoSrc}
              alt={`${candidat.prenom ?? ""} ${candidat.nom ?? ""}`.trim() || "Candidat"}
              onError={() => setPhotoPreviewError(true)}
              sx={{
                width: 100,
                height: 100,
                flexShrink: 0,
                border: "2px solid",
                borderColor: "divider",
                boxShadow: 1,
                bgcolor: "grey.100",
                "& img": { objectFit: "cover" },
              }}
            >
              {candidat.prenom?.[0]}
              {candidat.nom?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Photo du candidat
              </Typography>
              {typeof onUploadPhoto === "function" && candidat.id ? (
                <>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoInputChange}
                  />
                  <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        photoUploading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <PhotoCameraIcon />
                        )
                      }
                      disabled={photoUploading}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {photoUploading ? "Envoi…" : "Changer la photo"}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG… (met à jour PhotoPath)
                    </Typography>
                  </Stack>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Aperçu depuis le profil
                </Typography>
              )}
            </Box>
          </Box>
        ) : null}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            {/* Informations personnelles */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Informations personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="small"
                  />
                </Grid>
                {!(formData.sexe !== "" && Number(formData.sexe) === Sexe.Homme) && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nom d'époux"
                      name="nomEpoux"
                      value={formData.nomEpoux}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Sexe</InputLabel>
                    <Select
                      name="sexe"
                      value={formData.sexe === "" ? "" : formData.sexe}
                      onChange={handleChange}
                      label="Sexe"
                    >
                      <MenuItem value="">Sélectionner</MenuItem>
                      <MenuItem value={Sexe.Homme}>Masculin</MenuItem>
                      <MenuItem value={Sexe.Femme}>Féminin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Numéro CIN"
                    name="numeroCIN"
                    value={formData.numeroCIN}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de naissance"
                    value={formData.dateNaissance}
                    onChange={(date) => handleDateChange("dateNaissance", date)}
                    sx={{ width: "100%" }}
                    slotProps={{ textField: { size: "small" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Lieu de naissance"
                    name="lieuDeNaissance"
                    value={formData.lieuDeNaissance}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de délivrance CIN"
                    value={formData.dateDelivranceCIN}
                    onChange={(date) =>
                      handleDateChange("dateDelivranceCIN", date)
                    }
                    sx={{ width: "100%" }}
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!dateErrors.dateDelivranceCIN,
                        helperText: dateErrors.dateDelivranceCIN,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Compte */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Informations de compte
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <CompteForm
                key={candidat?.id ?? "compte"}
                setCompte={setCompte}
                initialCompte={formData.compte}
              />
            </Box>

            {/* Adresse */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Adresse
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rue"
                    fullWidth
                    size="small"
                    value={formData.adresse.rue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adresse: { ...prev.adresse, rue: e.target.value }
                    }))}
                    placeholder="Ex: Route gremda"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ville"
                    fullWidth
                    size="small"
                    value={formData.adresse.ville}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      adresse: { ...prev.adresse, ville: e.target.value }
                    }))}
                    placeholder="Ex: Tunisie"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Documents du dossier */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Documents du dossier
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Cochez les pièces déjà reçues (sinon elles restent « manquantes »).
              </Typography>
              <Stack spacing={0.5}>
                {DOCUMENT_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={
                          formData.documentChecks?.[type]?.recu ?? false
                        }
                        onChange={(e) =>
                          handleDocumentRecuChange(type, e.target.checked)
                        }
                        size="small"
                      />
                    }
                    label={DOCUMENT_TYPE_LABELS[type]}
                  />
                ))}
              </Stack>
            </Box>

            {/* Formation & Permis */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Formation & Permis
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type de permis</InputLabel>
                    <Select
                      name="typePermisCode"
                      value={formData.typePermisCode}
                      onChange={handleChange}
                      label="Type de permis"
                    >
                      {typePermisList.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type de formation</InputLabel>
                    <Select
                      name="typeFormation"
                      value={
                        formData.typeFormation === ""
                          ? ""
                          : formData.typeFormation
                      }
                      onChange={handleChange}
                      label="Type de formation"
                    >
                      <MenuItem value="">Sélectionner</MenuItem>
                      <MenuItem value={TypeFormation.Theorique}>
                        Code seulement
                      </MenuItem>
                      <MenuItem value={TypeFormation.Pratique}>
                        Conduite seulement
                      </MenuItem>
                      <MenuItem value={TypeFormation.Complet}>
                        Formation complète
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            </Box>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCandidatDialog;
