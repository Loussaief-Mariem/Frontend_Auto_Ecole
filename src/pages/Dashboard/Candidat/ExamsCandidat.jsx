import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAuth } from "../../../context/AuthContext";
import useExamens from "../../../hooks/useExamens";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ExamCard = ({ title, date, result, attempts, status, lieu, note, reports }) => {
  const currentStatus = status?.toString().toLowerCase() || "";
  const isSuccess = currentStatus === "réussi" || currentStatus === "satisfait" || currentStatus === "2" || result?.toLowerCase() === "reçu";
  const isFailed = currentStatus === "échec" || currentStatus === "ajourne" || currentStatus === "ajourné" || currentStatus === "3";
  const isPostponed = currentStatus === "reporté" || currentStatus === "reporte" || currentStatus === "4";
  const isPassed = ["effectué", "réussi", "échec", "satisfait", "ajourne", "ajourné", "2", "3"].includes(currentStatus);
  const isCode = title?.toLowerCase().includes("code");
  const maxScore = isCode ? 30 : 40;

  // Définition des couleurs selon le statut
  const getStatusStyles = () => {
    if (isSuccess) {
      return {
        bgcolor: "#f0fdf4", // Vert très doux
        borderColor: "#bbf7d0",
        iconColor: "#16a34a",
        chipColor: "success",
      };
    }
    if (isFailed) {
      return {
        bgcolor: "#fef2f2", // Rouge très doux
        borderColor: "#fecaca",
        iconColor: "#dc2626",
        chipColor: "error",
      };
    }
    if (isPostponed) {
      return {
        bgcolor: "#fffbeb", // Orange très doux
        borderColor: "#fef3c7",
        iconColor: "#d97706",
        chipColor: "warning",
      };
    }
    if (!isPassed) {
      return {
        bgcolor: "#f0f9ff", // Bleu très doux (À venir)
        borderColor: "#bae6fd",
        iconColor: "#0284c7",
        chipColor: "primary",
      };
    }
    return {
      bgcolor: "background.paper",
      borderColor: "divider",
      iconColor: "text.secondary",
      chipColor: "default",
    };
  };

  const styles = getStatusStyles();

  // Mapping des libellés pour l'affichage
  const getStatusLabel = () => {
    const labels = {
      "1": "Programmé",
      "2": "Réussi",
      "3": "Échec",
      "4": "Reporté",
      "5": "Invalide",
      "satisfait": "Réussi",
      "ajourne": "Échec",
      "ajourné": "Échec",
      "reporté": "Reporté",
      "reporte": "Reporté",
      "programmé": "Programmé",
    };
    return labels[currentStatus] || status || "À venir";
  };

  const displayStatus = getStatusLabel();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: styles.borderColor,
        bgcolor: styles.bgcolor,
        mb: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 10px 20px -10px ${styles.borderColor}`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{
              bgcolor: "white",
              color: styles.iconColor,
              width: 52,
              height: 52,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: styles.borderColor,
            }}
          >
            <AssignmentOutlinedIcon />
          </Avatar>
          <Box>
            <Typography fontWeight={800} color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
              {date}
            </Typography>
            {isPostponed && reports && reports.length > 0 && (
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                 Initialement prévu le : {
                   (() => {
                     const latest = reports[reports.length - 1];
                     if (!latest.ancienneDate) return "N/A";
                     try {
                        const d = new Date(latest.ancienneDate);
                        return `${format(d, "dd MMMM yyyy", { locale: fr })} à ${latest.ancienneHeure || ""}`;
                     } catch(e) { return latest.ancienneDate; }
                   })()
                 }
              </Typography>
            )}
            {lieu && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                 {lieu}
              </Typography>
            )}
            {note !== undefined && note !== null && (
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mt: 0.5, display: "block" }}>
                Score: {note}/{maxScore}
              </Typography>
            )}
            {isCode && isSuccess && (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                  Code obtenu le {date.split(" à ")[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                   Expire le 15 Mars 2027
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={4} alignItems="center">
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
              TENTATIVE
            </Typography>
            <Typography variant="body1" fontWeight={900} color={styles.iconColor}>
              #{attempts}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ opacity: 0.3 }} />
          <Box sx={{ minWidth: 110, textAlign: "right" }}>
            {isPassed ? (
              <Chip
                icon={isSuccess ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                label={isSuccess ? "Réussi" : "Échec"}
                color={styles.chipColor}
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
            ) : (
              <Chip
                label={displayStatus}
                color={styles.chipColor}
                variant={isPostponed ? "filled" : "outlined"}
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
            )}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ExamsCandidat = () => {
  const { user } = useAuth();
  const contratId = user?.contratId || user?.user?.contratId;
  const { examensAVenir, historiqueExamens, loading, error } = useExamens(contratId);
  
  // Données statiques pour la démonstration
  const staticHistorique = [
    {
      id: "ex-report",
      typeExamen: "Conduite (Circulation)",
      date: "2025-03-12",
      heure: "08:00",
      tentativeNumero: 1,
      statut: "4", // Reporté
      lieu: "Parcours Circulation (Sidi Mansour)",
      noteCode: null,
      reports: [
        {
          ancienneDate: "2025-05-25T00:00:00",
          ancienneHeure: "10:00"
        }
      ]
    },
    {
      id: "ex-1",
      typeExamen: "Code (Théorique)",
      date: "2025-12-15",
      heure: "09:00",
      tentativeNumero: 1,
      statut: "2", // Réussi
      lieu: "Centre de Sidi Mansour",
      noteCode: 28
    },
    {
      id: "ex-2",
      typeExamen: "Conduite (Circulation)",
      date: "2026-03-10",
      heure: "14:30",
      tentativeNumero: 1,
      statut: "3", // Échec
      lieu: "Parcours Circulation (Sidi Mansour)",
      noteCode: null
    }
  ];

  const staticAVenir = [
    {
      id: "ex-3",
      typeExamen: "Conduite (Circulation)",
      date: "2026-05-25",
      heure: "10:00",
      tentativeNumero: 2,
      statut: "1", // Programmé
      lieu: "Parcours Circulation (Sidi Mansour)",
      noteCode: null
    }
  ];

  const formatExamDate = (dateStr, heure) => {
    try {
      const date = new Date(dateStr);
      return `${format(date, "dd MMMM yyyy", { locale: fr })} à ${heure || ""}`;
    } catch (e) {
      return dateStr;
    }
  };

  const displayAVenir = examensAVenir?.length > 0 ? examensAVenir : staticAVenir;
  const displayHistorique = historiqueExamens?.length > 0 ? historiqueExamens : staticHistorique;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Mes Examens
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Prochains examens
          </Typography>
          {displayAVenir.length > 0 ? (
            displayAVenir.map((exam) => (
              <ExamCard
                key={exam.id}
                title={exam.typeExamen}
                date={formatExamDate(exam.date, exam.heure)}
                attempts={exam.tentativeNumero}
                status={exam.statut}
                lieu={exam.lieu || exam.centreExamen}
                note={exam.noteCode}
                reports={exam.reports}
              />
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4, bgcolor: "background.default" }}>
              <Typography color="text.secondary">Aucun examen programmé pour le moment.</Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2} mt={4}>
            Historique des examens
          </Typography>
          {displayHistorique.length > 0 ? (
            displayHistorique.map((exam) => (
              <ExamCard
                key={exam.id}
                title={exam.typeExamen}
                date={formatExamDate(exam.date, exam.heure)}
                attempts={exam.tentativeNumero}
                status={exam.statut}
                lieu={exam.lieu || exam.centreExamen}
                note={exam.noteCode}
                reports={exam.reports}
              />
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4, bgcolor: "background.default" }}>
              <Typography color="text.secondary">Vous n'avez pas encore d'historique d'examens.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamsCandidat;
