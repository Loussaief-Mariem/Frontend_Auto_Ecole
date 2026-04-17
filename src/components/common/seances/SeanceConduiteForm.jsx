// src/components/common/seances/SeanceConduiteForm.jsx
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
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { TypeConduite, TYPE_CONDUITE_LABELS } from "../../../enums";

const SeanceConduiteForm = ({
  open,
  onClose,
  onSubmit,
  moniteurs = [],
  candidats = [],
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    heureDebut: "09:00",
    dureeMinutes: 60,
    typeConduite: TypeConduite.VILLE,
    candidatId: "",
    moniteurId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString(),
        heureDebut: initialData.heureDebut || "09:00",
        dureeMinutes: initialData.dureeMinutes || 60,
        typeConduite: initialData.typeConduite || TypeConduite.VILLE,
        candidatId: initialData.candidatId || "",
        moniteurId: initialData.moniteurId || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.candidatId || !formData.moniteurId) {
      setError("Veuillez sélectionner un candidat et un moniteur");
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Planifier une séance de conduite</DialogTitle>
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
                inputProps={{ min: 30, max: 180, step: 15 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type de conduite</InputLabel>
                <Select
                  value={formData.typeConduite}
                  label="Type de conduite"
                  onChange={(e) =>
                    setFormData({ ...formData, typeConduite: e.target.value })
                  }
                >
                  {Object.entries(TypeConduite).map(([key, value]) => (
                    <MenuItem key={value} value={value}>
                      {TYPE_CONDUITE_LABELS[value]?.label || key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Candidat</InputLabel>
                <Select
                  value={formData.candidatId}
                  label="Candidat"
                  onChange={(e) =>
                    setFormData({ ...formData, candidatId: e.target.value })
                  }
                >
                  {candidats.map((candidat) => (
                    <MenuItem key={candidat.id} value={candidat.id}>
                      {candidat.prenom} {candidat.nom} - {candidat.numeroCIN}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Moniteur</InputLabel>
                <Select
                  value={formData.moniteurId}
                  label="Moniteur"
                  onChange={(e) =>
                    setFormData({ ...formData, moniteurId: e.target.value })
                  }
                >
                  {moniteurs.map((moniteur) => (
                    <MenuItem key={moniteur.id} value={moniteur.id}>
                      {moniteur.prenom} {moniteur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default SeanceConduiteForm;
