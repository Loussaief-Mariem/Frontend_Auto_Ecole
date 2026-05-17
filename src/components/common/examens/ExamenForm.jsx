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

// IMPORTANT: Définir l'énumération localement ou l'importer
const TypeExamenValues = {
  Code: 0,
  Circulation: 1,
  Manoeuvre: 2,
};

const ExamenForm = ({ open, onClose, onSave, contratId,  }) => {
  console.log("contratId", contratId);  
  const [formData, setFormData] = useState({
    contratId: contratId,
    typeExamen: TypeExamenValues.Code, // ← ICI: utiliser 0 au lieu de 'Code'
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

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else if (field === "typeExamen") {
      // Convertir la valeur string en nombre
      const numericValue =
        value === "Code"
          ? TypeExamenValues.Code
          : value === "Circulation"
            ? TypeExamenValues.Circulation
            : TypeExamenValues.Manoeuvre;
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Fonction pour obtenir le libellé à afficher
  const getTypeExamenLabel = (value) => {
    if (value === TypeExamenValues.Code) return "Code";
    if (value === TypeExamenValues.Circulation) return "Circulation";
    if (value === TypeExamenValues.Manoeuvre) return "Manoeuvre";
    return "Code";
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // S'assurer que typeExamen est bien un nombre
    const dataToSend = {
      ...formData,
      typeExamen: Number(formData.typeExamen), // Conversion explicite en nombre
    };

    console.log("Données envoyées:", dataToSend); // Debug: vérifier que typeExamen est un nombre

    // Vérification supplémentaire
    if (typeof dataToSend.typeExamen !== "number") {
      console.error("typeExamen n'est pas un nombre!", dataToSend.typeExamen);
      setError("Erreur de type d'examen");
      setLoading(false);
      return;
    }

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
              <Grid item xs={12}>
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

              <Grid item xs={12}>
                <DatePicker
                  label="Date de l'examen"
                  value={formData.date}
                  onChange={(newValue) => handleChange("date", newValue)}
                  minDate={new Date()}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12}>
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

              <Grid item xs={12}>
                <TextField
                  label="Centre d'examen"
                  fullWidth
                  required
                  value={formData.centreExamen}
                  onChange={(e) => handleChange("centreExamen", e.target.value)}
                  placeholder="Ex: Centre Sfax"
                />
              </Grid>

              <Grid item xs={12}>
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

              <Grid item xs={12}>
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
