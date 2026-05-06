// src/components/common/seances/SeanceCodeForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { planifierSeance, updateSeance } from "../../../api/seanceCodeService";
import { getContratsCompletTheorique } from "../../../api/contratService";

// Thèmes de code enum (correspond à l'enum backend)
const THEMES_CODE = {
  Signalisation: 0,
  ConducteurVehicule: 1,
  ArretStationnement: 2,
  CroisementDepassement: 3,
  Priorite: 4,
  Circulation: 5,
  Delits: 6,
  PremiersSecours: 7,
  MaintenanceEnergie: 8,
  TransportMatieresDangereuses: 9,
};

// Labels en français pour les thèmes
const THEME_LABELS = {
  [THEMES_CODE.Signalisation]: "Signalisation routière",
  [THEMES_CODE.ConducteurVehicule]: "Conducteur et véhicule",
  [THEMES_CODE.ArretStationnement]: "Arrêt et stationnement",
  [THEMES_CODE.CroisementDepassement]: "Croisement et dépassement",
  [THEMES_CODE.Priorite]: "Règles de priorité",
  [THEMES_CODE.Circulation]: "Circulation routière",
  [THEMES_CODE.Delits]: "Délits et infractions",
  [THEMES_CODE.PremiersSecours]: "Premiers secours",
  [THEMES_CODE.MaintenanceEnergie]: "Maintenance et énergie",
  [THEMES_CODE.TransportMatieresDangereuses]:
    "Transport de matières dangereuses",
};

// Mapping valeur numérique -> nom du thème (string)
const getThemeNameFromValue = (value) => {
  const themeMap = {
    0: "Signalisation",
    1: "ConducteurVehicule",
    2: "ArretStationnement",
    3: "CroisementDepassement",
    4: "Priorite",
    5: "Circulation",
    6: "Delits",
    7: "PremiersSecours",
    8: "MaintenanceEnergie",
    9: "TransportMatieresDangereuses",
  };
  return themeMap[value] || "Signalisation";
};

const SeanceCodeForm = ({
  open,
  onClose,
  onSuccess,
  autoEcoleId,
  secretaireId,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    heureDebut: "09:00",
    dureeMinutes: 60,
    themeCode: "", // Stocke la valeur numérique
    capaciteMax: 10,
    secretaireId: secretaireId || "",
    contratsIds: [],
  });
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContrats, setLoadingContrats] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && autoEcoleId) {
      loadContrats();
    }
    
    if (open && initialData) {
      console.log("Données initiales pour modification:", initialData);
      
      // Trouver la valeur numérique du thème à partir de son nom
      const themeValue = Object.keys(THEMES_CODE).find(key => key === initialData.theme);
      const themeNum = themeValue !== undefined ? THEMES_CODE[themeValue] : "";

      setFormData({
        id: initialData.id,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        heureDebut: initialData.heureDebut || "09:00",
        dureeMinutes: initialData.dureeMinutes || 60,
        themeCode: themeNum,
        capaciteMax: initialData.capaciteMax || 10,
        secretaireId: initialData.secretaireId || secretaireId || "",
        contratsIds: initialData.presences ? initialData.presences.map(p => p.contratId) : [],
      });
    } else if (open && !initialData) {
      // Reset form if opening for new seance
      setFormData({
        date: new Date(),
        heureDebut: "09:00",
        dureeMinutes: 60,
        themeCode: "",
        capaciteMax: 10,
        secretaireId: secretaireId || "",
        contratsIds: [],
      });
    }
  }, [open, autoEcoleId, initialData, secretaireId]);

  const loadContrats = async () => {
    setLoadingContrats(true);
    try {
      const data = await getContratsCompletTheorique(autoEcoleId);
      console.log("Contrats chargés:", data);
      setContrats(data || []);
    } catch (err) {
      console.error("Erreur chargement contrats:", err);
      setError("Impossible de charger les contrats");
    } finally {
      setLoadingContrats(false);
    }
  };

  const getCandidatFullName = (contrat) => {
    if (contrat.candidatNom && contrat.candidatPrenom) {
      return `${contrat.candidatPrenom} ${contrat.candidatNom}`;
    }
    if (contrat.candidat) {
      return `${contrat.candidat.prenom || ""} ${contrat.candidat.nom || ""}`.trim();
    }
    return "Nom inconnu";
  };

  const getCandidatCin = (contrat) => {
    if (contrat.cin) {
      return contrat.cin;
    }
    if (contrat.candidat?.numeroCIN) {
      return contrat.candidat.numeroCIN;
    }
    return "";
  };

  const getParticipantLabel = (contrat) => {
    const fullName = getCandidatFullName(contrat);
    const cin = getCandidatCin(contrat);
    const permis = contrat.typePermisCode || "";

    if (cin) {
      return `${fullName} (CIN: ${cin}) - Permis ${permis}`;
    }
    return `${fullName} - Permis ${permis}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.date) {
      setError("Veuillez sélectionner une date");
      return;
    }
    if (!formData.heureDebut) {
      setError("Veuillez saisir une heure de début");
      return;
    }
    if (!formData.dureeMinutes || formData.dureeMinutes < 30) {
      setError("La durée doit être d'au moins 30 minutes");
      return;
    }
    if (formData.themeCode === "" || formData.themeCode === undefined) {
      setError("Veuillez sélectionner un thème");
      return;
    }
    if (!formData.capaciteMax || formData.capaciteMax < 1) {
      setError("La capacité maximale doit être d'au moins 1");
      return;
    }
    if (formData.contratsIds.length === 0) {
      setError("Veuillez sélectionner au moins un contrat");
      return;
    }
    if (formData.contratsIds.length > formData.capaciteMax) {
      setError(
        `Vous avez sélectionné ${formData.contratsIds.length} participants mais la capacité maximale est de ${formData.capaciteMax}`,
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const themeName = getThemeNameFromValue(parseInt(formData.themeCode));

      const dataToSend = {
        date: formData.date.toISOString(),
        heureDebut: formData.heureDebut,
        dureeMinutes: parseInt(formData.dureeMinutes),
        theme: themeName,
        capaciteMax: parseInt(formData.capaciteMax),
        secretaireId: parseInt(formData.secretaireId),
        contratsIds: formData.contratsIds.map((id) => parseInt(id)),
      };

      if (initialData?.id) {
        dataToSend.id = initialData.id;
        console.log("Mise à jour séance:", dataToSend);
        await updateSeance(dataToSend);
      } else {
        console.log("Création séance:", dataToSend);
        await planifierSeance(dataToSend);
      }

      if (onSuccess) {
        await onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Erreur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la planification",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: new Date(),
      heureDebut: "09:00",
      dureeMinutes: 60,
      themeCode: "",
      capaciteMax: 10,
      secretaireId: secretaireId || "",
      contratsIds: [],
    });
    setError("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          {initialData ? "Modifier la séance" : "Nouvelle séance de code"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Remplissez les informations ci-dessous pour planifier votre séance
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(newValue) => {
                if (newValue) {
                  setFormData({ ...formData, date: newValue });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />

            <TextField
              fullWidth
              label="Heure de début"
              type="time"
              value={formData.heureDebut}
              onChange={(e) =>
                setFormData({ ...formData, heureDebut: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Durée (minutes)"
              type="number"
              value={formData.dureeMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dureeMinutes: parseInt(e.target.value) || 0,
                })
              }
              required
              inputProps={{ min: 30, max: 180, step: 15 }}
              helperText="Minimum 30 minutes, maximum 180 minutes"
            />

            <FormControl fullWidth required>
              <InputLabel>Thème de la séance</InputLabel>
              <Select
                value={formData.themeCode}
                onChange={(e) =>
                  setFormData({ ...formData, themeCode: e.target.value })
                }
                label="Thème de la séance"
              >
                <MenuItem value="" disabled>
                  Sélectionner un thème
                </MenuItem>
                {Object.entries(THEMES_CODE).map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {THEME_LABELS[value]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Capacité maximale"
              type="number"
              value={formData.capaciteMax}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capaciteMax: parseInt(e.target.value) || 0,
                })
              }
              required
              inputProps={{ min: 1, max: 50 }}
              helperText="Nombre maximum de participants (1-50)"
            />

            {!secretaireId && (
              <TextField
                fullWidth
                label="ID du secrétaire"
                type="number"
                value={formData.secretaireId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    secretaireId: parseInt(e.target.value) || "",
                  })
                }
                required
              />
            )}

            <FormControl fullWidth required>
              <InputLabel>Participants (Contrats)</InputLabel>
              <Select
                multiple
                value={formData.contratsIds}
                onChange={(e) =>
                  setFormData({ ...formData, contratsIds: e.target.value })
                }
                label="Participants (Contrats)"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const contrat = contrats.find((c) => c.id === value);
                      return (
                        <Chip
                          key={value}
                          label={
                            contrat
                              ? getParticipantLabel(contrat)
                              : `Contrat #${value}`
                          }
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {loadingContrats ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Chargement...
                  </MenuItem>
                ) : contrats.length === 0 ? (
                  <MenuItem disabled>Aucun contrat disponible</MenuItem>
                ) : (
                  contrats.map((contrat) => (
                    <MenuItem key={contrat.id} value={contrat.id}>
                      {getParticipantLabel(contrat)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingContrats}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            px: 4,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {loading ? "Enregistrement..." : (initialData ? "Enregistrer" : "Créer la séance")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeanceCodeForm;
