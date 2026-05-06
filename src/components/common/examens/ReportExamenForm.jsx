// src/components/common/examens/ReportExamenForm.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import WarningIcon from "@mui/icons-material/Warning";
import { isAfter, addDays, format, isBefore, isSameDay } from "date-fns";

const ReportExamenForm = ({ open, onClose, onSave, examen, examenId }) => {
  const [formData, setFormData] = useState({
    examenId: null,
    nouvelleDate: null,
    nouvelleHeure: null,
    nouveauLieu: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      const finalExamenId = examenId || examen?.id;
      console.log(
        "🔄 Initialisation ReportExamenForm - ID examen:",
        finalExamenId,
      );

      setFormData({
        examenId: finalExamenId,
        nouvelleDate: null,
        nouvelleHeure: null,
        nouveauLieu: "",
      });
      setError("");
      setDateError("");
    }
  }, [open, examenId, examen]);

  // Calculer la date limite de report (4 jours avant l'examen)
  // Le secrétaire peut reporter jusqu'à 4 jours AVANT l'examen
  const getDateLimiteReport = () => {
    if (!examen?.date) return null;
    const dateExamen = new Date(examen.date);
    // Date limite = date de l'examen - 4 jours
    // On peut reporter jusqu'à cette date incluse
    return addDays(dateExamen, -4);
  };

  // Vérifier si la nouvelle date est valide
  const isNewDateValid = (newDate) => {
    if (!newDate || !examen?.date) return false;

    const dateExamenOriginal = new Date(examen.date);
    const dateLimite = getDateLimiteReport();

    // Condition 1: La nouvelle date doit être POSTÉRIEURE à la date originale
    if (
      isBefore(newDate, dateExamenOriginal) &&
      !isSameDay(newDate, dateExamenOriginal)
    ) {
      setDateError(
        `La nouvelle date doit être postérieure à la date originale (${format(dateExamenOriginal, "dd/MM/yyyy")})`,
      );
      return false;
    }

    // Condition 2: Le report doit être fait au moins 4 jours AVANT la date originale
    // Pour reporter, on doit être avant dateLimite (dateExamen - 4 jours)
    const aujourdhui = new Date();
    if (isAfter(aujourdhui, dateLimite)) {
      setDateError(
        `Le report n'est plus possible. Date limite de report dépassée (${format(dateLimite, "dd/MM/yyyy")})`,
      );
      return false;
    }

    setDateError("");
    return true;
  };

  // Vérifier si on est encore dans les délais pour reporter
  const canStillReport = () => {
    if (!examen?.date) return false;
    const dateExamenOriginal = new Date(examen.date);
    const dateLimite = getDateLimiteReport();
    const aujourdhui = new Date();
    return (
      !isAfter(aujourdhui, dateLimite) &&
      isAfter(dateExamenOriginal, aujourdhui)
    );
  };

  const handleDateChange = (newDate) => {
    setDateError("");
    setFormData((prev) => ({ ...prev, nouvelleDate: newDate }));

    if (newDate) {
      isNewDateValid(newDate);
    }
  };

  const handleSubmit = async () => {
    // Validation de l'ID examen
    if (!formData.examenId) {
      setError("Erreur: ID examen non trouvé");
      console.error("❌ examenId manquant:", formData);
      return;
    }

    if (!formData.nouvelleDate) {
      setError("Veuillez sélectionner une nouvelle date");
      return;
    }

    if (!formData.nouvelleHeure) {
      setError("Veuillez sélectionner une nouvelle heure");
      return;
    }

    // Vérifier si on peut encore reporter
    if (!canStillReport()) {
      const dateLimite = getDateLimiteReport();
      setError(
        `Le report n'est plus autorisé. Vous devez reporter au plus tard le ${dateLimite?.toLocaleDateString("fr-FR")} (4 jours avant l'examen)`,
      );
      return;
    }

    // Vérifier que la nouvelle date est valide
    if (!isNewDateValid(formData.nouvelleDate)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Extraire l'heure et les minutes
      const [hours, minutes] = formData.nouvelleHeure.split(":");

      // Créer la date complète avec l'heure
      const nouvelleDateComplete = new Date(formData.nouvelleDate);
      nouvelleDateComplete.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        0,
        0,
      );

      // Formater l'heure pour TimeSpan (format "HH:MM:SS")
      const nouvelleHeureTimeSpan = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;

      // Format de date pour DateTime (format ISO complet)
      const nouvelleDateISO = nouvelleDateComplete.toISOString();

      const submitData = {
        examenId: parseInt(formData.examenId, 10),
        nouvelleDate: nouvelleDateISO,
        nouvelleHeure: nouvelleHeureTimeSpan,
        nouveauLieu: formData.nouveauLieu || null,
      };

      console.log(
        "📤 Données envoyées pour le report:",
        JSON.stringify(submitData, null, 2),
      );
      console.log("📤 Date originale examen:", examen?.date);
      console.log("📤 Nouvelle date:", nouvelleDateISO);

      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error("❌ Erreur lors du report:", err);
      console.error("❌ Réponse erreur:", err.response?.data);

      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError(validationErrors.join(", "));
      } else {
        setError(err.response?.data?.message || "Erreur lors du report");
      }
    } finally {
      setLoading(false);
    }
  };

  const dateLimite = getDateLimiteReport();
  const dateExamenOriginal = examen?.date ? new Date(examen.date) : null;
  const reportPossible = canStillReport();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6" component="span">
            Reporter l'examen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {examen && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Informations actuelles
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date examen:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {dateExamenOriginal?.toLocaleDateString("fr-FR")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Heure:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {examen.heure}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Lieu:
                  </Typography>
                  <Typography variant="body1">{examen.lieu}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Type d'examen:
                  </Typography>
                  <Typography variant="body1">
                    {examen.typeExamen === 0 || examen.typeExamen === "Code"
                      ? "Code"
                      : examen.typeExamen === 1 ||
                          examen.typeExamen === "Circulation"
                        ? "Circulation"
                        : examen.typeExamen === 2 ||
                            examen.typeExamen === "Manœuvre"
                          ? "Manœuvre"
                          : "Inconnu"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {!reportPossible && dateExamenOriginal && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong> Report impossible !</strong>
              </Typography>
              <Typography variant="body2">
                La date limite de report était le{" "}
                {format(dateLimite, "dd/MM/yyyy", { locale: fr })}.
              </Typography>
              <Typography variant="caption">
                (4 jours avant l'examen du{" "}
                {format(dateExamenOriginal, "dd/MM/yyyy", { locale: fr })})
              </Typography>
            </Alert>
          )}

          {reportPossible && dateLimite && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong> Report possible jusqu'au :</strong>{" "}
                {format(dateLimite, "dd/MM/yyyy", { locale: fr })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (4 jours avant l'examen du{" "}
                {format(dateExamenOriginal, "dd/MM/yyyy", { locale: fr })})
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                La nouvelle date doit être postérieure à la date originale
              </Typography>
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Nouvelle date"
                  value={formData.nouvelleDate}
                  onChange={handleDateChange}
                  minDate={
                    dateExamenOriginal
                      ? addDays(dateExamenOriginal, 1)
                      : new Date()
                  }
                  disabled={!reportPossible}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!dateError,
                      helperText:
                        dateError ||
                        (dateExamenOriginal &&
                          `Doit être après le ${format(dateExamenOriginal, "dd/MM/yyyy")}`),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nouvelle heure"
                  type="time"
                  fullWidth
                  required
                  value={formData.nouvelleHeure || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nouvelleHeure: e.target.value,
                    }))
                  }
                  disabled={!reportPossible}
                  InputLabelProps={{ shrink: true }}
                  helperText="Ex: 14:30"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Nouveau lieu (optionnel)"
                  fullWidth
                  value={formData.nouveauLieu}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nouveauLieu: e.target.value,
                    }))
                  }
                  disabled={!reportPossible}
                  placeholder="Laissez vide pour conserver le même lieu"
                  helperText="Ex: Centre Sfax"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={
            loading ||
            !!dateError ||
            !reportPossible ||
            !formData.nouvelleDate ||
            !formData.nouvelleHeure
          }
          startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
        >
          {loading ? "Traitement..." : "Confirmer le report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportExamenForm;
