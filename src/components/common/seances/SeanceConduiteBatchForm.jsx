// src/components/common/seances/SeanceConduiteBatchForm.jsx
import React, { useState } from "react";
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
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TypeConduite, TYPE_CONDUITE_LABELS } from "../../../enums";

const SeanceConduiteBatchForm = ({
  open,
  onClose,
  onSubmit,
  moniteurs = [],
  candidats = [],
  loading = false,
}) => {
  const [seances, setSeances] = useState([
    {
      id: Date.now(),
      date: new Date(),
      heureDebut: "09:00",
      dureeMinutes: 60,
      typeConduite: TypeConduite.MANOEUVRE,
      candidatId: "",
      moniteurId: "",
    },
  ]);
  const [error, setError] = useState("");

  const addSeance = () => {
    setSeances([
      ...seances,
      {
        id: Date.now(),
        date: new Date(),
        heureDebut: "09:00",
        dureeMinutes: 60,
        typeConduite: TypeConduite.MANOEUVRE,
        candidatId: "",
        moniteurId: "",
      },
    ]);
  };

  const removeSeance = (id) => {
    if (seances.length === 1) {
      setError("Vous devez avoir au moins une séance");
      return;
    }
    setSeances(seances.filter((s) => s.id !== id));
  };

  const updateSeance = (id, field, value) => {
    setSeances(
      seances.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const validateSeance = (seance) => {
    if (!seance.candidatId || !seance.moniteurId) {
      return "Veuillez sélectionner un candidat et un moniteur";
    }
    if (!seance.date) {
      return "Veuillez sélectionner une date";
    }
    if (!seance.heureDebut) {
      return "Veuillez saisir une heure de début";
    }
    if (!seance.dureeMinutes || seance.dureeMinutes < 30) {
      return "La durée doit être d'au moins 30 minutes";
    }
    return null;
  };

  const handleSubmit = async () => {
    // Validate all seances
    for (const seance of seances) {
      const validationError = validateSeance(seance);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError("");
    
    // Format data for batch submission
    const submitData = seances.map((seance) => ({
      date: seance.date.toISOString(),
      heureDebut: seance.heureDebut,
      dureeMinutes: parseInt(seance.dureeMinutes),
      typeConduite: parseInt(seance.typeConduite),
      candidatId: parseInt(seance.candidatId),
      moniteurId: parseInt(seance.moniteurId),
    }));

    try {
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la planification");
    }
  };

  const handleClose = () => {
    setError("");
    setSeances([
      {
        id: Date.now(),
        date: new Date(),
        heureDebut: "09:00",
        dureeMinutes: 60,
        typeConduite: TypeConduite.MANOEUVRE,
        candidatId: "",
        moniteurId: "",
      },
    ]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Planifier des séances de conduite</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Stack spacing={3}>
            {seances.map((seance, index) => (
              <Paper
                key={seance.id}
                elevation={2}
                sx={{ p: 2, position: "relative" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    Séance #{index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeSeance(seance.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Stack spacing={2}>
                  {/* Date */}
                  <DatePicker
                    label="Date"
                    value={seance.date}
                    onChange={(newValue) => {
                      if (newValue) {
                        updateSeance(seance.id, "date", newValue);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />

                  {/* Heure de début */}
                  <TextField
                    fullWidth
                    label="Heure de début"
                    type="time"
                    value={seance.heureDebut}
                    onChange={(e) =>
                      updateSeance(seance.id, "heureDebut", e.target.value)
                    }
                    required
                    InputLabelProps={{ shrink: true }}
                  />

                  {/* Durée */}
                  <TextField
                    fullWidth
                    label="Durée (minutes)"
                    type="number"
                    value={seance.dureeMinutes}
                    onChange={(e) =>
                      updateSeance(
                        seance.id,
                        "dureeMinutes",
                        parseInt(e.target.value) || 0
                      )
                    }
                    required
                    inputProps={{ min: 30, max: 180, step: 15 }}
                  />

                  {/* Type de conduite */}
                  <FormControl fullWidth required>
                    <InputLabel>Type de conduite</InputLabel>
                    <Select
                      value={seance.typeConduite}
                      label="Type de conduite"
                      onChange={(e) =>
                        updateSeance(seance.id, "typeConduite", e.target.value)
                      }
                    >
                      {Object.entries(TypeConduite)
                        .filter(([key]) => isNaN(parseInt(key)))
                        .map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {TYPE_CONDUITE_LABELS[value]?.label || key}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {/* Candidat */}
                  <FormControl fullWidth required>
                    <InputLabel>Candidat</InputLabel>
                    <Select
                      value={seance.candidatId}
                      label="Candidat"
                      onChange={(e) =>
                        updateSeance(seance.id, "candidatId", e.target.value)
                      }
                    >
                      {candidats.map((candidat) => (
                        <MenuItem key={candidat.id} value={candidat.id.toString()}>
                          {candidat.prenom} {candidat.nom} - {candidat.numeroCIN}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Moniteur */}
                  <FormControl fullWidth required>
                    <InputLabel>Moniteur</InputLabel>
                    <Select
                      value={seance.moniteurId}
                      label="Moniteur"
                      onChange={(e) =>
                        updateSeance(seance.id, "moniteurId", e.target.value)
                      }
                    >
                      {moniteurs.map((moniteur) => (
                        <MenuItem key={moniteur.id} value={moniteur.id.toString()}>
                          {moniteur.prenom} {moniteur.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSeance}
              fullWidth
            >
              Ajouter une séance
            </Button>
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Planifier toutes les séances"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeanceConduiteBatchForm;