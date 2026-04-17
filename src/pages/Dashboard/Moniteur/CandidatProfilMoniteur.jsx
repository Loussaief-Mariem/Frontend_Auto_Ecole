// src/pages/Dashboard/Moniteur/CandidatProfilMoniteur.jsx
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
  Divider,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  DriveEta as DriveEtaIcon,
  Cake as CakeIcon,
  Smartphone as SmartphoneIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Comment as CommentIcon,
  EventNote as EventIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import {
  getPlanningMoniteur,
  planifierSeanceConduite,
  marquerPresence,
  ajouterRemarque,
  annulerSeanceConduite,
} from "../../../api/seanceConduiteService";
import { getCandidatProfile } from "../../../api/candidatService";
import SeanceConduiteForm from "../../../components/common/seances/SeanceConduiteForm";
import candidatPlaceholder from "../../../assets/candidat.jpg";
import {
  getEtatCompteDisplay,
  Sexe,
  TYPE_CONDUITE_LABELS,
} from "../../../enums";

/** Date formatage simple */
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("fr-TN");
};

function getApiOrigin() {
  const base = api.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/i, "") || "";
}

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

/** Moyenne des notes */
const calculerMoyenneNotes = (seances) => {
  const seancesAvecNote = seances.filter(
    (s) => s.noteProgression && s.noteProgression > 0,
  );
  if (seancesAvecNote.length === 0) return 0;
  const somme = seancesAvecNote.reduce((acc, s) => acc + s.noteProgression, 0);
  return (somme / seancesAvecNote.length).toFixed(1);
};

/** Dernière remarque */
const getDerniereRemarque = (seances) => {
  const seancesAvecRemarque = seances.filter((s) => s.remarquesPedagogiques);
  if (seancesAvecRemarque.length === 0) return null;
  return seancesAvecRemarque[seancesAvecRemarque.length - 1];
};

const CandidatProfilMoniteur = () => {
  const theme = useTheme();
  const { id } = useParams();
  const { user } = useAuth();
  //console.log("MoniteurProfilCandidat - id:", id, "user:", user);

  const [candidat, setCandidat] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // États pour l'édition des séances
  const [editingSeanceId, setEditingSeanceId] = useState(null);
  const [editedSeance, setEditedSeance] = useState({});

  // États pour les dialogues
  const [openPlanifierForm, setOpenPlanifierForm] = useState(false);
  const [openRemarqueDialog, setOpenRemarqueDialog] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [remarqueText, setRemarqueText] = useState("");
  const [noteValue, setNoteValue] = useState(0);
  const [planificationLoading, setPlanificationLoading] = useState(false);

  // Charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Charger les infos du candidat
      const candidatData = await getCandidatProfile(id);
      setCandidat(candidatData);

      // Charger les séances de ce candidat (via le moniteur)
      console.log("MoniteurProfilCandidat - user:", user);
      const seancesData = await getPlanningMoniteur(user.user.id);
      const seancesCandidat = seancesData.filter(
        (s) => s.candidatId === parseInt(id),
      );
      setSeances(seancesCandidat);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des données",
      );
    } finally {
      setLoading(false);
    }
  }, [id, user?.moniteurId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistiques
  const stats = useMemo(() => {
    const totalSeances = seances.length;
    const seancesPresent = seances.filter((s) => s.present).length;
    const seancesAbsent = seances.filter((s) => s.present === false).length;
    const seancesAnnulees = seances.filter((s) => s.estAnnulee).length;
    const seancesAvecNote = seances.filter((s) => s.noteProgression > 0).length;
    const moyenneNotes = calculerMoyenneNotes(seances);
    const derniereRemarque = getDerniereRemarque(seances);

    return {
      totalSeances,
      seancesPresent,
      seancesAbsent,
      seancesAnnulees,
      seancesAvecNote,
      moyenneNotes,
      derniereRemarque,
    };
  }, [seances]);

  // Gestion des séances
  const handleMarquerPresence = async (seanceId, present) => {
    try {
      await marquerPresence(seanceId, present);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du marquage");
    }
  };

  const handleAjouterRemarque = async () => {
    if (!selectedSeance) return;
    try {
      await ajouterRemarque(selectedSeance.id, remarqueText, noteValue);
      setOpenRemarqueDialog(false);
      setSelectedSeance(null);
      setRemarqueText("");
      setNoteValue(0);
      await loadData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Erreur lors de l'ajout de la remarque",
      );
    }
  };

  const handleAnnulerSeance = async (seanceId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette séance ?")) {
      try {
        await annulerSeanceConduite(seanceId);
        await loadData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de l'annulation");
      }
    }
  };

  const handlePlanifierSeance = async (data) => {
    setPlanificationLoading(true);
    try {
      await planifierSeanceConduite({
        ...data,
        candidatId: parseInt(id),
        moniteurId: user?.moniteurId,
      });
      setOpenPlanifierForm(false);
      await loadData();
      alert("Séance planifiée avec succès !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la planification");
    } finally {
      setPlanificationLoading(false);
    }
  };

  // Onglets
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // Carte d'information
  const InfoCard = ({ icon: Icon, title, items }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
        bgcolor: "background.paper",
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
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2.5,
              py: 1.75,
              borderBottom:
                index !== items.length - 1
                  ? `1px solid ${alpha(theme.palette.divider, 0.08)}`
                  : "none",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !candidat) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Candidat non trouvé"}</Alert>
      </Box>
    );
  }

  const compte = candidat.compte ?? candidat.Compte ?? {};
  const adresse = candidat.adresse ?? candidat.Adresse ?? {};
  const etatCompteDisplay = getEtatCompteDisplay(compte);
  const sexeNum = candidat.sexe;
  const showNomEpoux = sexeNum !== Sexe.Homme;
  const photoPathRaw = candidat.photoPath ?? candidat.PhotoPath ?? null;
  const avatarPhotoSrc = resolveCandidatPhotoSrc(photoPathRaw, candidatPlaceholder);

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
      {/* En-tête */}
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
              alt={`${candidat.prenom || ""} ${candidat.nom || ""}`}
              sx={{
                width: 100,
                height: 100,
                bgcolor: "white",
                color: "#1e3c72",
                fontSize: 40,
                fontWeight: "bold",
                border: "3px solid rgba(255,255,255,0.95)",
              }}
            >
              {candidat.prenom?.[0] ?? "?"}
              {candidat.nom?.[0] ?? ""}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {candidat.prenom} {candidat.nom}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              {showNomEpoux && candidat.nomEpoux && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Époux(se): {candidat.nomEpoux}
                </Typography>
              )}
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                CIN: {candidat.numeroCIN ?? "—"}
              </Typography>
              <Chip
                label={etatCompteDisplay.label}
                color={etatCompteDisplay.chipColor}
                size="small"
              />
              <Chip
                label={`${stats.totalSeances} séances`}
                variant="outlined"
                size="small"
                sx={{ borderColor: "white", color: "white" }}
              />
              {stats.moyenneNotes > 0 && (
                <Chip
                  label={`Moyenne: ${stats.moyenneNotes}/10`}
                  size="small"
                  sx={{ bgcolor: "#4caf50", color: "white" }}
                />
              )}
            </Stack>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenPlanifierForm(true)}
              sx={{
                bgcolor: "white",
                color: "#1e3c72",
                "&:hover": { bgcolor: alpha("#fff", 0.9) },
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Planifier séance
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total séances
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {stats.totalSeances}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <DriveEtaIcon sx={{ fontSize: 32, color: "primary.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Présences
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {stats.seancesPresent}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <CheckCircleIcon
                    sx={{ fontSize: 32, color: "success.main" }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Absences
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {stats.seancesAbsent}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <PendingIcon sx={{ fontSize: 32, color: "error.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Moyenne générale
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {stats.moyenneNotes}/10
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 32, color: "warning.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            bgcolor: "white",
          }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Informations"
          />
          <Tab
            icon={<DriveEtaIcon />}
            iconPosition="start"
            label="Séances de conduite"
          />
          <Tab
            icon={<SchoolIcon />}
            iconPosition="start"
            label="Suivi pédagogique"
          />
        </Tabs>

        {/* Onglet Informations */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.grey[50], 0.65) }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={PersonIcon}
                  title="Identité"
                  items={[
                    {
                      label: "Nom complet",
                      value: `${candidat.prenom || ""} ${candidat.nom || ""}`,
                    },
                    ...(showNomEpoux
                      ? [
                          {
                            label: "Nom d'époux",
                            value: candidat.nomEpoux || "—",
                          },
                        ]
                      : []),
                    {
                      label: "Sexe",
                      value: sexeNum === Sexe.Homme ? "Masculin" : "Féminin",
                    },
                    {
                      label: "Date de naissance",
                      value: formatDate(candidat.dateNaissance),
                    },
                    {
                      label: "Lieu de naissance",
                      value: candidat.lieuDeNaissance || "—",
                    },
                    {
                      label: "Numéro CIN",
                      value: candidat.numeroCIN || "—",
                    },
                    {
                      label: "Date délivrance CIN",
                      value: formatDate(candidat.dateDelivranceCIN),
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
                      value: compte.telephone || "—",
                      icon: SmartphoneIcon,
                    },
                    {
                      label: "Email",
                      value: compte.login || "—",
                      icon: MarkEmailReadIcon,
                    },
                    { label: "Adresse", value: adresse.rue || "—" },
                    { label: "Ville", value: adresse.ville || "—" },
                    {
                      label: "Gouvernorat",
                      value: adresse.gouvernorat || "—",
                    },
                  ]}
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Onglet Séances de conduite */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 3 }}>
            {seances.length === 0 ? (
              <Alert severity="info">
                Aucune séance planifiée pour ce candidat.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Heure</TableCell>
                      <TableCell>Durée</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Présence</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seances.map((seance) => (
                      <TableRow key={seance.id} hover>
                        <TableCell>{formatDate(seance.date)}</TableCell>
                        <TableCell>{seance.heureDebut}</TableCell>
                        <TableCell>{seance.dureeMinutes} min</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              TYPE_CONDUITE_LABELS[seance.typeConduite]
                                ?.label || "—"
                            }
                            color={
                              TYPE_CONDUITE_LABELS[seance.typeConduite]
                                ?.color || "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {seance.estAnnulee ? (
                            <Chip size="small" color="error" label="Annulée" />
                          ) : seance.present ? (
                            <Chip
                              size="small"
                              color="success"
                              label="Présent"
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() =>
                                handleMarquerPresence(seance.id, true)
                              }
                            >
                              Marquer présent
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {seance.noteProgression > 0 ? (
                            <Chip
                              label={`${seance.noteProgression}/10`}
                              color="primary"
                              size="small"
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedSeance(seance);
                              setRemarqueText(
                                seance.remarquesPedagogiques || "",
                              );
                              setNoteValue(seance.noteProgression || 0);
                              setOpenRemarqueDialog(true);
                            }}
                            title="Ajouter remarque"
                          >
                            <CommentIcon />
                          </IconButton>
                          {!seance.estAnnulee && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAnnulerSeance(seance.id)}
                              title="Annuler"
                            >
                              <CancelIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* Onglet Suivi pédagogique */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Graphique d'évolution des notes */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="primary"
                      fontWeight="bold"
                    >
                      Évolution des notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {seances.filter((s) => s.noteProgression > 0).length ===
                    0 ? (
                      <Typography color="text.secondary">
                        Aucune note enregistrée
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Note</TableCell>
                              <TableCell>Remarque</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {seances
                              .filter(
                                (s) =>
                                  s.noteProgression > 0 ||
                                  s.remarquesPedagogiques,
                              )
                              .map((seance) => (
                                <TableRow key={seance.id}>
                                  <TableCell>
                                    {formatDate(seance.date)}
                                  </TableCell>
                                  <TableCell>
                                    {TYPE_CONDUITE_LABELS[seance.typeConduite]
                                      ?.label || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {seance.noteProgression > 0 ? (
                                      <Chip
                                        label={`${seance.noteProgression}/10`}
                                        color="primary"
                                        size="small"
                                      />
                                    ) : (
                                      "—"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {seance.remarquesPedagogiques || "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Dernière remarque */}
              {stats.derniereRemarque && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="info.main"
                        gutterBottom
                      >
                        Dernière remarque pédagogique
                      </Typography>
                      <Typography variant="body2">
                        {stats.derniereRemarque.remarquesPedagogiques}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {formatDateTime(stats.derniereRemarque.date)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialogue pour planifier une séance */}
      <SeanceConduiteForm
        open={openPlanifierForm}
        onClose={() => setOpenPlanifierForm(false)}
        onSubmit={handlePlanifierSeance}
        moniteurs={[
          { id: user?.moniteurId, prenom: user?.prenom, nom: user?.nom },
        ]}
        candidats={[candidat]}
        initialData={{ candidatId: parseInt(id) }}
        loading={planificationLoading}
      />

      {/* Dialogue pour ajouter remarque */}
      <Dialog
        open={openRemarqueDialog}
        onClose={() => setOpenRemarqueDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter une remarque pédagogique</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarques"
            value={remarqueText}
            onChange={(e) => setRemarqueText(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <Typography component="legend">Note de progression (0-10)</Typography>
          <Rating
            value={noteValue}
            onChange={(e, newValue) => setNoteValue(newValue || 0)}
            max={10}
            size="large"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Valeur actuelle: {noteValue}/10
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemarqueDialog(false)}>Annuler</Button>
          <Button onClick={handleAjouterRemarque} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidatProfilMoniteur;
