import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useAuth } from "../../../context/AuthContext";
import { useSeancesCode } from "../../../hooks/useSeancesCode";
import PlanningCalendar from "../../../components/common/seances/PlanningCalendar";
import ParticipantsDialog from "../../../components/common/seances/ParticipantsDialog";
import SeanceCodeForm from "../../../components/common/seances/SeanceCodeForm";
import SeanceFilters from "../../../components/common/seances/SeanceFilters";

const PlanningSeancesPage = () => {
  const { user } = useAuth();
  const {
    filteredSeances,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    tabValue,
    setTabValue,
    counts,
    refresh,
    handleAnnuler,
    handleDesannuler
  } = useSeancesCode(user);

  const [openPlanifier, setOpenPlanifier] = useState(false);
  const [selectedSeanceToEdit, setSelectedSeanceToEdit] = useState(null);
  const [openParticipants, setOpenParticipants] = useState(false);
  const [selectedSeanceId, setSelectedSeanceId] = useState(null);
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleActionWithConfirm = (title, message, onConfirm, isDestructive = false) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm: async () => {
        try {
          await onConfirm();
          showSnackbar("Action effectuée avec succès");
        } catch (err) {
          showSnackbar(err.message || "Une erreur est survenue", "error");
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      isDestructive
    });
  };

  const onAnnulerClick = (id) => {
    handleActionWithConfirm(
      "Annuler la séance",
      "Êtes-vous sûr de vouloir annuler cette séance ? Cette action est réversible.",
      () => handleAnnuler(id),
      true
    );
  };

  const onRestoreClick = (id) => {
    handleActionWithConfirm(
      "Réactiver la séance",
      "Voulez-vous réactiver cette séance ?",
      () => handleDesannuler(id)
    );
  };

  const handleModifier = (seance) => {
    setSelectedSeanceToEdit(seance);
    setOpenPlanifier(true);
  };

  const handleOpenParticipants = (id) => {
    setSelectedSeanceId(id);
    setOpenParticipants(true);
  };

  const handleSuccess = () => {
    setOpenPlanifier(false);
    setSelectedSeanceToEdit(null);
    refresh(true);
    showSnackbar(selectedSeanceToEdit ? "Séance modifiée" : "Séance créée");
  };

  if (loading && filteredSeances.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="text.primary">
            Planning des Séances
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gérez et planifiez vos sessions de code théorique
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenPlanifier(true)}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)'
            }}
          >
            Nouvelle Séance
          </Button>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              minHeight: 64,
            },
          }}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                À venir
                <Badge badgeContent={counts.upcoming} color="success" sx={{ position: 'static', transform: 'none' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                Passées
                <Badge badgeContent={counts.past} color="default" sx={{ position: 'static', transform: 'none' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                Annulées
                <Badge badgeContent={counts.cancelled} color="error" sx={{ position: 'static', transform: 'none' }} />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Filters Section */}
      <SeanceFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content View */}
      <PlanningCalendar
        seances={filteredSeances}
        type="code"
        canEdit={true}
        onRefresh={() => refresh(true)}
        onAnnulerSeance={onAnnulerClick}
        onDesannulerSeance={onRestoreClick}
        onModifierSeance={handleModifier}
        onAjouterParticipants={handleOpenParticipants}
      />

      {/* Dialogs */}
      <SeanceCodeForm
        open={openPlanifier}
        onClose={() => {
          setOpenPlanifier(false);
          setSelectedSeanceToEdit(null);
        }}
        onSuccess={handleSuccess}
        autoEcoleId={user?.user?.idAutoEcole || user?.autoEcoleId}
        secretaireId={user?.user?.id || user?.id}
        initialData={selectedSeanceToEdit}
      />

      <ParticipantsDialog
        open={openParticipants}
        onClose={() => setOpenParticipants(false)}
        seanceId={selectedSeanceId}
        autoEcoleId={user?.user?.idAutoEcole || user?.autoEcoleId}
        onRefresh={() => refresh(true)}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="bold">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm} 
            variant="contained" 
            color={confirmDialog.isDestructive ? "error" : "primary"}
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, minWidth: 200 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlanningSeancesPage;
