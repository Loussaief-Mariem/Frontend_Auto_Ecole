// src/components/common/seances/ParticipantsDialog.jsx
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
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  TextField,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  ajouterParticipants,
  getSeanceById,
  retirerParticipant,
} from "../../../api/seanceCodeService";
import { getContratsCompletTheorique } from "../../../api/contratService";

const ParticipantsDialog = ({
  open,
  onClose,
  seanceId,
  autoEcoleId,
  onRefresh,
}) => {
  const [seance, setSeance] = useState(null);
  const [allContrats, setAllContrats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContrats, setLoadingContrats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open && seanceId) {
      loadData();
    }
  }, [open, seanceId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const seanceData = await getSeanceById(seanceId);
      setSeance(seanceData);

      setLoadingContrats(true);
      const contratsData = await getContratsCompletTheorique(autoEcoleId);
      setAllContrats(contratsData || []);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingContrats(false);
    }
  };

  const handleAddParticipant = async (contratId) => {
    if (seance.presences?.length >= seance.capaciteMax) {
      setError("Capacité maximale atteinte pour cette séance");
      return;
    }

    try {
      setError("");
      await ajouterParticipants(seanceId, [contratId]);
      setSuccess("Participant ajouté avec succès");
      loadData();
      if (onRefresh) onRefresh();

      // Clear success message after 3s
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  // Note: Backend might need a specific endpoint to remove a participant.
  // If not, we could technically re-save the whole participant list,
  // but usually a dedicated DELETE is better.
  const handleRemoveParticipant = async (candidatId) => {
    if (!window.confirm("Voulez-vous vraiment retirer ce participant ?"))
      return;

    try {
      setError("");
      await retirerParticipant(seanceId, candidatId);
      setSuccess("Participant retiré avec succès");
      loadData();
      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du retrait");
    }
  };

  const filteredContrats = allContrats.filter((contrat) => {
    const fullName =
      `${contrat.candidatPrenom} ${contrat.candidatNom}`.toLowerCase();
    const isAlreadyIn = seance?.presences?.some(
      (p) => p.candidatId === (contrat.candidatId || contrat.id),
    );

    return (
      !isAlreadyIn &&
      (fullName.includes(searchTerm.toLowerCase()) ||
        contrat.cin?.includes(searchTerm))
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Gestion des Participants
        </Typography>
        {seance && (
          <Typography variant="caption" color="text.secondary">
            Séance du {new Date(seance.date).toLocaleDateString()} -{" "}
            {seance.theme}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Participants actuels ({seance?.presences?.length || 0} /{" "}
            {seance?.capaciteMax || 20})
          </Typography>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, maxHeight: 200, overflow: "auto" }}
          >
            <List dense>
              {seance?.presences?.length === 0 ? (
                <ListItem>
                  <ListItemText secondary="Aucun participant" />
                </ListItem>
              ) : (
                seance?.presences?.map((p) => (
                  <ListItem key={p.candidatId}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        bgcolor: "primary.light",
                        fontSize: "0.8rem",
                      }}
                    >
                      {p.candidatPrenom?.[0]}
                      {p.candidatNom?.[0]}
                    </Avatar>
                    <ListItemText
                      primary={`${p.candidatPrenom} ${p.candidatNom}`}
                      secondary={p.present ? "Présent" : "Inscrit"}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => handleRemoveParticipant(p.candidatId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Ajouter des participants
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un candidat (Nom, CIN...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon size="small" color="action" sx={{ mr: 1 }} />
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              maxHeight: 250,
              overflow: "auto",
              bgcolor: "#f8fafc",
            }}
          >
            {loadingContrats ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List dense>
                {filteredContrats.length === 0 ? (
                  <ListItem>
                    <ListItemText secondary="Aucun candidat trouvé ou tous sont déjà inscrits" />
                  </ListItem>
                ) : (
                  filteredContrats.slice(0, 10).map((contrat) => (
                    <ListItem key={contrat.id}>
                      <ListItemText
                        primary={`${contrat.candidatPrenom} ${contrat.candidatNom}`}
                        secondary={`CIN: ${contrat.cin || "N/A"} - Permis: ${contrat.typePermisCode}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          variant="contained"
                          onClick={() => handleAddParticipant(contrat.id)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Ajouter
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
                {filteredContrats.length > 10 && (
                  <ListItem>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ width: "100%", textAlign: "center" }}
                    >
                      Affichage limité aux 10 premiers résultats... Affinez
                      votre recherche.
                    </Typography>
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantsDialog;
