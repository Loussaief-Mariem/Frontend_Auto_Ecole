import React, { useState } from "react";
import { Container, CircularProgress, Box, Alert, Dialog, DialogTitle, DialogContent, Typography, IconButton, Chip, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../context/AuthContext";
import { useSeancesGlobales } from "../../hooks/useSeancesGlobales";
import ProfessionalCalendar from "../../components/common/seances/ProfessionalCalendar";

const PlanningGlobalPage = () => {
  const { user } = useAuth();
  const { seances, loading, error, refresh } = useSeancesGlobales(user);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const formatHeure = (heure) => {
    if (!heure) return "N/A";
    if (typeof heure === "string") return heure.substring(0, 5);
    if (heure.hours !== undefined) return `${heure.hours.toString().padStart(2, "0")}:${heure.minutes.toString().padStart(2, "0")}`;
    return heure;
  };

  if (loading && seances.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <ProfessionalCalendar 
        seances={seances} 
        onSelectEvent={handleSelectEvent}
      />

      {/* Détails de l'événement */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Détails de la séance</Typography>
            <IconButton onClick={handleCloseDialog}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Stack spacing={2}>
              <Box display="flex" gap={1}>
                <Chip 
                  label={selectedEvent.globalType === "code" ? "Séance de Code" : "Séance de Conduite"} 
                  color={selectedEvent.globalType === "code" ? "primary" : "secondary"} 
                />
                {selectedEvent.estAnnulee && <Chip label="Annulée" color="error" />}
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon color="action" />
                <Typography>
                  Heure: {formatHeure(selectedEvent.heureDebut)} - Durée: {selectedEvent.dureeMinutes} min
                </Typography>
              </Box>

              {selectedEvent.globalType === "code" ? (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Typography>Secrétaire: {selectedEvent.secretaireNom || "N/A"}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon color="action" />
                    <Typography>
                      Participants inscrits: {selectedEvent.presences?.length || 0} / {selectedEvent.capaciteMax || 20}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Typography>Candidat: {selectedEvent.candidatNom} {selectedEvent.candidatPrenom}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Typography>Moniteur: {selectedEvent.moniteurNom || "N/A"}</Typography>
                  </Box>
                </>
              )}

              {selectedEvent.remarquesPedagogiques && (
                <Box bgcolor="#f5f5f5" p={2} borderRadius={2}>
                  <Typography variant="subtitle2" color="text.secondary">Remarques:</Typography>
                  <Typography variant="body2">{selectedEvent.remarquesPedagogiques}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PlanningGlobalPage;
