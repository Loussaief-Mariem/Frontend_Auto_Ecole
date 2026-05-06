// src/components/common/seances/PlanningCalendar.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
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
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CommentIcon from "@mui/icons-material/Comment"; // CHANGÉ: Renommé pour éviter conflit
import { useAuth } from "../../../context/AuthContext";
import PresenceDialog from "./PresenceDialog";

// Thèmes de code enum
const THEMES_CODE = {
  Signalisation: 0,
  ConducteurVehicule: 1,
  ArretStationnement: 2,
  CroisementDepassement: 3,
  Priorite: 4,
  Circulation: 5,
  Delits: 6,
  PremiersSecours: 7,
  MaintenanceEnergie: 8,
  TransportMatieresDangereuses: 9,
};

// Labels en français pour les thèmes
const THEME_LABELS = {
  [THEMES_CODE.Signalisation]: "Signalisation routière",
  [THEMES_CODE.ConducteurVehicule]: "Conducteur et véhicule",
  [THEMES_CODE.ArretStationnement]: "Arrêt et stationnement",
  [THEMES_CODE.CroisementDepassement]: "Croisement et dépassement",
  [THEMES_CODE.Priorite]: "Règles de priorité",
  [THEMES_CODE.Circulation]: "Circulation routière",
  [THEMES_CODE.Delits]: "Délits et infractions",
  [THEMES_CODE.PremiersSecours]: "Premiers secours",
  [THEMES_CODE.MaintenanceEnergie]: "Maintenance et énergie",
  [THEMES_CODE.TransportMatieresDangereuses]:
    "Transport de matières dangereuses",
};

const PlanningCalendar = ({
  seances,
  type,
  canEdit = false,
  onMarquerPresence,
  onAjouterRemarque,
  onAnnulerSeance,
  onDesannulerSeance,
  onModifierSeance,
  onAjouterParticipants,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSeances, setSelectedSeances] = useState([]);
  const [openRemarqueDialog, setOpenRemarqueDialog] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [remarque, setRemarque] = useState("");
  const [note, setNote] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [viewMode, setViewMode] = useState("list");
  const [openPresenceDialog, setOpenPresenceDialog] = useState(false);
  const [seanceForPresence, setSeanceForPresence] = useState(null);

  // Fonction pour parser la date correctement
  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    return new Date(dateString);
  };

  const handleDateClick = (date) => {
    const seancesOfDay = seances.filter((seance) => {
      const seanceDate = parseDate(seance.date);
      return seanceDate && isSameDay(seanceDate, date);
    });

    setSelectedSeances(seancesOfDay);
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleOpenPresence = (seance) => {
    setSeanceForPresence(seance);
    setOpenPresenceDialog(true);
  };

  const handleSubmitRemarque = async () => {
    if (onAjouterRemarque && selectedSeance) {
      try {
        await onAjouterRemarque(
          selectedSeance.id,
          selectedSeance.remarque,
          note,
        );
        setSnackbar({
          open: true,
          message: "Remarque ajoutée avec succès",
          severity: "success",
        });
        setOpenRemarqueDialog(false);
        if (onRefresh) {
          setTimeout(() => onRefresh(), 1500);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Erreur lors de l'ajout",
          severity: "error",
        });
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const hasEvent = seances.some((seance) => {
        const seanceDate = parseDate(seance.date);
        return seanceDate && isSameDay(seanceDate, date);
      });
      if (hasEvent) {
        return "react-calendar__tile--hasEvent";
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const daySeances = seances.filter((seance) => {
        const seanceDate = parseDate(seance.date);
        return seanceDate && isSameDay(seanceDate, date);
      });

      if (daySeances.length > 0) {
        return (
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={daySeances.length}
              size="small"
              sx={{
                bgcolor: type === "code" ? "#1976d2" : "#9c27b0",
                color: "white",
                height: 20,
                minWidth: 20,
                "& .MuiChip-label": { px: 0.5, fontSize: "0.7rem" },
              }}
            />
          </Box>
        );
      }
    }
    return null;
  };

  const getThemeLabel = (theme) => {
    if (!theme) return "Général";
    if (typeof theme === "number") {
      return THEME_LABELS[theme] || theme.toString();
    }
    const foundKey = Object.keys(THEMES_CODE).find((key) => key === theme);
    if (foundKey) {
      return THEME_LABELS[THEMES_CODE[foundKey]];
    }
    return theme;
  };

  const getSeanceTitle = (seance) => {
    if (type === "code") {
      const themeLabel = getThemeLabel(seance.theme);
      return `Séance de Code - ${themeLabel}`;
    }
    return `Séance de Conduite - ${getTypeConduiteText(seance.typeConduite)}`;
  };

  const getTypeConduiteText = (typeConduite) => {
    const types = {
      0: "Normale",
      1: "Accompagnée",
      2: "Supervisée",
      3: "Sur simulateur",
    };
    return types[typeConduite] || "Conduite";
  };

  const getStatusColor = (seance) => {
    if (seance.estAnnulee) return "error";
    const seanceDate = parseDate(seance.date);
    const now = startOfDay(new Date());
    if (isBefore(seanceDate, now) && !isSameDay(seanceDate, now)) return "default";
    return "success";
  };

  const getStatusText = (seance) => {
    if (seance.estAnnulee) return "Annulée";
    const seanceDate = parseDate(seance.date);
    const now = startOfDay(new Date());
    if (isBefore(seanceDate, now) && !isSameDay(seanceDate, now)) return "Terminée";
    return "À venir";
  };

  const formatHeure = (heure) => {
    if (!heure) return "N/A";
    if (typeof heure === "string") {
      return heure.substring(0, 5);
    }
    if (heure.hours !== undefined) {
      return `${heure.hours.toString().padStart(2, "0")}:${heure.minutes.toString().padStart(2, "0")}`;
    }
    return heure;
  };

  const isSecretaire = user?.role === "Secretaire";

  return (
    <>
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 24px;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .react-calendar__tile {
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 12px 8px;
          position: relative;
          transition: all 0.2s ease-in-out;
          border-radius: 12px;
          margin: 2px;
        }
        .react-calendar__tile:hover {
          background-color: #f8fafc !important;
          transform: translateY(-2px);
        }
        .react-calendar__tile--hasEvent {
          background: ${type === "code" ? "#f0f9ff" : "#fdf4ff"} !important;
          border: 1px solid ${type === "code" ? "#bae6fd" : "#f5d0fe"} !important;
        }
        .react-calendar__tile--active {
          background: ${type === "code" ? "#0284c7" : "#a855f7"} !important;
          color: white !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }
        .react-calendar__navigation button {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          border-radius: 8px;
          min-width: 44px;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 700;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 8px;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #cbd5e1;
        }
      `}</style>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 4, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h5"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {type === "code" ? "📚" : "🚗"} Planning des séances de{" "}
            {type === "code" ? "Code" : "Conduite"}
            <Chip
              label={`${seances.length} séances`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>

          {seances.length > 0 && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="list">📋 Liste</ToggleButton>
              <ToggleButton value="calendar">📅 Calendrier</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>

        {viewMode === "calendar" ? (
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="fr-FR"
          />
        ) : (
          <List sx={{ maxHeight: 600, overflow: "auto" }}>
            {seances.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Aucune séance planifiée
              </Typography>
            ) : (
              [...seances]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((seance, index) => (
                  <React.Fragment key={seance.id}>
                    <ListItem
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        py: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                        mb={1}
                      >
                        <Chip
                          label={getSeanceTitle(seance)}
                          color={type === "code" ? "primary" : "secondary"}
                          size="small"
                        />
                        <Chip
                          label={getStatusText(seance)}
                          color={getStatusColor(seance)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EventIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {format(parseDate(seance.date), "dd/MM/yyyy")}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatHeure(seance.heureDebut)} -{" "}
                            {seance.dureeMinutes} min
                          </Typography>
                        </Box>
                      </Box>

                      {type === "code" ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Thème: {getThemeLabel(seance.theme)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Secrétaire: {seance.secretaireNom || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Participants: {seance.presences?.length || 0} /{" "}
                            {seance.capaciteMax || 20}
                          </Typography>
                          {seance.presences && seance.presences.length > 0 && (
                            <Box mt={1}>
                              <Typography variant="subtitle2">
                                Participants:
                              </Typography>
                              <Box
                                display="flex"
                                flexWrap="wrap"
                                gap={0.5}
                                mt={0.5}
                              >
                                {seance.presences.slice(0, 5).map((p) => (
                                  <Chip
                                    key={p.contratId}
                                    label={`${p.candidatNom} ${p.candidatPrenom}`}
                                    size="small"
                                    variant="outlined"
                                    color={p.present ? "success" : "default"}
                                  />
                                ))}
                                {seance.presences.length > 5 && (
                                  <Chip
                                    label={`+${seance.presences.length - 5}`}
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Type: {getTypeConduiteText(seance.typeConduite)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Moniteur: {seance.moniteurNom || "N/A"}
                          </Typography>
                          {seance.candidatNom && (
                            <Typography variant="body2" color="text.secondary">
                              Candidat: {seance.candidatNom}{" "}
                              {seance.candidatPrenom}
                            </Typography>
                          )}
                        </>
                      )}

                      {isSecretaire && type === "code" && (
                        <Box display="flex" flexWrap="wrap" gap={1.5} mt={3}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => onModifierSeance(seance)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            Modifier
                          </Button>

                          {!seance.estAnnulee ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => onAnnulerSeance(seance.id)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Annuler
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<RestoreIcon />}
                              onClick={() => onDesannulerSeance(seance.id)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Réactiver
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            startIcon={<GroupIcon />}
                            onClick={() => onAjouterParticipants(seance.id)}
                            sx={{ 
                              borderRadius: 2, 
                              textTransform: 'none',
                              bgcolor: '#0ea5e9',
                              '&:hover': { bgcolor: '#0284c7' }
                            }}
                          >
                            Gérer Participants
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleOpenPresence(seance)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            Présences
                          </Button>
                        </Box>
                      )}

                      {(user?.role === "Moniteur" || user?.role === "Proprietaire") && type === "conduite" && (
                        <Box display="flex" flexWrap="wrap" gap={1.5} mt={3}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => onModifierSeance(seance)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            Modifier
                          </Button>

                          {!seance.estAnnulee ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => onAnnulerSeance(seance.id)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Annuler
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<RestoreIcon />}
                              onClick={() => onDesannulerSeance(seance.id)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Réactiver
                            </Button>
                          )}

                          {!seance.present && !seance.estAnnulee && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => onMarquerPresence(seance.id, true)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Présent
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            startIcon={<CommentIcon />}
                            onClick={() => {
                              setSelectedSeance(seance);
                              setRemarque(seance.remarquesPedagogiques || "");
                              setNote(seance.noteProgression || 0);
                              setOpenRemarqueDialog(true);
                            }}
                            sx={{ 
                              borderRadius: 2, 
                              textTransform: 'none',
                              bgcolor: '#0ea5e9',
                              '&:hover': { bgcolor: '#0284c7' }
                            }}
                          >
                            Remarque
                          </Button>
                        </Box>
                      )}
                    </ListItem>
                    {index <
                      [...seances].sort(
                        (a, b) => new Date(a.date) - new Date(b.date),
                      ).length -
                        1 && <Divider />}
                  </React.Fragment>
                ))
            )}
          </List>
        )}
      </Paper>

      {/* Dialog des détails */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              Séances du{" "}
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedSeances.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Aucune séance programmée ce jour
            </Typography>
          ) : (
            <List>
              {selectedSeances.map((seance, index) => (
                <React.Fragment key={seance.id}>
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Chip
                        label={getSeanceTitle(seance)}
                        color={type === "code" ? "primary" : "secondary"}
                        size="small"
                      />
                      <Chip
                        label={getStatusText(seance)}
                        color={getStatusColor(seance)}
                        size="small"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatHeure(seance.heureDebut)} -{" "}
                          {seance.dureeMinutes} min
                        </Typography>
                      </Box>
                    </Box>

                    {type === "code" ? (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Secrétaire: {seance.secretaireNom || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Thème: {getThemeLabel(seance.theme)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Capacité: {seance.capaciteMax || 20} participants
                        </Typography>
                        {seance.presences && seance.presences.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="subtitle2">
                              Participants:
                            </Typography>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              gap={0.5}
                              mt={0.5}
                            >
                              {seance.presences.map((p) => (
                                <Chip
                                  key={p.contratId}
                                  label={`${p.candidatNom} ${p.candidatPrenom}`}
                                  size="small"
                                  variant="outlined"
                                  color={p.present ? "success" : "default"}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Type: {getTypeConduiteText(seance.typeConduite)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Moniteur: {seance.moniteurNom || "N/A"}
                        </Typography>
                        {seance.candidatNom && (
                          <Typography variant="body2" color="text.secondary">
                            Candidat: {seance.candidatNom}{" "}
                            {seance.candidatPrenom}
                          </Typography>
                        )}
                      </>
                    )}

                    {isSecretaire && type === "code" && (
                      <Stack direction="row" spacing={1} mt={2} width="100%">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="outlined"
                          onClick={() => onModifierSeance(seance)}
                        >
                          Modifier
                        </Button>
                        {!seance.estAnnulee ? (
                          <Button
                            size="small"
                            startIcon={<CancelIcon />}
                            color="error"
                            variant="outlined"
                            onClick={() => onAnnulerSeance(seance.id)}
                          >
                            Annuler
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<RestoreIcon />}
                            color="success"
                            variant="outlined"
                            onClick={() => onDesannulerSeance(seance.id)}
                          >
                            Réactiver
                          </Button>
                        )}
                        <Button
                          size="small"
                          startIcon={<GroupIcon />}
                          variant="outlined"
                          color="info"
                          onClick={() => onAjouterParticipants(seance.id)}
                        >
                          Participants
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenPresence(seance)}
                        >
                          Présences
                        </Button>
                      </Stack>
                    )}

                    {(user?.role === "Moniteur" || user?.role === "Proprietaire") && type === "conduite" && (
                      <Stack direction="row" spacing={1} mt={2} width="100%">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="outlined"
                          onClick={() => onModifierSeance(seance)}
                        >
                          Modifier
                        </Button>
                        {!seance.estAnnulee ? (
                          <Button
                            size="small"
                            startIcon={<CancelIcon />}
                            color="error"
                            variant="outlined"
                            onClick={() => onAnnulerSeance(seance.id)}
                          >
                            Annuler
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<RestoreIcon />}
                            color="success"
                            variant="outlined"
                            onClick={() => onDesannulerSeance(seance.id)}
                          >
                            Réactiver
                          </Button>
                        )}
                        {!seance.present && !seance.estAnnulee && (
                          <Button
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            variant="outlined"
                            color="success"
                            onClick={() => onMarquerPresence(seance.id, true)}
                          >
                            Présent
                          </Button>
                        )}
                        <Button
                          size="small"
                          startIcon={<CommentIcon />}
                          variant="contained"
                          color="info"
                          onClick={() => {
                            setSelectedSeance(seance);
                            setRemarque(seance.remarquesPedagogiques || "");
                            setNote(seance.noteProgression || 0);
                            setOpenRemarqueDialog(true);
                          }}
                        >
                          Remarque
                        </Button>
                      </Stack>
                    )}
                  </ListItem>
                  {index < selectedSeances.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog remarque */}
      <Dialog
        open={openRemarqueDialog}
        onClose={() => setOpenRemarqueDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter une remarque pédagogique</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Remarque"
              multiline
              rows={4}
              value={remarque}
              onChange={(e) => setRemarque(e.target.value)}
              fullWidth
              placeholder="Commentaires sur la progression du candidat..."
            />
            <Box>
              <Typography gutterBottom>Note de progression (0-10)</Typography>
              <Rating
                value={note / 2}
                precision={0.5}
                onChange={(e, v) => setNote((v || 0) * 2)}
                max={5}
              />
              <Typography variant="body2" color="text.secondary">
                Note actuelle: {note}/10
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemarqueDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmitRemarque} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PresenceDialog
        open={openPresenceDialog}
        onClose={() => setOpenPresenceDialog(false)}
        seance={seanceForPresence}
        onRefresh={() => {
          if (onRefresh) onRefresh();
          if (openDialog && seanceForPresence) {
            setSelectedSeances(prev => prev.map(s => s.id === seanceForPresence.id ? {...s, ...seanceForPresence} : s));
          }
        }}
      />
    </>
  );
};

export default PlanningCalendar;