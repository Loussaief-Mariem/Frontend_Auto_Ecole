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

const ExamCard = ({ title, date, result, attempts, status, lieu, note }) => {
  const currentStatus = status?.toString().toLowerCase() || "";
  const isSuccess = currentStatus === "réussi" || currentStatus === "satisfait" || currentStatus === "2" || result?.toLowerCase() === "reçu";
  const isFailed = currentStatus === "échec" || currentStatus === "ajourne" || currentStatus === "ajourné" || currentStatus === "3";
  const isPostponed = currentStatus === "reporté" || currentStatus === "reporte" || currentStatus === "4";
  const isPassed = ["effectué", "réussi", "échec", "satisfait", "ajourne", "ajourné", "2", "3"].includes(currentStatus);

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
            {lieu && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                📍 {lieu}
              </Typography>
            )}
            {note !== undefined && note !== null && (
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mt: 0.5, display: "block" }}>
                Score: {note}/40
              </Typography>
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
  // On récupère contratId depuis user.contratId (ou user.user.contratId selon la structure)
  const contratId = user?.contratId || user?.user?.contratId;
  const { examensAVenir, historiqueExamens, loading, error } = useExamens(contratId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const formatExamDate = (dateStr, heure) => {
    try {
      const date = new Date(dateStr);
      return `${format(date, "dd MMMM yyyy", { locale: fr })} à ${heure || ""}`;
    } catch (e) {
      return dateStr;
    }
  };

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
          {examensAVenir.length > 0 ? (
            examensAVenir.map((exam) => (
              <ExamCard
                key={exam.id}
                title={exam.typeExamen}
                date={formatExamDate(exam.date, exam.heure)}
                attempts={exam.tentativeNumero}
                status={exam.statut}
                lieu={exam.lieu || exam.centreExamen}
                note={exam.noteCode}
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
          {historiqueExamens.length > 0 ? (
            historiqueExamens.map((exam) => (
              <ExamCard
                key={exam.id}
                title={exam.typeExamen}
                date={formatExamDate(exam.date, exam.heure)}
                attempts={exam.tentativeNumero}
                status={exam.statut}
                lieu={exam.lieu || exam.centreExamen}
                note={exam.noteCode}
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
