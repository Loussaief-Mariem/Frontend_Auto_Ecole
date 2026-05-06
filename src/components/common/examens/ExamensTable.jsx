// src/components/common/examens/ExamensTable.jsx
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  EventRepeat as ReportIcon,
  Grading as ResultIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  MenuBook as CodeIcon,
  DirectionsCar as CirculationIcon,
  Park as ManoeuvreIcon,
} from "@mui/icons-material";

const statusColors = {
  PROGRAMME: "info",
  Programmé: "info",
  Programme: "info",
  Satisfait: "success",
  Ajourne: "error",
  Ajourné: "error",
  Reporte: "warning",
  Reporté: "warning",
  Absent: "warning",
  Annule: "error",
  Annulé: "error",
  Invalide: "error",
};

// Mapping des types d'examen vers les icônes
const getTypeExamenIcon = (typeExamen) => {
  switch (typeExamen) {
    case "Code":
    case 0:
      return <CodeIcon fontSize="small" />;
    case "Circulation":
    case 1:
      return <CirculationIcon fontSize="small" />;
    case "Manœuvre":
    case "Manoeuvre":
    case 2:
      return <ManoeuvreIcon fontSize="small" />;
    default:
      return null;
  }
};

// Mapping des types d'examen vers les labels
const getTypeExamenLabel = (typeExamen) => {
  switch (typeExamen) {
    case "Code":
    case 0:
      return "Code";
    case "Circulation":
    case 1:
      return "Circulation";
    case "Manœuvre":
    case "Manoeuvre":
    case 2:
      return "Manœuvre";
    default:
      return "Inconnu";
  }
};

// Mapping des types d'examen vers les couleurs
const getTypeExamenColor = (typeExamen) => {
  switch (typeExamen) {
    case "Code":
    case 0:
      return "primary";
    case "Circulation":
    case 1:
      return "secondary";
    case "Manœuvre":
    case "Manoeuvre":
    case 2:
      return "info";
    default:
      return "default";
  }
};

const ExamensTable = ({
  examens,
  loading,
  onDownloadPdf,
  onReport,
  onResult,
}) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [reportingId, setReportingId] = useState(null);

  const handleDownload = async (examenId) => {
    console.log("📄 Téléchargement - examenId:", examenId);
    if (!examenId) return;
    setDownloadingId(examenId);
    try {
      await onDownloadPdf(examenId);
    } catch (err) {
      console.error("❌ Erreur téléchargement:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReport = (examen) => {
    console.log("📅 Report - examen:", examen);
    if (examen && examen.id) {
      onReport(examen);
    } else {
      console.error("❌ Examen invalide pour report:", examen);
    }
  };

  const handleResult = (examen) => {
    console.log("📝 Résultat - examen:", examen);
    if (examen && examen.id) {
      onResult(examen);
    } else {
      console.error("❌ Examen invalide pour résultat:", examen);
    }
  };

  // Règles d'affichage des actions selon le statut
  const getActionsForExamen = (examen) => {
    const actions = [];
    const statut = examen.statut;

    // 1. Action PDF - Visible pour tous les examens (toujours disponible)
    actions.push({
      type: "pdf",
      show: true,
      tooltip: "Télécharger la convocation",
      icon: <PdfIcon />,
      color: "secondary",
      handler: () => handleDownload(examen.id),
      loading: downloadingId === examen.id,
    });

    // 2. Action Reporter - Uniquement pour les examens PROGRAMMÉS
    const isProgramme = ["Programmé", "Programme", "PROGRAMME"].includes(
      statut,
    );
    if (isProgramme) {
      actions.push({
        type: "report",
        show: true,
        tooltip: "Reporter l'examen",
        icon: <ReportIcon />,
        color: "warning",
        handler: () => handleReport(examen),
        loading: reportingId === examen.id,
      });
    }

    // 3. Action Résultat - Uniquement pour les examens PROGRAMMÉS (avant d'avoir un résultat)
    if (isProgramme) {
      actions.push({
        type: "result",
        show: true,
        tooltip: "Enregistrer le résultat",
        icon: <ResultIcon />,
        color: "primary",
        handler: () => handleResult(examen),
        loading: false,
      });
    }

    // 4. Indicateurs de statut (remplacent les actions quand examen a déjà un résultat)
    if (statut === "Satisfait") {
      return {
        type: "status",
        icon: <SuccessIcon color="success" />,
        tooltip: "Examen réussi",
      };
    }

    if (statut === "Ajourne" || statut === "Ajourné") {
      return {
        type: "status",
        icon: <FailIcon color="error" />,
        tooltip: "Examen non réussi",
      };
    }

    if (statut === "Reporté" || statut === "Reporte") {
      return {
        type: "status",
        icon: <ReportIcon color="warning" />,
        tooltip: "Examen reporté",
      };
    }

    return { type: "actions", actions };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (examens.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">Aucun examen trouvé</Typography>
      </Paper>
    );
  }

  console.log("Examens à afficher:", examens);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Heure</TableCell>
            <TableCell>Centre</TableCell>
            <TableCell>Lieu</TableCell>
            <TableCell>Tentative</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Note</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {examens.map((examen) => {
            const actionsConfig = getActionsForExamen(examen);

            return (
              <TableRow key={examen.id} hover>
                <TableCell>
                  <Chip
                    icon={getTypeExamenIcon(examen.typeExamen)}
                    label={getTypeExamenLabel(examen.typeExamen)}
                    size="small"
                    color={getTypeExamenColor(examen.typeExamen)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(examen.date).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>{examen.heure}</TableCell>
                <TableCell>{examen.centreExamen}</TableCell>
                <TableCell>{examen.lieu}</TableCell>
                <TableCell>{examen.tentativeNumero}</TableCell>
                <TableCell>
                  <Chip
                    label={examen.statut}
                    color={statusColors[examen.statut] || "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {examen.noteCode ? `${examen.noteCode}/40` : "—"}
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {actionsConfig.type === "status" ? (
                      // Affichage d'un simple indicateur de statut
                      <Tooltip title={actionsConfig.tooltip}>
                        {actionsConfig.icon}
                      </Tooltip>
                    ) : (
                      // Affichage des actions (max 3: PDF, Reporter, Résultat)
                      actionsConfig.actions.map((action, idx) => (
                        <Tooltip key={idx} title={action.tooltip}>
                          <IconButton
                            size="small"
                            color={action.color}
                            onClick={action.handler}
                            disabled={action.loading}
                          >
                            {action.loading ? (
                              <CircularProgress size={20} />
                            ) : (
                              action.icon
                            )}
                          </IconButton>
                        </Tooltip>
                      ))
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExamensTable;
