// src/pages/Dashboard/Moniteur/PlanningConduitePage.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  CheckCircle,
  Cancel,
  Comment,
  EventNote,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { useSeancesConduite } from "../../../hooks/useSeancesConduite";
import SeanceConduiteForm from "../../../components/common/seances/SeanceConduiteForm";
import { TYPE_CONDUITE_LABELS } from "../../../enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PlanningConduitePage = () => {
  const { user } = useAuth();
  const [openForm, setOpenForm] = useState(false);
  const [openRemarque, setOpenRemarque] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [remarque, setRemarque] = useState("");
  const [note, setNote] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const {
    seances,
    loading,
    marquerPresenceSeance,
    ajouterRemarqueSeance,
    getSeancesAujourdhui,
    getProchainesSeances,
  } = useSeancesConduite(user?.moniteurId);

  const seancesAujourdhui = getSeancesAujourdhui();
  const prochainesSeances = getProchainesSeances(10);

  const handleMarquerPresence = async (seanceId, present) => {
    await marquerPresenceSeance(seanceId, present);
  };

  const handleAjouterRemarque = async () => {
    if (selectedSeance) {
      await ajouterRemarqueSeance(selectedSeance.id, remarque, note);
      setOpenRemarque(false);
      setRemarque("");
      setNote(0);
      setSelectedSeance(null);
    }
  };

  const getSeancesToDisplay = () => {
    if (tabValue === 0) return seancesAujourdhui;
    return prochainesSeances;
  };

  const seancesToDisplay = getSeancesToDisplay();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Planning des séances de conduite
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Planifier séance
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Aujourd'hui (${seancesAujourdhui.length})`} />
          <Tab label={`À venir (${prochainesSeances.length})`} />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {seancesToDisplay.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <EventNote
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography color="textSecondary">
                  Aucune séance à afficher
                </Typography>
              </Paper>
            </Grid>
          ) : (
            seancesToDisplay.map((seance) => (
              <Grid item xs={12} md={6} key={seance.id}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography variant="h6">
                          {seance.candidat?.prenom} {seance.candidat?.nom}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          {format(new Date(seance.date), "dd MMMM yyyy", {
                            locale: fr,
                          })}{" "}
                          - {seance.heureDebut}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Durée: {seance.dureeMinutes} minutes
                        </Typography>
                        <Chip
                          label={
                            TYPE_CONDUITE_LABELS[seance.typeConduite]?.label ||
                            "Inconnu"
                          }
                          color={
                            TYPE_CONDUITE_LABELS[seance.typeConduite]?.color ||
                            "default"
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        {!seance.present && !seance.estAnnulee && (
                          <IconButton
                            color="success"
                            onClick={() =>
                              handleMarquerPresence(seance.id, true)
                            }
                            title="Marquer présent"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        {seance.present && (
                          <Chip label="Présent" color="success" size="small" />
                        )}
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedSeance(seance);
                            setOpenRemarque(true);
                          }}
                          title="Ajouter remarque"
                        >
                          <Comment />
                        </IconButton>
                      </Box>
                    </Box>

                    {seance.remarquesPedagogiques && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Remarque: {seance.remarquesPedagogiques}
                        </Typography>
                        {seance.noteProgression > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              Note: {seance.noteProgression}/10
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {seance.estAnnulee && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Séance annulée
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <SeanceConduiteForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={async (data) => {
          const { planifier } = useSeancesConduite(user?.moniteurId);
          await planifier(data);
        }}
        moniteurs={[
          { id: user?.moniteurId, prenom: user?.prenom, nom: user?.nom },
        ]}
        candidats={[]} // À remplir depuis une API
        loading={loading}
      />

      <Dialog
        open={openRemarque}
        onClose={() => setOpenRemarque(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter une remarque pédagogique</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarques"
            value={remarque}
            onChange={(e) => setRemarque(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <Typography component="legend">Note de progression (0-10)</Typography>
          <Rating
            value={note}
            onChange={(e, newValue) => setNote(newValue)}
            max={10}
            size="large"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemarque(false)}>Annuler</Button>
          <Button onClick={handleAjouterRemarque} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlanningConduitePage;
