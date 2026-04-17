// src/components/common/seances/SeanceCodeForm.jsx
import React, { useState, useEffect } from "react";
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
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Box,
  Autocomplete,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { ThemeCode, THEME_CODE_LABELS } from "../../../enums";

const SeanceCodeForm = ({
  open,
  onClose,
  onSubmit,
  secretaires = [],
  candidatsDisponibles = [],
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    heureDebut: "09:00",
    dureeMinutes: 120,
    theme: "",
    capaciteMax: 20,
    secretaireId: "",
    candidatsIds: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString(),
        heureDebut: initialData.heureDebut || "09:00",
        dureeMinutes: initialData.dureeMinutes || 120,
        theme: initialData.theme || "",
        capaciteMax: initialData.capaciteMax || 20,
        secretaireId: initialData.secretaireId || "",
        candidatsIds: initialData.candidatsIds || [],
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.secretaireId) {
      setError("Veuillez sélectionner un secrétaire responsable");
      return;
    }

    if (formData.candidatsIds.length === 0) {
      setError("Veuillez sélectionner au moins un candidat");
      return;
    }

    setError("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de la planification");
    }
  };

  const themesDisponibles = Object.entries(ThemeCode).map(([key, value]) => ({
    value,
    label: THEME_CODE_LABELS[value]?.label || key,
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Planifier une séance de code</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Date et heure"
                value={new Date(formData.date)}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData({ ...formData, date: newValue.toISOString() });
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: { mb: 2 },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Durée (minutes)"
                type="number"
                value={formData.dureeMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dureeMinutes: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 60, max: 240, step: 15 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacité maximale"
                type="number"
                value={formData.capaciteMax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capaciteMax: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Thème</InputLabel>
                <Select
                  value={formData.theme}
                  label="Thème"
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                >
                  {themesDisponibles.map((theme) => (
                    <MenuItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Secrétaire responsable</InputLabel>
                <Select
                  value={formData.secretaireId}
                  label="Secrétaire responsable"
                  onChange={(e) =>
                    setFormData({ ...formData, secretaireId: e.target.value })
                  }
                >
                  {secretaires.map((secretaire) => (
                    <MenuItem key={secretaire.id} value={secretaire.id}>
                      {secretaire.prenom} {secretaire.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={candidatsDisponibles}
                getOptionLabel={(option) =>
                  `${option.prenom} ${option.nom} - ${option.numeroCIN}`
                }
                value={candidatsDisponibles.filter((c) =>
                  formData.candidatsIds.includes(c.id),
                )}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    candidatsIds: newValue.map((v) => v.id),
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Candidats participants"
                    placeholder="Sélectionner les candidats"
                    required
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.prenom} ${option.nom}`}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Planifier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeanceCodeForm;
