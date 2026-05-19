import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  TextField,
  Rating,
  Stack,
  Avatar,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import { isSameDay, parseISO } from "date-fns";
import { marquerPresence, ajouterRemarqueEtNote } from "../../../api/seanceCodeService";

const PresenceDialog = ({ open, onClose, seance, onRefresh }) => {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (seance && seance.presences) {
      setPresences(seance.presences);
    }
  }, [seance]);

  if (!seance) return null;

  const seanceDate = parseISO(seance.date);
  const today = new Date();
  const isToday = isSameDay(seanceDate, today);
  const isCancelled = seance.estAnnulee;
  const canEdit = isToday && !isCancelled;

  const handleToggle = (contratId) => {
    if (!canEdit) return;
    setPresences((prev) =>
      prev.map((p) =>
        p.contratId === contratId ? { ...p, present: !p.present } : p
      )
    );
  };

  const handleChangeExtra = (contratId, field, value) => {
    if (!canEdit) return;
    setPresences((prev) =>
      prev.map((p) =>
        p.contratId === contratId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // On boucle sur les présences pour envoyer les mises à jour
      const promises = presences.map(async (p) => {
        console.log(p);
        console.log("Seance:", seance);
           console.log("noteProgression:", p.noteProgression);
           console.log("remarque:", p.remarque);
           console.log("contratId:", p.contratId);
           console.log("present:", p.present);
        // 1. Marquer la présence

        await marquerPresence(seance.id, p.contratId, p.present);
        
        // 2. Si présent, envoyer remarque et note
        if (p.present && (p.remarque || p.note !== undefined)) {
          await ajouterRemarqueEtNote(
            seance.id, 
            p.contratId, 
            p.remarque || "", 
            p.note || 0
          );
        }
      });
      await Promise.all(promises);
      
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      setError("Erreur lors de l'enregistrement des présences");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = presences.filter((p) => p.present).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Gérer les présences</Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CheckCircleOutlineIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary">
              {presentCount} / {presences.length} présents
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {!canEdit && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {isCancelled 
              ? "Cette séance est annulée. Les présences ne sont pas modifiables." 
              : "La présence peut être modifiée uniquement le jour de la séance."}
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <List>
          {presences.length === 0 ? (
            <Typography color="text.secondary" align="center" py={2}>
              Aucun participant inscrit à cette séance.
            </Typography>
          ) : (
            presences.map((p, index) => (
              <React.Fragment key={p.contratId}>
                <ListItem
                  sx={{ borderRadius: 2, mb: 0.5, py: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      mr: 2,
                      bgcolor: p.present ? "success.light" : "error.light",
                      fontSize: "0.9rem",
                    }}
                  >
                    {p.candidatPrenom?.[0]}
                    {p.candidatNom?.[0]}
                  </Avatar>
                  <ListItemText
                    primary={`${p.candidatPrenom} ${p.candidatNom}`}
                    secondary={p.present ? "Présent" : "Absent"}
                    primaryTypographyProps={{ fontWeight: "bold" }}
                  />
                  <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                    <Button
                      size="small"
                      variant={p.present ? "contained" : "outlined"}
                      color="success"
                      onClick={() => {
                        if (canEdit && !p.present) {
                          handleToggle(p.contratId);
                        }
                      }}
                      disabled={!canEdit}
                      sx={{ textTransform: "none", borderRadius: 2, fontSize: "0.75rem", px: 1.5 }}
                    >
                      Présent
                    </Button>
                    <Button
                      size="small"
                      variant={!p.present ? "contained" : "outlined"}
                      color="error"
                      onClick={() => {
                        if (canEdit && p.present) {
                          handleToggle(p.contratId);
                        }
                      }}
                      disabled={!canEdit}
                      sx={{ textTransform: "none", borderRadius: 2, fontSize: "0.75rem", px: 1.5 }}
                    >
                      Absent
                    </Button>
                  </Stack>
                </ListItem>

                <Collapse in={p.present} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Note de progression : {p.note || 0} / 10
                        </Typography>
                        <Rating
                          name={`note-${p.contratId}`}
                          value={(p.note || 0) / 2}
                          precision={0.5}
                          onChange={(event, newValue) => {
                            handleChangeExtra(p.contratId, 'note', newValue * 2);
                          }}
                          disabled={!canEdit}
                          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Remarque pédagogique"
                        multiline
                        rows={2}
                        size="small"
                        value={p.remarque || ""}
                        onChange={(e) => handleChangeExtra(p.contratId, 'remarque', e.target.value)}
                        placeholder="Ex: Bonne compréhension, doit pratiquer davantage..."
                        disabled={!canEdit}
                      />
                    </Stack>
                  </Box>
                </Collapse>
                {index < presences.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        {canEdit && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Enregistrer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PresenceDialog;
