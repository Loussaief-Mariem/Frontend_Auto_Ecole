// src/pages/Dashboard/Moniteur/PlanningConduitePage.jsx
import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlanningGlobalPage from "../PlanningGlobalPage";

import { useAuth } from "../../../context/AuthContext";
import { useSeancesConduite } from "../../../hooks/useSeancesConduite";
import { useContrats } from "../../../hooks/useContrats";
import PlanningCalendar from "../../../components/common/seances/PlanningCalendar";
import SeanceConduiteForm from "../../../components/common/seances/SeanceConduiteForm";
import SeanceFilters from "../../../components/common/seances/SeanceFilters";

const PlanningConduitePage = () => {
  const { user } = useAuth();
  const isMoniteur = user?.role === "Moniteur";
  const moniteurId = isMoniteur ? (user?.user?.id || user?.id) : null;
  const autoEcoleId = user?.user?.idAutoEcole || user?.user?.autoEcoleId || user?.autoEcoleId;

  const {
    filteredSeances,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    viewScope,
    setViewScope,
    tabValue,
    setTabValue,
    counts,
    refresh,
    planifier,
    handleAnnuler,
    handleDesannuler,
    marquerPresenceSeance,
    ajouterRemarqueSeance
  } = useSeancesConduite(user);

  const {
    allContrats: contratsPratique,
    loading: loadingCandidats,
    setFilterType,
    setSelectedMoniteurId,
  } = useContrats(autoEcoleId, {
    initialFilterType: "pratique",
    moniteurId: moniteurId,
  });

  const [openPlanifier, setOpenPlanifier] = useState(false);
  const [openGlobalCalendar, setOpenGlobalCalendar] = useState(false);
  const [selectedSeanceToEdit, setSelectedSeanceToEdit] = useState(null);
  
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

  useEffect(() => {
    if (autoEcoleId) {
      setFilterType("pratique");
      setSelectedMoniteurId(moniteurId || null);
    }
  }, [setFilterType, setSelectedMoniteurId, moniteurId, autoEcoleId]);

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
      "Êtes-vous sûr de vouloir annuler cette séance ?",
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

  // Extract candidates from contracts for the form
  const candidats = (contratsPratique || []).map(c => ({
    id: c.candidatId || c.candidat?.id,
    contratId: c.id,
    prenom: c.candidatPrenom || c.candidat?.prenom,
    nom: c.candidatNom || c.candidat?.nom,
    numeroCIN: c.cin || c.candidatCIN || c.candidat?.numeroCIN,
    moniteurId: c.moniteurId || c.moniteur?.id
  })).filter(c => c.id);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="text.primary">
            Planning de Conduite
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gérez vos leçons de conduite et le suivi des candidats
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenPlanifier(true)}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(156, 39, 176, 0.39)',
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            Planifier Séance
          </Button>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          textColor="secondary"
          indicatorColor="secondary"
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
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        viewScope={viewScope}
        setViewScope={setViewScope}
        showScopeFilter={user?.role === "Moniteur" || user?.role === "Secretaire"}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content View */}
      <PlanningCalendar
        seances={filteredSeances}
        type="conduite"
        canEdit={true}
        onRefresh={() => refresh(true)}
        onMarquerPresence={marquerPresenceSeance}
        onAjouterRemarque={ajouterRemarqueSeance}
        onAnnulerSeance={onAnnulerClick}
        onDesannulerSeance={onRestoreClick}
        onModifierSeance={handleModifier}
      />

      {/* Form Dialog */}
      <SeanceConduiteForm
        open={openPlanifier}
        onClose={() => {
          setOpenPlanifier(false);
          setSelectedSeanceToEdit(null);
        }}
        onSubmit={planifier}
        moniteurId={moniteurId || (user?.user?.id || user?.id)}
        candidats={candidats}
        initialData={selectedSeanceToEdit}
        loading={loading || loadingCandidats}
      />

      {/* Global Calendar Dialog */}
      <Dialog 
        open={openGlobalCalendar} 
        onClose={() => setOpenGlobalCalendar(false)} 
        maxWidth="xl" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8fafc' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Typography variant="h5" fontWeight="800">Calendrier Global</Typography>
          <IconButton onClick={() => setOpenGlobalCalendar(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <PlanningGlobalPage />
        </DialogContent>
      </Dialog>

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

export default PlanningConduitePage;
