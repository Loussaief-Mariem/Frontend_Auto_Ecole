// src/components/common/examens/ResultatExamenForm.jsx
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
  Box,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import { StatutExamen, TypeExamen, TypePermis } from "../../../enums";

const ResultatExamenForm = ({
  open,
  onClose,
  onSave,
  examenId,
  typeExamen,
  typePermisCode, // Ajout du type de permis
}) => {
  const [formData, setFormData] = useState({
    examenId: examenId,
    statut: "",
    noteCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [permisInfo, setPermisInfo] = useState(null);

  // Récupérer les infos du permis
  useEffect(() => {
    if (open && typePermisCode) {
      const permis = TypePermis.find((p) => p.code === typePermisCode);
      setPermisInfo(permis);
    }
  }, [open, typePermisCode]);

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        examenId: examenId,
        statut: "",
        noteCode: "",
      });
      setError("");
    }
  }, [open, examenId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation du statut
    if (!formData.statut) {
      setError("Veuillez sélectionner un statut");
      return;
    }

    // Pour l'examen code, la note est obligatoire
    if (isCodeExamen()) {
      if (!formData.noteCode) {
        setError("Veuillez saisir la note du code");
        return;
      }

      const noteValue = parseInt(formData.noteCode);

      if (noteValue <= 0) {
        setError("La note doit être supérieure à 0");
        return;
      }

      // Vérifier la note max selon le permis
      const maxNote = permisInfo?.nombreQuestions || 40;
      if (noteValue > maxNote) {
        setError(`La note ne peut pas dépasser ${maxNote}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const dataToSend = {
        examenId: formData.examenId,
        statut: parseInt(formData.statut),
      };

      // Ajouter la note UNIQUEMENT pour l'examen de code
      if (isCodeExamen() && formData.noteCode) {
        dataToSend.noteCode = parseInt(formData.noteCode);
      }

      console.log("📤 Envoi résultat examen:", dataToSend);
      await onSave(dataToSend);
      onClose();
    } catch (err) {
      console.error(" Erreur:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  // Déterminer si c'est un examen de code
  const isCodeExamen = () => {
    return (
      typeExamen === TypeExamen.Code ||
      typeExamen === 0 ||
      typeExamen === "Code"
    );
  };

  // Déterminer le libellé du type d'examen
  const getTypeLabel = () => {
    if (isCodeExamen()) return "Examen Code";
    return "Examen Conduite";
  };

  // Obtenir la note maximale selon le permis
  const getMaxNote = () => {
    if (!isCodeExamen()) return 100;
    return permisInfo?.nombreQuestions || 40;
  };

  // Obtenir le seuil de réussite selon le permis
  const getSeuilReussite = () => {
    if (!isCodeExamen()) return 60;
    return permisInfo?.seuilReussite || 30;
  };

  // Vérifier si la note est suffisante pour réussite
  const isNoteSuffisante = () => {
    if (!formData.noteCode) return false;
    const note = parseInt(formData.noteCode);
    return note >= getSeuilReussite();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enregistrer le résultat - {getTypeLabel()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Champ note - UNIQUEMENT pour l'examen de code */}
          {isCodeExamen() && permisInfo && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Permis {permisInfo.code}</strong>
                </Typography>
                <Typography variant="body2">
                  • Nombre de questions: {permisInfo.nombreQuestions}
                </Typography>
                <Typography variant="body2">
                  • Seuil de réussite: {permisInfo.seuilReussite}/
                  {permisInfo.nombreQuestions}
                </Typography>
              </Alert>

              <TextField
                label={`Note du code (sur ${getMaxNote()})`}
                type="number"
                fullWidth
                required
                value={formData.noteCode}
                onChange={(e) => handleChange("noteCode", e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{
                  min: 1,
                  max: getMaxNote(),
                  step: 1,
                }}
                helperText={`Note valide : 1 à ${getMaxNote()} (minimale pour réussite: ${getSeuilReussite()}/${getMaxNote()})`}
                error={
                  formData.noteCode &&
                  (parseInt(formData.noteCode) <= 0 ||
                    parseInt(formData.noteCode) > getMaxNote())
                }
              />
            </>
          )}

          {isCodeExamen() && !permisInfo && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Informations du permis non disponibles. Note maximale: 40,
                seuil: 30
              </Typography>
              <TextField
                label="Note du code (sur 40)"
                type="number"
                fullWidth
                required
                value={formData.noteCode}
                onChange={(e) => handleChange("noteCode", e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 1, max: 40, step: 1 }}
              />
            </Alert>
          )}

          <FormControl fullWidth required>
            <InputLabel>Statut</InputLabel>
            <Select
              value={formData.statut}
              onChange={(e) => handleChange("statut", e.target.value)}
              label="Statut"
            >
              <MenuItem value={StatutExamen.SATISFAIT}>
                Satisfait (Réussi)
              </MenuItem>
              <MenuItem value={StatutExamen.AJOURNE}>Ajourné (Échoué)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !formData.statut ||
            (isCodeExamen() && !formData.noteCode)
          }
        >
          {loading ? <CircularProgress size={24} /> : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultatExamenForm;
