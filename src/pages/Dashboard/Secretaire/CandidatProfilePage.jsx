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
} from "@mui/material";
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
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
} from "@mui/icons-material";
import useCandidatProfile from "../../../hooks/useCandidatProfile";
import EditCandidatDialog from "../../../components/common/Candidat/EditCandidatDialog";
import CandidatPdfActions from "../../../components/common/Candidat/CandidatPdfActions";
import api from "../../../api/axios";
import candidatPlaceholder from "../../../assets/candidat.jpg";
import {
  TypeDocument,
  StatutDocument,
  EtatDossier,
  TypeFormation,
  getEtatCompteDisplay,
  Sexe,
} from "../../../enums";

const LABEL_TYPE_DOCUMENT = {
  [TypeDocument.PhotoIdentite]: "Photo d'identité",
  [TypeDocument.CopieCIN]: "Copie CIN",
  [TypeDocument.CertificatMedical]: "Certificat médical",
};

const LABEL_STATUT_DOCUMENT = {
  [StatutDocument.Manquant]: "Manquant",
  [StatutDocument.Recu]: "Reçu",
};

const LABEL_ETAT_DOSSIER = {
  [EtatDossier.Incomplet]: "Incomplet",
  [EtatDossier.Complet]: "Complet",
  [EtatDossier.Annule]: "Annulé",
  [EtatDossier.Cloture]: "Clôturé",
};

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
    photoPath == null || photoPath === ""
      ? ""
      : String(photoPath).trim();
  if (!raw) return placeholder;
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = getApiOrigin();
  if (!origin) return placeholder;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

/** Données de démonstration pour l’onglet séances / paiements (non fournies par l’API profil). */
const SEANCES_STATIQUES_INIT = [
  {
    id: 1,
    dateSeance: "2024-01-15T10:00:00",
    nombreHeures: 2,
    montant: 120,
    resteAPayer: 0,
    statut: "Payée",
    moniteur: { nom: "Gharbi", prenom: "Mohamed" },
  },
  {
    id: 2,
    dateSeance: "2024-01-20T14:00:00",
    nombreHeures: 2,
    montant: 120,
    resteAPayer: 0,
    statut: "Payée",
    moniteur: { nom: "Gharbi", prenom: "Mohamed" },
  },
  {
    id: 3,
    dateSeance: "2024-01-25T09:00:00",
    nombreHeures: 2,
    montant: 120,
    resteAPayer: 60,
    statut: "Partielle",
    moniteur: { nom: "Mansour", prenom: "Ali" },
  },
  {
    id: 4,
    dateSeance: "2024-02-01T11:00:00",
    nombreHeures: 2,
    montant: 120,
    resteAPayer: 120,
    statut: "Non payée",
    moniteur: { nom: "Mansour", prenom: "Ali" },
  },
];

const CandidatProfilePage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const {
    profile,
    loading,
    error,
    contratActif,
    adresse,
    compte,
    dossierCandidat,
    documents,
    updateCandidat,
    uploadPhoto,
  } = useCandidatProfile(id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
      centreExamen: c?.centreExamen ?? profile.centreExamen ?? "",
    };
  }, [profile, contratActif]);

  const handleSaveProfile = useCallback(
    async (payload) => {
      await updateCandidat(payload);
    },
    [updateCandidat],
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const [editingSeanceId, setEditingSeanceId] = useState(null);
  const [editedSeance, setEditedSeance] = useState({});
  const [seances, setSeances] = useState(SEANCES_STATIQUES_INIT);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    setPhotoLoadError(false);
  }, [id]);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const handleEditSeance = (seance) => {
    setEditingSeanceId(seance.id);
    setEditedSeance(seance);
  };

  const handleSaveSeance = () => {
    setSeances((prev) =>
      prev.map((s) => (s.id === editedSeance.id ? { ...editedSeance } : s)),
    );
    setEditingSeanceId(null);
  };

  const totalMontant = seances.reduce((sum, s) => sum + s.montant, 0);
  const totalPaye = seances.reduce(
    (sum, s) => sum + (s.montant - s.resteAPayer),
    0,
  );
  const totalReste = seances.reduce((sum, s) => sum + s.resteAPayer, 0);

  const etatDossierLabel =
    dossierCandidat != null
      ? LABEL_ETAT_DOSSIER[dossierCandidat.etatDossier] ?? "—"
      : "—";

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
      ? LABEL_TYPE_FORMATION[contratActif.typeFormation] ??
        `Type ${contratActif.typeFormation}`
      : "—";

  /** Carte de section — style neutre et homogène (dashboard pro) */
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
          bgcolor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.15 : 1),
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

  if (error || !profile) {
    return (
      <Box sx={{ p: 3, maxWidth: 1400, margin: "auto" }}>
        <Alert severity="error">
          {error || "Impossible d’afficher ce candidat."}
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
              alt={`${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() || "Candidat"}
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
              <Chip
                label={`Dossier ${etatDossierLabel}`}
                size="small"
                sx={{ bgcolor: "#ff9800", color: "white" }}
              />
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
                    {seances.length}
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
                    {seances.reduce((sum, s) => sum + s.nombreHeures, 0)}h
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
                    Total payé
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {totalPaye} DT
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
                    color={totalReste > 0 ? "warning.main" : "success.main"}
                  >
                    {totalReste} DT
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: alpha(totalReste > 0 ? "#ff9800" : "#4caf50", 0.1),
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <PendingIcon
                    sx={{
                      fontSize: 32,
                      color: totalReste > 0 ? "#ff9800" : "#4caf50",
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
          <Tab icon={<DocumentIcon />} iconPosition="start" label="Documents" />
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Paiements" />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.2 : 0.65),
              minHeight: 360,
            }}
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoCard icon={PersonIcon} title="Identité" items={identiteItems} />
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
                      value: cpt.telephone ?? "—",
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
                      label: "Rue",
                      value: addr.rue ?? "—",
                      icon: LocationIcon,
                    },
                    {
                      label: "Ville",
                      value: addr.ville ?? "—",
                      icon: BusinessIcon,
                    },
                    {
                      label: "Gouvernorat",
                      value: addr.gouvernorat ?? "—",
                    },
                    { label: "Pays", value: addr.pays ?? "—" },
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
                        {
                          IconCmp: LocationIcon,
                          label: "Centre d'examen",
                          value: contratActif?.centreExamen?.trim()
                            ? contratActif.centreExamen
                            : "—",
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
                              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                              "&:hover": {
                                borderColor: alpha(
                                  theme.palette.primary.main,
                                  0.22,
                                ),
                                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
                              },
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="flex-start">
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
                    {dossierCandidat?.numDossier ? (
                      <Box
                        sx={{
                          mt: 2.5,
                          pt: 2.5,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          N° dossier :{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            fontWeight={700}
                            color="text.primary"
                          >
                            {dossierCandidat.numDossier}
                          </Typography>
                          {dossierCandidat.dateCreation
                            ? ` — créé le ${formatDateTime(dossierCandidat.dateCreation)}`
                            : ""}
                        </Typography>
                      </Box>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 3 }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Heures</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Moniteur</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reste</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seances.map((seance) => (
                    <TableRow key={seance.id} hover>
                      <TableCell>
                        {editingSeanceId === seance.id ? (
                          <TextField
                            type="date"
                            value={editedSeance.dateSeance?.split("T")[0] || ""}
                            onChange={(e) =>
                              setEditedSeance({
                                ...editedSeance,
                                dateSeance: e.target.value,
                              })
                            }
                            size="small"
                          />
                        ) : (
                          new Date(seance.dateSeance).toLocaleDateString(
                            "fr-TN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSeanceId === seance.id ? (
                          <TextField
                            type="number"
                            value={editedSeance.nombreHeures}
                            onChange={(e) =>
                              setEditedSeance({
                                ...editedSeance,
                                nombreHeures: parseInt(e.target.value, 10),
                              })
                            }
                            size="small"
                            sx={{ width: 80 }}
                          />
                        ) : (
                          <Chip
                            label={`${seance.nombreHeures}h`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#1976d2",
                              fontSize: 14,
                            }}
                          >
                            {seance.moniteur.prenom[0]}
                            {seance.moniteur.nom[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {seance.moniteur.prenom} {seance.moniteur.nom}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {editingSeanceId === seance.id ? (
                          <TextField
                            type="number"
                            value={editedSeance.montant}
                            onChange={(e) =>
                              setEditedSeance({
                                ...editedSeance,
                                montant: parseInt(e.target.value, 10),
                              })
                            }
                            size="small"
                            sx={{ width: 100 }}
                          />
                        ) : (
                          <Typography variant="body2" fontWeight="bold">
                            {seance.montant} DT
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={seance.resteAPayer > 0 ? "warning" : "success"}
                          label={`${seance.resteAPayer} DT`}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={
                            seance.statut === "Payée"
                              ? "success"
                              : seance.statut === "Partielle"
                                ? "warning"
                                : "error"
                          }
                          label={seance.statut}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {editingSeanceId === seance.id ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={handleSaveSeance}
                              color="primary"
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setEditingSeanceId(null)}
                              color="error"
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleEditSeance(seance)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            {documents.length === 0 ? (
              <Typography color="text.secondary">
                Aucun document enregistré pour ce dossier.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {documents.map((doc) => {
                  const typeLabel =
                    LABEL_TYPE_DOCUMENT[doc.typeDocument] ??
                    `Document (${doc.typeDocument})`;
                  const statutLabel =
                    LABEL_STATUT_DOCUMENT[doc.statutDocument] ?? "—";
                  const recu = doc.statutDocument === StatutDocument.Recu;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={doc.id}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          textAlign: "center",
                          p: 2,
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: 4,
                          },
                        }}
                      >
                        <DocumentIcon
                          sx={{
                            fontSize: 50,
                            color: recu ? "#4caf50" : "#ff9800",
                          }}
                        />
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ mt: 1 }}
                        >
                          {typeLabel}
                        </Typography>
                        <Chip
                          size="small"
                          color={recu ? "success" : "warning"}
                          label={statutLabel}
                          sx={{ mt: 1 }}
                        />
                        {doc.dateReception ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1 }}
                          >
                            Reçu le: {formatDateTime(doc.dateReception)}
                          </Typography>
                        ) : null}
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography variant="h6">Total à payer</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {totalMontant} DT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{ bgcolor: "#4caf50", color: "white", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography variant="h6">Total payé</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {totalPaye} DT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: totalReste > 0 ? "#ff9800" : "#4caf50",
                    color: "white",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Reste à payer</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {totalReste} DT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  fontWeight="bold"
                >
                  Historique des paiements
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell>Date séance</TableCell>
                        <TableCell>Montant total</TableCell>
                        <TableCell>Montant payé</TableCell>
                        <TableCell>Reste</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seances.map((seance) => (
                        <TableRow key={seance.id}>
                          <TableCell>
                            {new Date(seance.dateSeance).toLocaleDateString(
                              "fr-TN",
                            )}
                          </TableCell>
                          <TableCell>{seance.montant} DT</TableCell>
                          <TableCell>
                            {seance.montant - seance.resteAPayer} DT
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={
                                seance.resteAPayer > 0
                                  ? "warning.main"
                                  : "success.main"
                              }
                            >
                              {seance.resteAPayer} DT
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={
                                seance.statut === "Payée"
                                  ? "success"
                                  : "warning"
                              }
                              label={seance.statut}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

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
