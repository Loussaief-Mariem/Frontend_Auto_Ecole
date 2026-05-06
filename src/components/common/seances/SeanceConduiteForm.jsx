// src/components/common/seances/SeanceConduiteForm.jsx
import React, { useRef, useState, useEffect } from "react";
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
  Divider,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TypeConduite, TYPE_CONDUITE_LABELS } from "../../../enums";
import { getSeanceConduiteApiErrorMessage } from "../../../api/seanceConduiteService";

const SeanceConduiteForm = ({
  open,
  onClose,
  onSubmit,
  moniteurId,
  candidats,
  initialData = null,
  loading = false,
  multiple = false,
  messageError = "",
  onClearMessageError,
}) => {
  const draftIdRef = useRef(1);
  const getNextDraftId = () => {
    const next = draftIdRef.current;
    draftIdRef.current += 1;
    return next;
  };
  console.log("candidats in form", candidats);

  const buildDefaultSeance = () => ({
    id: getNextDraftId(),
    date: new Date(),
    heureDebut: "09:00",
    dureeMinutes: 60,
    typeConduite: TypeConduite.MANOEUVRE,
    candidatId: candidats[0]?.id?.toString() || "",
    contratId: candidats[0]?.contratId || "",
  });

  // Mode simple
  const [formData, setFormData] = useState({
    date: new Date(),
    heureDebut: "09:00",
    dureeMinutes: 60,
    typeConduite: TypeConduite.MANOEUVRE,
    candidatId: "",
    contratId: "",
  });

  // Mode multiple
  const [seances, setSeances] = useState([]);

  const [error, setError] = useState("");

  // Initialisation des données pour le mode simple
  useEffect(() => {
    if (!multiple && initialData) {
      setFormData({
        date: initialData.date ? new Date(initialData.date) : new Date(),
        heureDebut: initialData.heureDebut || "09:00",
        dureeMinutes: initialData.dureeMinutes || 60,
        typeConduite: initialData.typeConduite || TypeConduite.MANOEUVRE,
        candidatId: initialData.candidatId || "",
        contratId: initialData.contratId || "",
      });
    }
  }, [initialData, multiple]);

  // Réinitialisation quand le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setError("");
      if (multiple) {
        setSeances([buildDefaultSeance()]);
      } else {
        setFormData({
          date: new Date(),
          heureDebut: "09:00",
          dureeMinutes: 60,
          typeConduite: TypeConduite.MANOEUVRE,
          candidatId: candidats[0]?.id?.toString() || "",
          contratId: candidats[0]?.contratId || "",
        });
      }
    }
  }, [open, multiple, candidats]);

  // Mettre à jour le contratId quand le candidat change (mode simple)
  const handleCandidatChange = (selectedCandidatId) => {
    const selectedCandidat = candidats.find(
      (c) => c.id.toString() === selectedCandidatId,
    );
    setFormData({
      ...formData,
      candidatId: selectedCandidatId,
      contratId: selectedCandidat?.contratId || "",
    });
  };

  // Gestion mode simple
  const handleSimpleSubmit = async () => {
    // Validation
    if (!formData.candidatId) {
      setError("Veuillez sélectionner un candidat");
      return;
    }

    if (!formData.contratId) {
      setError("Contrat non trouvé pour ce candidat");
      return;
    }

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
    if (!moniteurId) {
      setError("Moniteur non défini pour planifier la séance");
      return;
    }

    setError("");
    onClearMessageError?.();

    // Format the data to match backend DTO with contratId
    const submitData = {
      date: formData.date.toISOString(),
      heureDebut: formData.heureDebut,
      dureeMinutes: parseInt(formData.dureeMinutes),
      typeConduite: parseInt(formData.typeConduite),
      contratId: parseInt(formData.contratId), // Utiliser contratId au lieu de candidatId
      moniteurId: parseInt(moniteurId),
    };

    console.log("Soumission séance (mode simple):", submitData);

    try {
      const result = await onSubmit(submitData);
      if (result === false) {
        return;
      }
      // Reset form after successful submission
      setFormData({
        date: new Date(),
        heureDebut: "09:00",
        dureeMinutes: 60,
        typeConduite: TypeConduite.MANOEUVRE,
        candidatId: candidats[0]?.id?.toString() || "",
        contratId: candidats[0]?.contratId || "",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(getSeanceConduiteApiErrorMessage(err));
    }
  };

  // Gestion mode multiple
  const addSeance = () => {
    setSeances([...seances, buildDefaultSeance()]);
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
      seances.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const validateSeance = (seance) => {
    if (!seance.candidatId) {
      return "Veuillez sélectionner un candidat";
    }
    if (!seance.contratId) {
      return "Contrat non trouvé pour ce candidat";
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
    if (!moniteurId) {
      return "Moniteur non défini pour planifier les séances";
    }
    return null;
  };

  const handleMultipleSubmit = async () => {
    // Validate all seances
    for (const seance of seances) {
      const validationError = validateSeance(seance);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError("");
    onClearMessageError?.();

    // Format data for batch submission with contratId
    const submitData = seances.map((seance) => ({
      date: seance.date.toISOString(),
      heureDebut: seance.heureDebut,
      dureeMinutes: parseInt(seance.dureeMinutes),
      typeConduite: parseInt(seance.typeConduite),
      contratId: parseInt(seance.contratId), // Utiliser contratId
      moniteurId: parseInt(moniteurId),
    }));

    console.log("Soumission batch séances:", submitData);

    try {
      const result = await onSubmit(submitData);
      if (result === false) {
        return;
      }
      onClose();
    } catch (err) {
      setError(getSeanceConduiteApiErrorMessage(err));
    }
  };

  // Mettre à jour le contratId quand le candidat change (mode multiple)
  const handleMultipleCandidatChange = (newCandidatId) => {
    const selectedCandidat = candidats.find(
      (c) => c.id.toString() === newCandidatId,
    );
    setSeances(
      seances.map((s) => ({
        ...s,
        candidatId: newCandidatId,
        contratId: selectedCandidat?.contratId || "",
      })),
    );
  };

  const handleClose = () => {
    setError("");
    onClearMessageError?.();
    onClose();
  };

  // Rendu du mode simple
  const renderSimpleMode = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* Date */}
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

        {/* Heure de début */}
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

        {/* Durée */}
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
        />

        {/* Type de conduite */}
        <FormControl fullWidth required>
          <InputLabel>Type de conduite</InputLabel>
          <Select
            value={formData.typeConduite}
            label="Type de conduite"
            onChange={(e) =>
              setFormData({ ...formData, typeConduite: e.target.value })
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
            value={formData.candidatId}
            label="Candidat"
            onChange={(e) => handleCandidatChange(e.target.value)}
          >
            {candidats.map((candidat) => (
              <MenuItem key={candidat.id} value={candidat.id.toString()}>
                {candidat.prenom} {candidat.nom} - {candidat.numeroCIN}
                {candidat.contratId && ` (Contrat #${candidat.contratId})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </LocalizationProvider>
  );

  // Rendu du mode multiple
  const renderMultipleMode = () => (
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
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
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
                    size: "small",
                  },
                }}
              />

              {/* Heure de début */}
              <TextField
                fullWidth
                label="Heure de début"
                type="time"
                size="small"
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
                size="small"
                value={seance.dureeMinutes}
                onChange={(e) =>
                  updateSeance(
                    seance.id,
                    "dureeMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                required
                inputProps={{ min: 30, max: 180, step: 15 }}
              />

              {/* Type de conduite */}
              <FormControl fullWidth required size="small">
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

              {/* Candidat - appliqué à toutes les séances */}
              {seances.length > 0 && index === 0 && (
                <FormControl fullWidth required size="small">
                  <InputLabel>Candidat</InputLabel>
                  <Select
                    value={seance.candidatId}
                    label="Candidat"
                    onChange={(e) =>
                      handleMultipleCandidatChange(e.target.value)
                    }
                  >
                    {candidats.map((candidat) => (
                      <MenuItem
                        key={candidat.id}
                        value={candidat.id.toString()}
                      >
                        {candidat.prenom} {candidat.nom} - {candidat.numeroCIN}
                        {candidat.contratId &&
                          ` (Contrat #${candidat.contratId})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
            {index < seances.length - 1 && <Divider sx={{ mt: 2 }} />}
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
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {multiple
          ? "Planifier plusieurs séances de conduite"
          : "Planifier une séance de conduite"}
      </DialogTitle>
      <DialogContent>
        {(messageError || error) && (
          <Stack spacing={1} sx={{ mb: 2, mt: 1 }}>
            {messageError ? (
              <Alert severity="error">{messageError}</Alert>
            ) : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        )}
        {multiple ? renderMultipleMode() : renderSimpleMode()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={multiple ? handleMultipleSubmit : handleSimpleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : multiple ? (
            "Planifier toutes les séances"
          ) : (
            "Planifier"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeanceConduiteForm;
