// src/pages/Dashboard/CandidatProfilePage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tabs,
  Tab,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Cake as CakeIcon,
  Smartphone as SmartphoneIcon,
  MarkEmailRead as MarkEmailReadIcon,
  CreditCard as CreditCardIcon,
  Cancel as CancelIcon,
  Restore as RestoreIcon,
  Assignment as ExamenIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import useCandidatProfile from "../../../hooks/useCandidatProfile";
import usePaiement from "../../../hooks/usePaiement";
import { useSeancesCode } from "../../../hooks/useSeancesCode";
import EditCandidatDialog from "../../../components/common/Candidat/EditCandidatDialog";
import CandidatPdfActions from "../../../components/common/Candidat/CandidatPdfActions";
import PaiementSection from "../../../components/common/paiement/PaiementSection";
import api from "../../../api/axios";
import candidatPlaceholder from "../../../assets/candidat.jpg";
import { useAuth } from "../../../context/AuthContext";
import {
  TypeFormation,
  getEtatCompteDisplay,
  Sexe,
} from "../../../enums";
import ExamenForm from "../../../components/common/examens/ExamenForm";
import ResultatExamenForm from "../../../components/common/examens/ResultatExamenForm";
import ReportExamenForm from "../../../components/common/examens/ReportExamenForm";
import ExamensTable from "../../../components/common/examens/ExamensTable";
import useExamens from "../../../hooks/useExamens";

const LABEL_TYPE_FORMATION = {
  [TypeFormation.Theorique]: "Code seulement",
  [TypeFormation.Pratique]: "Conduite seulement",
  [TypeFormation.Complet]: "Formation complète",
};

/** Date + heure (création, réception document, etc.) */
const formatDateTime = (value) => {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("fr-TN");
};

/**
 * Date « jour seul » sans décalage fuseau : l’API envoie souvent `T23:00:00` UTC
 * ce qui fausse le jour avec `new Date(iso)` en fuseau Tunisie.
 */
const formatDateCalendar = (value) => {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const day = Number(m[3]);
    const dt = new Date(y, mo, day);
    return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("fr-TN");
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-TN");
};

function getApiOrigin() {
  const base = api.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/i, "") || "";
}

/** URL absolue pour la photo candidat, ou image locale par défaut si vide. */
function resolveCandidatPhotoSrc(photoPath, placeholder) {
  const raw =
    photoPath == null || photoPath === "" ? "" : String(photoPath).trim();
  if (!raw) return placeholder;
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = getApiOrigin();
  if (!origin) return placeholder;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

const CandidatProfilePage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const { user } = useAuth();

  // Données du candidat
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    contratActif,
    adresse,
    compte,
    seancesCode,
    updateCandidat,
    uploadPhoto,
    refreshData,
  } = useCandidatProfile(id, user?.autoEcoleId);

  // Données financières via usePaiement
  const {
    situation: situationFinanciere,
    loading: paiementLoading,
    refresh: refreshPaiements,
  } = usePaiement(contratActif?.id);
  //console.log("profile.contrat:", profile.contrat);
  // Hook pour la gestion des séances de code
  const {
    marquerPresence: marquerPresenceAPI,
    mettreAJour: mettreAJourAPI,
    annulerSeance: annulerSeanceAPI,
    desannulerSeance: desannulerSeanceAPI,
    loading: seancesLoading,
  } = useSeancesCode();

  // Hook pour la gestion des examens
  const {
    examensAVenir,
    historiqueExamens,
    loading: examensLoading,
    programmerExamen,
    enregistrerResultat,
    reporterExamen,
    telechargerConvocation,
    refresh: refreshExamens,
  } = useExamens(profile?.contrat?.id);
 console.log("profile.contrat:", profile?.contrat);
console.log("profile", profile)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  // États pour la gestion des séances
  const [editingSeanceId, setEditingSeanceId] = useState(null);
  const [editedSeance, setEditedSeance] = useState({});
  const [seancesData, setSeancesData] = useState([]);
  const [updatingPresence, setUpdatingPresence] = useState({});
  const [cancellingSeance, setCancellingSeance] = useState({});
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSeanceForCancel, setSelectedSeanceForCancel] = useState(null);

  // États pour les dialogues des examens
  const [examenFormOpen, setExamenFormOpen] = useState(false);
  const [selectedExamenType, setSelectedExamenType] = useState("Code");
  const [resultatFormOpen, setResultatFormOpen] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [reportFormOpen, setReportFormOpen] = useState(false);

  // Récupérer le rôle de l'utilisateur connecté
  const userRole = localStorage.getItem("userRole") || "secretaire";

  useEffect(() => {
    setPhotoLoadError(false);
  }, [id]);

  // Transformer les données des séances de l'API
  useEffect(() => {
    if (seancesCode && seancesCode.length > 0) {
      const formattedSeances = seancesCode.map((seance) => {
        const currentParticipant = seance.participants?.find(
          (p) => p.candidatId === parseInt(id),
        );

        const prixParHeure = 40;
        const dureeHeures = seance.dureeMinutes / 60;
        const montant = dureeHeures * prixParHeure;
        const resteAPayer = currentParticipant?.present ? 0 : montant;

        return {
          id: seance.id,
          dateSeance: seance.date,
          heureDebut: seance.heureDebut,
          dureeMinutes: seance.dureeMinutes,
          theme: seance.theme,
          nombreHeures: dureeHeures,
          montant: montant,
          resteAPayer: resteAPayer,
          statut: currentParticipant?.present
            ? "Effectuée"
            : resteAPayer > 0
              ? "À payer"
              : "Payée",
          estAnnulee: seance.estAnnulee,
          present: currentParticipant?.present || false,
          secretaireId: seance.secretaireId,
          secretaireNom: seance.secretaireNom,
          capaciteMax: seance.capaciteMax,
        };
      });
      setSeancesData(formattedSeances);
    } else {
      setSeancesData([]);
    }
  }, [seancesCode, id]);

  const candidatForEdit = useMemo(() => {
    if (!profile) return null;
    const c = contratActif;
    return {
      ...profile,
      typePermisCode: c?.typePermisCode ?? profile.typePermisCode ?? "B",
      typeFormation:
        c?.typeFormation !== undefined && c?.typeFormation !== null
          ? c.typeFormation
          : profile.typeFormation,
    };
  }, [profile, contratActif]);

  const handleSaveProfile = useCallback(
    async (payload) => {
      await updateCandidat(payload);
    },
    [updateCandidat],
  );

  // Gestionnaires pour les examens
  const handleProgrammerExamen = async (data) => {
    await programmerExamen(data);
  };

  const handleEnregistrerResultat = async (data) => {
    await enregistrerResultat(data);
  };

  const handleReporterExamen = async (data) => {
    console.log("Données pour reporter examen depuis le composant:", data);
    await reporterExamen(data);
  };

  const handleOpenResultatForm = (examen) => {
    setSelectedExamen(examen);
    setResultatFormOpen(true);
  };

  const handleOpenReportForm = (examen) => {
    setSelectedExamen(examen);
    setReportFormOpen(true);
  };

  // Fonction pour marquer la présence avec le hook
  const handleTogglePresence = async (seanceId, currentPresent) => {
    try {
      setUpdatingPresence((prev) => ({ ...prev, [seanceId]: true }));

      await marquerPresenceAPI(seanceId, user.user.id, !currentPresent);

      setSeancesData((prev) =>
        prev.map((s) =>
          s.id === seanceId
            ? {
                ...s,
                present: !currentPresent,
                resteAPayer: !currentPresent ? 0 : s.montant,
                statut: !currentPresent ? "Effectuée" : "À payer",
              }
            : s,
        ),
      );

      refreshPaiements();
    } catch (err) {
      console.error("Erreur lors du marquage de présence:", err);
      alert(
        err.response?.data?.message || "Erreur lors du marquage de présence",
      );
    } finally {
      setUpdatingPresence((prev) => ({ ...prev, [seanceId]: false }));
    }
  };

  // Fonction pour modifier une séance avec le hook
  const handleEditSeance = (seance) => {
    setEditingSeanceId(seance.id);
    setEditedSeance({ ...seance });
  };

  const handleSaveSeance = async () => {
    try {
      const seanceToUpdate = {
        id: editedSeance.id,
        date: editedSeance.dateSeance,
        heureDebut: editedSeance.heureDebut,
        dureeMinutes: editedSeance.nombreHeures * 60,
        theme: editedSeance.theme,
        capaciteMax: editedSeance.capaciteMax,
      };

      const updatedSeance = await mettreAJourAPI(seanceToUpdate);

      setSeancesData((prev) =>
        prev.map((s) => {
          if (s.id === editedSeance.id) {
            const dureeHeures = updatedSeance.dureeMinutes / 60;
            return {
              ...s,
              dateSeance: updatedSeance.date,
              heureDebut: updatedSeance.heureDebut,
              dureeMinutes: updatedSeance.dureeMinutes,
              theme: updatedSeance.theme,
              nombreHeures: dureeHeures,
              montant: dureeHeures * 40,
              capaciteMax: updatedSeance.capaciteMax,
            };
          }
          return s;
        }),
      );

      setEditingSeanceId(null);
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de la modification de la séance",
      );
    }
  };

  // Fonction pour annuler une séance avec le hook
  const handleCancelSeance = (seance) => {
    setSelectedSeanceForCancel(seance);
    setCancelDialogOpen(true);
  };

  const confirmCancelSeance = async () => {
    if (!selectedSeanceForCancel) return;

    try {
      setCancellingSeance((prev) => ({
        ...prev,
        [selectedSeanceForCancel.id]: true,
      }));

      await annulerSeanceAPI(selectedSeanceForCancel.id);

      setSeancesData((prev) =>
        prev.map((s) =>
          s.id === selectedSeanceForCancel.id ? { ...s, estAnnulee: true } : s,
        ),
      );

      setCancelDialogOpen(false);
      setSelectedSeanceForCancel(null);
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de l'annulation de la séance",
      );
    } finally {
      setCancellingSeance((prev) => ({
        ...prev,
        [selectedSeanceForCancel.id]: false,
      }));
    }
  };

  // Fonction pour désannuler une séance avec le hook
  const handleRestoreSeance = async (seanceId) => {
    try {
      setCancellingSeance((prev) => ({ ...prev, [seanceId]: true }));

      await desannulerSeanceAPI(seanceId);

      setSeancesData((prev) =>
        prev.map((s) => (s.id === seanceId ? { ...s, estAnnulee: false } : s)),
      );
    } catch (err) {
      console.error("Erreur lors de la restauration:", err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de la restauration de la séance",
      );
    } finally {
      setCancellingSeance((prev) => ({ ...prev, [seanceId]: false }));
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // Utilisation des données de l'API pour les totaux financiers
  const totalMontant = situationFinanciere?.total ?? 0;
  const totalReste = situationFinanciere?.reste ?? 0;
  const totalHeures = seancesData.reduce((sum, s) => sum + s.nombreHeures, 0);

  const etatCompteDisplay = getEtatCompteDisplay(compte);

  const sexeNum =
    profile?.sexe === undefined || profile?.sexe === null
      ? null
      : Number(profile.sexe);
  const sexeLabel =
    sexeNum === Sexe.Homme
      ? "Masculin"
      : sexeNum === Sexe.Femme
        ? "Féminin"
        : "—";

  const formationLabel =
    contratActif != null
      ? (LABEL_TYPE_FORMATION[contratActif.typeFormation] ??
        `Type ${contratActif.typeFormation}`)
      : "—";

  const loading = profileLoading || paiementLoading || seancesLoading;

  /** Carte de section */
  const InfoCard = ({ icon: Icon, title, items }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
        bgcolor: "background.paper",
        boxShadow: `0 1px 2px ${alpha("#000", 0.04)}, 0 4px 24px ${alpha("#000", 0.04)}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(
            theme.palette.grey[50],
            theme.palette.mode === "dark" ? 0.15 : 1,
          ),
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="text.primary"
          sx={{ letterSpacing: "-0.01em", lineHeight: 1.35 }}
        >
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 0.5, sm: 2 },
              px: 2.5,
              py: 1.75,
              borderBottom:
                index !== items.length - 1
                  ? `1px solid ${alpha(theme.palette.divider, 0.08)}`
                  : "none",
              transition: "background-color 0.15s ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.action.hover, 0.06),
              },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              {item.label}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                minWidth: 0,
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "flex-start", sm: "flex-end" },
                textAlign: { xs: "left", sm: "right" },
              }}
            >
              {item.icon && (
                <item.icon
                  sx={{ fontSize: 18, color: "action.active", opacity: 0.75 }}
                />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.primary"
                sx={{ wordBreak: "break-word" }}
              >
                {item.value}
              </Typography>
            </Stack>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  // Composant pour l'onglet des séances
  const SeancesTabPanel = () => {
    const seancesConduite = profile?.seancesConduite ?? [];
    const hasCode = seancesData.length > 0;
    const hasConduite = seancesConduite.length > 0;

    const statutChip = (s) => {
      if (s.estAnnulee) return <Chip size="small" color="default" label="Annulée" />;
      if (s.present) return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Présent" />;
      if (new Date(s.dateSeance ?? s.date) > new Date()) return <Chip size="small" color="info" label="Planifiée" />;
      return <Chip size="small" color="error" label="Absent" />;
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* ── SÉANCES DE CODE ── */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Séances de Code (Théoriques)
        </Typography>
        {!hasCode ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3, mb: 4 }}>
            Aucune séance de code planifiée pour ce candidat.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, overflowX: "auto", mb: 5 }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Horaire</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Thème</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Présence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Commentaire du moniteur</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seancesData.map((seance) => {
                  // Trouver la presence du candidat dans cette séance de code
                  const rawSeance = (profile?.seancesCode ?? []).find(s => s.id === seance.id);
                  const presence = rawSeance?.presences?.find(p => p.candidatId === parseInt(id));
                  const note = presence?.noteProgression ?? "—";
                  const remarque = presence?.remarquesPedagogiques || "—";

                  return (
                    <TableRow
                      key={seance.id}
                      hover
                      sx={{
                        bgcolor: seance.estAnnulee
                          ? alpha(theme.palette.error.main, 0.05)
                          : "inherit",
                        opacity: seance.estAnnulee ? 0.7 : 1,
                      }}
                    >
                      <TableCell>{formatDateCalendar(seance.dateSeance)}</TableCell>
                      <TableCell>{seance.heureDebut?.substring(0, 5) || "—"}</TableCell>
                      <TableCell>
                        <Chip label={`${seance.dureeMinutes ?? seance.nombreHeures * 60} min`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{seance.theme || "—"}</TableCell>
                      <TableCell>{statutChip({ ...seance, dateSeance: seance.dateSeance })}</TableCell>
                      <TableCell>
                        {note !== "—" ? (
                          <Chip
                            label={`${note}/10`}
                            size="small"
                            color={note >= 7 ? "success" : note >= 4 ? "warning" : "error"}
                          />
                        ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" color={remarque === "—" ? "text.disabled" : "text.primary"} sx={{ fontStyle: remarque === "—" ? "italic" : "normal" }}>
                          {remarque}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ── SÉANCES DE CONDUITE ── */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Séances de Conduite (Pratiques)
        </Typography>
        {!hasConduite ? (
          <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
            Aucune séance de conduite planifiée pour ce candidat.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2, overflowX: "auto" }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Horaire</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Présence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Note progression</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remarques pédagogiques</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seancesConduite
                  .slice()
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((s) => {
                    const heureDebut = s.heureDebut
                      ? String(s.heureDebut).substring(0, 5)
                      : "—";
                    const heureFin = s.heureDebut
                      ? (() => {
                          const [h, m] = String(s.heureDebut).split(":").map(Number);
                          const totalMin = h * 60 + m + (s.dureeMinutes || 0);
                          return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
                        })()
                      : "—";
                    const typeLabel =
                      s.typeConduite === 1 ? "Circulation" : "Manœuvre";
                    const note = s.noteProgression;
                    const remarque = s.remarquesPedagogiques;

                    const chipStatus = () => {
                      if (s.estAnnulee) return <Chip size="small" color="default" label="Annulée" />;
                      if (s.present) return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Présent" />;
                      if (new Date(s.date) > new Date()) return <Chip size="small" color="info" label="Planifiée" />;
                      return <Chip size="small" color="error" label="Absent" />;
                    };

                    return (
                      <TableRow
                        key={s.id}
                        hover
                        sx={{
                          bgcolor: s.estAnnulee
                            ? alpha(theme.palette.error.main, 0.05)
                            : "inherit",
                          opacity: s.estAnnulee ? 0.7 : 1,
                        }}
                      >
                        <TableCell>{formatDateCalendar(s.date)}</TableCell>
                        <TableCell>{heureDebut} — {heureFin}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${s.dureeMinutes ?? 0} min`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeLabel}
                            size="small"
                            color={s.typeConduite === 1 ? "primary" : "secondary"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{chipStatus()}</TableCell>
                        <TableCell>
                          {note != null ? (
                            <Chip
                              label={`${note}/10`}
                              size="small"
                              color={note >= 7 ? "success" : note >= 4 ? "warning" : "error"}
                            />
                          ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography
                            variant="body2"
                            color={!remarque ? "text.disabled" : "text.primary"}
                            sx={{ fontStyle: !remarque ? "italic" : "normal" }}
                          >
                            {remarque || "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (profileError || !profile) {
    return (
      <Box sx={{ p: 3, maxWidth: 1400, margin: "auto" }}>
        <Alert severity="error">
          {profileError || "Impossible d'afficher ce candidat."}
        </Alert>
      </Box>
    );
  }

  const addr = adresse || {};
  const cpt = compte || {};

  const dateNaissanceRaw =
    profile.dateNaissance ?? profile.DateNaissance ?? null;
  const dateDelivranceCINRaw =
    profile.dateDelivranceCIN ?? profile.DateDelivranceCIN ?? null;

  const showNomEpoux = sexeNum !== Sexe.Homme;

  const photoPathRaw = profile.photoPath ?? profile.PhotoPath ?? null;
  const hasDatabasePhoto =
    photoPathRaw != null && String(photoPathRaw).trim() !== "";
  const avatarPhotoSrc = photoLoadError
    ? candidatPlaceholder
    : resolveCandidatPhotoSrc(photoPathRaw, candidatPlaceholder);

  const dateObtentionCodeRaw = profile?.contrat?.dateObtentionCode ?? null;
  const dateExpirationCodeStr = dateObtentionCodeRaw
    ? (() => {
        const d = new Date(dateObtentionCodeRaw);
        d.setMonth(d.getMonth() + 15);
        return formatDateCalendar(d.toISOString());
      })()
    : "—";

  const identiteItems = [
    {
      label: "Nom complet",
      value: `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim(),
    },
    ...(showNomEpoux
      ? [
          {
            label: "Nom d'époux",
            value: profile.nomEpoux || "—",
          },
        ]
      : []),
    {
      label: "Sexe",
      value: sexeLabel,
    },
    {
      label: "Date de naissance",
      value: formatDateCalendar(dateNaissanceRaw),
      icon: CakeIcon,
    },
    {
      label: "Lieu de naissance",
      value: profile.lieuDeNaissance || "—",
      icon: LocationIcon,
    },
    {
      label: "Date d'obtention code",
      value: formatDateCalendar(dateObtentionCodeRaw),
      icon: CalendarIcon,
    },
    {
      label: "Date d'expiration code",
      value: dateExpirationCodeStr,
      icon: CalendarIcon,
    },
  ];

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1400,
        margin: "auto",
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          color: "white",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={avatarPhotoSrc}
              alt={
                `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() ||
                "Candidat"
              }
              onError={() => {
                if (photoPathRaw) setPhotoLoadError(true);
              }}
              sx={{
                width: 100,
                height: 100,
                bgcolor: "white",
                color: "#1e3c72",
                fontSize: 40,
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "3px solid rgba(255,255,255,0.95)",
                borderRadius: hasDatabasePhoto ? 0 : "50%",
                "& img": { objectFit: "cover" },
              }}
            >
              {profile.prenom?.[0] ?? "?"}
              {profile.nom?.[0] ?? ""}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.prenom} {profile.nom}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              {showNomEpoux && profile.nomEpoux ? (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Époux(se): {profile.nomEpoux}
                </Typography>
              ) : null}
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                CIN: {profile.numeroCIN ?? "—"}
              </Typography>
              <Chip
                label={etatCompteDisplay.label}
                color={etatCompteDisplay.chipColor}
                size="small"
                sx={{
                  fontWeight: 500,
                  ...(etatCompteDisplay.chipColor === "default" && {
                    bgcolor: "rgba(255,255,255,0.28)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                  }),
                }}
              />
              {contratActif?.typePermisCode ? (
                <Chip
                  label={`Permis ${contratActif.typePermisCode}`}
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: "white", color: "white" }}
                />
              ) : null}

            </Stack>
          </Grid>
          <Grid item>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <CandidatPdfActions
                candidatId={id}
                contratId={contratActif?.id}
                forHeader
              />
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditDialogOpen(true)}
                sx={{
                  bgcolor: "white",
                  color: "#1e3c72",
                  "&:hover": { bgcolor: alpha("#fff", 0.9) },
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Modifier le profil
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes de statistiques utilisant les données de l'API */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total séances
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {seancesData.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 32, color: "primary.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Heures effectuées
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {totalHeures}h
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <DriveEtaIcon sx={{ fontSize: 32, color: "info.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total à payer
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {totalMontant} DT
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 32, color: "warning.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Reste à payer
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={totalReste > 0 ? "error.main" : "success.main"}
                  >
                    {totalReste} DT
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(totalReste > 0 ? "#f44336" : "#4caf50", 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <PendingIcon
                    sx={{
                      fontSize: 32,
                      color: totalReste > 0 ? "#f44336" : "#4caf50",
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            bgcolor: "white",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 56,
            },
          }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Informations personnelles"
          />
          <Tab
            icon={<DriveEtaIcon />}
            iconPosition="start"
            label="Séances & Suivi"
          />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Paiements" />
          <Tab icon={<ExamenIcon />} iconPosition="start" label="Examens" />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: alpha(
                theme.palette.grey[50],
                theme.palette.mode === "dark" ? 0.2 : 0.65,
              ),
              minHeight: 360,
            }}
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={PersonIcon}
                  title="Identité"
                  items={identiteItems}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={BadgeIcon}
                  title="Pièce d'identité"
                  items={[
                    {
                      label: "Numéro CIN",
                      value: profile.numeroCIN ?? "—",
                      icon: CreditCardIcon,
                    },
                    {
                      label: "Date de délivrance CIN",
                      value: formatDateCalendar(dateDelivranceCINRaw),
                      icon: CalendarIcon,
                    },
                  ]}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={PhoneIcon}
                  title="Coordonnées"
                  items={[
                    {
                      label: "Téléphone",
                      value: profile.telephone ?? "—",
                      icon: SmartphoneIcon,
                    },
                    {
                      label: "Email",
                      value: cpt.login ?? "—",
                      icon: MarkEmailReadIcon,
                    },
                  ]}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={HomeIcon}
                  title="Adresse"
                  items={[
                    {
                      label: "Adresse complète",
                      value:
                        typeof adresse === "string"
                          ? adresse
                          : (adresse?.rue ?? profile?.adresse ?? "—"),
                      icon: LocationIcon,
                    },
                  ]}
                />
              </Grid>

              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
                    boxShadow: `0 1px 2px ${alpha("#000", 0.04)}, 0 4px 24px ${alpha("#000", 0.04)}`,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      bgcolor: alpha(
                        theme.palette.grey[50],
                        theme.palette.mode === "dark" ? 0.15 : 1,
                      ),
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ letterSpacing: "-0.01em" }}
                    >
                      Formation & permis
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Grid container spacing={2}>
                      {[
                        {
                          IconCmp: DriveEtaIcon,
                          label: "Type de permis",
                          value: contratActif?.typePermisCode ?? "—",
                          valueVariant: "h5",
                        },
                        {
                          IconCmp: SchoolIcon,
                          label: "Type de formation",
                          value: formationLabel,
                          valueVariant: "body1",
                        },
                      ].map(({ IconCmp, label, value, valueVariant }) => (
                        <Grid item xs={12} md={4} key={label}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              height: "100%",
                              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                              bgcolor: alpha(
                                theme.palette.background.default,
                                0.5,
                              ),
                              transition:
                                "border-color 0.15s ease, box-shadow 0.15s ease",
                              "&:hover": {
                                borderColor: alpha(
                                  theme.palette.primary.main,
                                  0.22,
                                ),
                                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="flex-start"
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 1.25,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.08,
                                  ),
                                  color: "primary.main",
                                }}
                              >
                                <IconCmp sx={{ fontSize: 20 }} />
                              </Box>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    display: "block",
                                    mb: 0.75,
                                  }}
                                >
                                  {label}
                                </Typography>
                                <Typography
                                  variant={valueVariant}
                                  fontWeight={700}
                                  color="text.primary"
                                  sx={{
                                    lineHeight: 1.3,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {value}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <SeancesTabPanel />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            {profile?.tousLesContrats && profile.tousLesContrats.length > 0 ? (
              <PaiementSection
                tousContrats={profile.tousLesContrats}
                onPaiementAdded={refreshData}
              />
            ) : (
              <Alert severity="info">
                Aucun contrat trouvé pour ce candidat.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ p: 3 }}>
            {/* Information sur le type de formation */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Type de formation :</strong>{" "}
                {contratActif?.typeFormation === 0
                  ? "Code seulement"
                  : contratActif?.typeFormation === 1
                    ? "Conduite seulement"
                    : contratActif?.typeFormation === 2
                      ? "Formation complète"
                      : "Non défini"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Examens disponibles :</strong>{" "}
                {contratActif?.typeFormation === 0 && " Code"}
                {contratActif?.typeFormation === 1 &&
                  " Circulation • * Manœuvre"}
                {contratActif?.typeFormation === 2 &&
                  " Code •  Circulation •  Manœuvre"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Permis :</strong> {contratActif?.typePermisCode || "B"}
              </Typography>
            </Alert>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setExamenFormOpen(true)}
              >
                Programmer un examen
              </Button>
            </Box>

            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Examens à venir
            </Typography>

            <ExamensTable
              examens={examensAVenir}
              loading={examensLoading}
              onDownloadPdf={telechargerConvocation}
              onReport={handleOpenReportForm}
              onResult={handleOpenResultatForm}
            />

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Historique des examens
            </Typography>

            <ExamensTable
              examens={historiqueExamens}
              loading={examensLoading}
              onDownloadPdf={telechargerConvocation}
              onReport={handleOpenReportForm}
              onResult={handleOpenResultatForm}
              showReport={false}
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialogue de confirmation d'annulation */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette séance de code ?
            {selectedSeanceForCancel && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {formatDateCalendar(selectedSeanceForCancel.dateSeance)}
                </Typography>
                <Typography variant="body2">
                  <strong>Horaire:</strong>{" "}
                  {selectedSeanceForCancel.heureDebut?.substring(0, 5) || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Thème:</strong> {selectedSeanceForCancel.theme || "—"}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Non, annuler
          </Button>
          <Button
            onClick={confirmCancelSeance}
            color="error"
            variant="contained"
          >
            Oui, annuler la séance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogues pour les examens */}
      <ExamenForm
        open={examenFormOpen}
        onClose={() => setExamenFormOpen(false)}
        onSave={handleProgrammerExamen}
        contratId={profile.contrat?.id}
        typeExamen={selectedExamenType}
        contratActif={profile?.contrat}
      />

      <ResultatExamenForm
        open={resultatFormOpen}
        onClose={() => {
          setResultatFormOpen(false);
          setSelectedExamen(null);
        }}
        onSave={handleEnregistrerResultat}
        examenId={selectedExamen?.id}
        typeExamen={selectedExamen?.typeExamen}
        typePermisCode={profile.typePermisCode || "B"}
      />

      <ReportExamenForm
        open={reportFormOpen}
        onClose={() => {
          setReportFormOpen(false);
          setSelectedExamen(null);
        }}
        onSave={handleReporterExamen}
        examen={selectedExamen}
        examenId={selectedExamen?.id}
      />

      <EditCandidatDialog
        open={editDialogOpen && Boolean(candidatForEdit)}
        onClose={() => setEditDialogOpen(false)}
        candidat={candidatForEdit}
        onSave={handleSaveProfile}
        onUploadPhoto={uploadPhoto}
      />
    </Box>
  );
};

export default CandidatProfilePage;
