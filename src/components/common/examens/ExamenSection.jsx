// src/components/common/examens/ExamenForm.jsx
import React, { useState } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { TypeExamen } from "../../../enums/index"; // Ajout de l'import

const ExamenForm = ({ open, onClose, onSave, contratId, typeExamen }) => {
  const [formData, setFormData] = useState({
    contratId: contratId,
    typeExamen:
      typeExamen === "Code"
        ? TypeExamen.Code
        : typeExamen === "Circulation"
          ? TypeExamen.Circulation
          : TypeExamen.Manoeuvre, // Convertir en nombre
    date: new Date(),
    heure: "09:00",
    centreExamen: "",
    lieu: "",
    convocation: {
      numeroListe: "",
      numeroConvocation: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mapping pour l'affichage
  const getTypeExamenLabel = (typeValue) => {
    switch (typeValue) {
      case TypeExamen.Code:
        return "Code";
      case TypeExamen.Circulation:
        return "Circulation";
      case TypeExamen.Manoeuvre:
        return "Manoeuvre";
      default:
        return "Code";
    }
  };

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else if (field === "typeExamen") {
      // Convertir la valeur sélectionnée en nombre
      const numericValue =
        value === "Code"
          ? TypeExamen.Code
          : value === "Circulation"
            ? TypeExamen.Circulation
            : TypeExamen.Manoeuvre;
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Vérifier que typeExamen est bien un nombre
    const dataToSend = {
      ...formData,
      typeExamen: Number(formData.typeExamen),
    };

    console.log("Données envoyées:", dataToSend); // Debug

    try {
      await onSave(dataToSend);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la programmation",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Programmer un examen - {getTypeExamenLabel(formData.typeExamen)}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type d'examen</InputLabel>
                  <Select
                    value={getTypeExamenLabel(formData.typeExamen)}
                    onChange={(e) => handleChange("typeExamen", e.target.value)}
                    label="Type d'examen"
                  >
                    <MenuItem value="Code">Code</MenuItem>
                    <MenuItem value="Circulation">Circulation</MenuItem>
                    <MenuItem value="Manoeuvre">Manoeuvre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de l'examen"
                  value={formData.date}
                  onChange={(newValue) => handleChange("date", newValue)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Heure"
                  type="time"
                  fullWidth
                  required
                  value={formData.heure}
                  onChange={(e) => handleChange("heure", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Centre d'examen"
                  fullWidth
                  required
                  value={formData.centreExamen}
                  onChange={(e) => handleChange("centreExamen", e.target.value)}
                  placeholder="Ex: Centre Sfax"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lieu"
                  fullWidth
                  required
                  value={formData.lieu}
                  onChange={(e) => handleChange("lieu", e.target.value)}
                  placeholder="Ex: Salle A"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 1 }}>
                  Informations de convocation
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro de liste"
                  fullWidth
                  required
                  value={formData.convocation.numeroListe}
                  onChange={(e) =>
                    handleChange("convocation.numeroListe", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro de convocation"
                  fullWidth
                  required
                  value={formData.convocation.numeroConvocation}
                  onChange={(e) =>
                    handleChange(
                      "convocation.numeroConvocation",
                      e.target.value,
                    )
                  }
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Programmer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamenForm;
