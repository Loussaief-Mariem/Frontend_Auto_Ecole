import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
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
  const isSuccess = ["réussi", "satisfait", "2"].includes(currentStatus) || result?.toLowerCase() === "reçu";
  const isFailed = ["échec", "ajourne", "ajourné", "3"].includes(currentStatus);
  const isPostponed = ["reporté", "reporte", "4"].includes(currentStatus);
  const isPassed = ["effectué", "réussi", "échec", "satisfait", "ajourne", "ajourné", "2", "3"].includes(currentStatus);
  const isCode = title?.toLowerCase().includes("code");
  const maxScore = isCode ? 30 : 40;

  // Définition des couleurs selon le statut
  const getStatusStyles = useCallback(() => {
    if (isSuccess) {
      return {
        bgcolor: "#f0fdf4",
        borderColor: "#bbf7d0",
        iconColor: "#16a34a",
        chipColor: "success",
      };
    }
    if (isFailed) {
      return {
        bgcolor: "#fef2f2",
        borderColor: "#fecaca",
        iconColor: "#dc2626",
        chipColor: "error",
      };
    }
    if (isPostponed) {
      return {
        bgcolor: "#fffbeb",
        borderColor: "#fef3c7",
        iconColor: "#d97706",
        chipColor: "warning",
      };
    }
    if (!isPassed) {
      return {
        bgcolor: "#f0f9ff",
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
  }, [isSuccess, isFailed, isPostponed, isPassed]);

  const styles = getStatusStyles();

  // Mapping des libellés pour l'affichage
  const getStatusLabel = useCallback(() => {
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
  }, [currentStatus, status]);

  const displayStatus = getStatusLabel();

  // Formater la date de report
  const getReportDate = useCallback(() => {
    if (!isPostponed || !reports?.length) return null;
    const latest = reports[reports.length - 1];
    if (!latest?.ancienneDate) return null;
    try {
      const d = new Date(latest.ancienneDate);
      return `${format(d, "dd MMMM yyyy", { locale: fr })} à ${latest.ancienneHeure || ""}`;
    } catch (e) {
      return latest.ancienneDate;
    }
  }, [isPostponed, reports]);

  const reportDate = getReportDate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: styles.borderColor,
        bgcolor: styles.bgcolor,
        mb: 2.5,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: `0 8px 24px -10px ${styles.borderColor}`,
        },
        width: "100%",
      }}
    >
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }} 
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", flex: 1 }}>
          <Avatar
            sx={{
              bgcolor: "white",
              color: styles.iconColor,
              width: 48,
              height: 48,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid",
              borderColor: styles.borderColor,
            }}
          >
            <AssignmentOutlinedIcon />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={800} color="text.primary" variant="body1">
              {title}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }} mt={0.5}>
              {date}
            </Typography>
            
            {reportDate && (
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                Initialement prévu le : {reportDate}
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

        <Stack 
          direction={{ xs: "row", sm: "column" }} 
          spacing={2} 
          alignItems={{ xs: "center", sm: "flex-end" }} 
          justifyContent="space-between" 
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Box textAlign={{ xs: "left", sm: "right" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
              TENTATIVE
            </Typography>
            <Typography variant="body1" fontWeight={950} color={styles.iconColor} align="center">
              #{attempts}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ display: { xs: "block", sm: "none" }, opacity: 0.3 }} />
          
          <Box sx={{ minWidth: 100, textAlign: "right" }}>
            {isPassed ? (
              <Chip
                icon={isSuccess ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                label={isSuccess ? "Réussi" : "Échec"}
                color={styles.chipColor}
                sx={{ fontWeight: 800, borderRadius: 2 }}
                size="small"
              />
            ) : (
              <Chip
                label={displayStatus}
                color={styles.chipColor}
                variant={isPostponed ? "filled" : "outlined"}
                sx={{ fontWeight: 800, borderRadius: 2 }}
                size="small"
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

  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState("Tous");
  
  // Données statiques pour la démonstration
  const staticHistorique = useMemo(() => [
    {
      id: "ex-report",
      typeExamen: "Conduite (Circulation)",
      date: "2025-03-12",
      heure: "08:00",
      tentativeNumero: 1,
      statut: "4",
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
      statut: "2",
      lieu: "Centre de Sidi Mansour",
      noteCode: 28
    },
    {
      id: "ex-2",
      typeExamen: "Conduite (Circulation)",
      date: "2026-03-10",
      heure: "14:30",
      tentativeNumero: 1,
      statut: "3",
      lieu: "Parcours Circulation (Sidi Mansour)",
      noteCode: null
    }
  ], []);

  const staticAVenir = useMemo(() => [
    {
      id: "ex-3",
      typeExamen: "Conduite (Circulation)",
      date: "2026-05-25",
      heure: "10:00",
      tentativeNumero: 2,
      statut: "1",
      lieu: "Parcours Circulation (Sidi Mansour)",
      noteCode: null
    }
  ], []);

  const formatExamDate = useCallback((dateStr, heure) => {
    if (!dateStr) return "Date non spécifiée";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${format(date, "dd MMMM yyyy", { locale: fr })} à ${heure || ""}`;
    } catch (e) {
      console.error("Erreur formatage date:", e);
      return dateStr;
    }
  }, []);

  const displayAVenir = examensAVenir?.length > 0 ? examensAVenir : staticAVenir;
  const displayHistorique = historiqueExamens?.length > 0 ? historiqueExamens : staticHistorique;

  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const filterExams = useCallback((exams) => {
    if (filterType === "Tous") return exams;
    
    return exams.filter((exam) => {
      const examTitle = exam.typeExamen?.toLowerCase() || "";
      if (filterType === "Code") {
        return examTitle.includes("code") || examTitle.includes("théorique") || examTitle.includes("theorique");
      }
      if (filterType === "Conduite") {
        return examTitle.includes("conduite") || examTitle.includes("pratique") || examTitle.includes("circulation");
      }
      return true;
    });
  }, [filterType]);

  const filteredAVenir = useMemo(() => filterExams(displayAVenir), [filterExams, displayAVenir]);
  const filteredHistorique = useMemo(() => filterExams(displayHistorique), [filterExams, displayHistorique]);

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
    <Box sx={{ maxWidth: 800, margin: "0 auto", width: "100%", px: { xs: 2, sm: 0 } }}>
      <Stack direction="column" spacing={3} mb={4}>
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          justifyContent="space-between" 
          alignItems={{ xs: "flex-start", sm: "center" }} 
          spacing={2}
        >
          <Typography variant="h4" fontWeight={800}>
            Mes Examens
          </Typography>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: "auto", pb: { xs: 1, sm: 0 }, width: { xs: "100%", sm: "auto" } }}>
            {["Tous", "Code", "Conduite"].map((type) => (
              <Chip
                key={type}
                label={type}
                clickable
                color={filterType === type ? "primary" : "default"}
                variant={filterType === type ? "filled" : "outlined"}
                onClick={() => handleFilterChange(type)}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="exam tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                px: 3,
                minWidth: "auto",
              }
            }}
          >
            <Tab label={`À venir (${filteredAVenir.length})`} />
            <Tab label={`Historique (${filteredHistorique.length})`} />
          </Tabs>
        </Box>
      </Stack>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Stack spacing={2}>
          {filteredAVenir.length > 0 ? (
            filteredAVenir.map((exam) => (
              <ExamCard
                key={exam.id || `${exam.typeExamen}-${exam.date}`}
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
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
              <Typography color="text.secondary" variant="body1" fontWeight={600}>
                Aucun examen programmé ne correspond aux filtres.
              </Typography>
            </Paper>
          )}
        </Stack>
      )}

      {tabValue === 1 && (
        <Stack spacing={2}>
          {filteredHistorique.length > 0 ? (
            filteredHistorique.map((exam) => (
              <ExamCard
                key={exam.id || `${exam.typeExamen}-${exam.date}-${exam.tentativeNumero}`}
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
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
              <Typography color="text.secondary" variant="body1" fontWeight={600}>
                Aucun historique d'examen ne correspond aux filtres.
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ExamsCandidat;