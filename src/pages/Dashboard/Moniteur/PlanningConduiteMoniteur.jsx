// src/pages/Dashboard/Moniteur/PlanningConduiteMoniteur.jsx
import React, { useState, useEffect } from "react";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
  TextField,
  Rating,
  Snackbar,
  Alert,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Container, // ✅ AJOUTER CETTE LIGNE
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../../../context/AuthContext";
import PlanningCalendar from "../../../components/common/seances/PlanningCalendar";
import {
  getPlanningMoniteur,
  marquerPresence,
  ajouterRemarque,
  annulerSeanceConduite,
} from "../../../api/seanceConduiteService";

const PlanningConduiteMoniteur = () => {
  const { user } = useAuth();
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadSeances = async () => {
    setLoading(true);
    setError(null);
    try {
      const moniteurId = user?.id || user?.user?.id;
      const data = await getPlanningMoniteur(moniteurId);
      setSeances(data || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?.user?.id) {
      loadSeances();
    }
  }, [user]);

  const handleMarquerPresence = async (seanceId, candidatId, present) => {
    try {
      await marquerPresence(seanceId, present);
      await loadSeances();
      setSnackbar({ open: true, message: "Présence mise à jour avec succès", severity: "success" });
    } catch (err) {
      console.error("Erreur lors du marquage de présence:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleAjouterRemarque = async (seanceId, candidatId, remarque, note) => {
    try {
      await ajouterRemarque(seanceId, remarque, note);
      await loadSeances();
      setSnackbar({ open: true, message: "Remarque ajoutée avec succès", severity: "success" });
    } catch (err) {
      console.error("Erreur lors de l'ajout de remarque:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleAnnulerSeance = async (seanceId) => {
    try {
      await annulerSeanceConduite(seanceId);
      await loadSeances();
      setSnackbar({ open: true, message: "Séance annulée avec succès", severity: "success" });
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ p: 3, bgcolor: "#ffebee", borderRadius: 2 }}>
          <Typography color="error">Erreur: {error}</Typography>
          <Button variant="contained" onClick={loadSeances} sx={{ mt: 2 }}>
            Réessayer
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PlanningCalendar
          seances={seances}
          type="conduite"
          canEdit={true}
          onMarquerPresence={handleMarquerPresence}
          onAjouterRemarque={handleAjouterRemarque}
          onAnnulerSeance={handleAnnulerSeance}
        />
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PlanningConduiteMoniteur;