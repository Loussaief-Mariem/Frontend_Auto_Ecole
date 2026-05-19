import { Link as RouterLink } from "react-router-dom";
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";
import { useAuth } from "../../../context/AuthContext";
import useDashboardStats from "../../../hooks/useDashboardStats";

// Palette bleue cohérente avec muiTheme.js
const BLUE = {
  900: "#1e3a8a",
  800: "#1e40af",
  700: "#1d4ed8",
  600: "#2563eb",
  500: "#3b82f6",
  100: "#dbeafe",
  50:  "#eff6ff",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, dark = false, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      height: "100%",
      border: "1px solid",
      borderColor: dark ? BLUE[700] : BLUE[100],
      bgcolor: dark ? BLUE[800] : BLUE[50],
      color: dark ? "#fff" : "text.primary",
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow .2s, transform .2s",
      "&:hover": {
        boxShadow: "0 8px 32px rgba(37,99,235,0.15)",
        transform: "translateY(-2px)",
      },
    }}
  >
    {/* Cercle décoratif */}
    <Box
      sx={{
        position: "absolute",
        top: -24,
        right: -24,
        width: 96,
        height: 96,
        borderRadius: "50%",
        bgcolor: dark ? "rgba(255,255,255,0.07)" : BLUE[100],
        pointerEvents: "none",
      }}
    />

    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ color: dark ? "rgba(255,255,255,0.75)" : "text.secondary" }}
        >
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={22} sx={{ mt: 0.75, color: dark ? "#fff" : BLUE[600] }} />
        ) : (
          <Typography
            variant="h4"
            fontWeight={800}
            lineHeight={1.1}
            mt={0.5}
            sx={{ color: dark ? "#fff" : BLUE[800] }}
          >
            {value}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: dark ? "rgba(255,255,255,0.15)" : BLUE[100],
          color: dark ? "#fff" : BLUE[700],
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Stack>

    {subtitle && (
      <Typography
        variant="caption"
        display="block"
        mt={1.25}
        sx={{ color: dark ? "rgba(255,255,255,0.6)" : "text.secondary" }}
      >
        {subtitle}
      </Typography>
    )}
  </Paper>
);

// ── Session row ───────────────────────────────────────────────────────────────
const SeanceRow = ({ session }) => {
  const isAnnulee  = session.estAnnulee;
  const isEffectuee = !isAnnulee && session.estEffectuee;
  const isPlanifiee = !isAnnulee && !isEffectuee;

  const borderColor = isAnnulee  ? "#ef4444"
                    : isEffectuee ? "#22c55e"
                    : BLUE[600];

  const timeboxBg  = isAnnulee  ? "#fef2f2"
                    : isEffectuee ? "#f0fdf4"
                    : BLUE[50];

  const timeColor  = isAnnulee  ? "#ef4444"
                    : isEffectuee ? "#16a34a"
                    : BLUE[700];

  const statusCfg = isAnnulee
    ? { label: "Annulée",  color: "error",   icon: <CancelRoundedIcon fontSize="small" />,        variant: "filled" }
    : isEffectuee
    ? { label: "Terminée", color: "success",  icon: <CheckCircleRoundedIcon fontSize="small" />,   variant: "filled" }
    : { label: "Planifiée",color: "primary",  icon: <ScheduleRoundedIcon fontSize="small" />,      variant: "outlined" };

  const typeEmoji =
    session.typeConduite === "Ville"      ? "🏙️"
    : session.typeConduite === "Route"    ? "🛣️"
    : session.typeConduite === "Autoroute"? "🛤️"
    : "🚗";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: `${borderColor}40`,
        borderLeft: "4px solid",
        borderLeftColor: borderColor,
        bgcolor: isAnnulee ? "#fef2f2" : "#fff",
        opacity: isAnnulee ? 0.75 : 1,
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: "0 4px 16px rgba(37,99,235,0.09)" },
      }}
    >
      {/* Bloc heure */}
      <Box
        sx={{
          minWidth: 68,
          textAlign: "center",
          py: 0.75,
          px: 1,
          borderRadius: 2,
          bgcolor: timeboxBg,
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" fontWeight={800} display="block" sx={{ color: timeColor }}>
          {session.heureDebut}
        </Typography>
        <Divider sx={{ my: 0.25, borderColor: `${timeColor}30` }} />
        <Typography variant="caption" display="block" sx={{ color: `${timeColor}99` }}>
          {session.heureFin}
        </Typography>
      </Box>

      {/* Candidat + type */}
      <Box flex={1} minWidth={0}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {session.candidatNom} {session.candidatPrenom}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {typeEmoji} {session.typeConduite}
        </Typography>
      </Box>

      {/* Statut */}
      <Chip
        icon={statusCfg.icon}
        label={statusCfg.label}
        size="small"
        color={statusCfg.color}
        variant={statusCfg.variant}
        sx={{ fontWeight: 600, flexShrink: 0 }}
      />
    </Box>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const HomeProprietaire = () => {
  const { user } = useAuth();
  const loading = false;
  const error = null;

  const todayLabel = format(new Date(), "EEEE dd MMMM yyyy", { locale: fr });

  // Beautiful static demo data
  const stats = {
    comptesActifs: 6,
    candidatsActifs: 142,
    seancesConduiteAujourdhui: 6,
    seancesCodeAujourdhui: 8,
    mesCandidatsAffectes: 18,
    revenuMensuel: 4850
  };

  const seancesToday = [
    { id: 1, heureDebut: "08:30", heureFin: "09:30", candidatNom: "Ben Ali", candidatPrenom: "Amine", typeConduite: "Ville", estEffectuee: true, estAnnulee: false },
    { id: 2, heureDebut: "10:00", heureFin: "11:30", candidatNom: "Tounsi", candidatPrenom: "Marwen", typeConduite: "Route", estEffectuee: true, estAnnulee: false },
    { id: 3, heureDebut: "14:00", heureFin: "15:30", candidatNom: "El Ouaer", candidatPrenom: "Rim", typeConduite: "Autoroute", estEffectuee: false, estAnnulee: false },
    { id: 4, heureDebut: "16:00", heureFin: "17:00", candidatNom: "Trabelsi", candidatPrenom: "Yassine", typeConduite: "Ville", estEffectuee: false, estAnnulee: false },
    { id: 5, heureDebut: "17:30", heureFin: "18:30", candidatNom: "Mansour", candidatPrenom: "Faten", typeConduite: "Ville", estEffectuee: false, estAnnulee: true }
  ];

  const nbPlanifiees = seancesToday.filter((s) => !s.estAnnulee && !s.estEffectuee).length;
  const nbTerminees = seancesToday.filter((s) => s.estEffectuee && !s.estAnnulee).length;

  return (
    <Grid container spacing={3}>
      {/* ── En-tête ──────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color={BLUE[900]}>
              Tableau de bord
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textTransform="capitalize"
              mt={0.25}
            >
              {todayLabel}
            </Typography>
            <DashboardUserMeta />
          </Box>


        </Stack>
      </Grid>

      {/* ── Erreur ───────────────────────────────────────────────────── */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* ── KPI — ligne 1 ────────────────────────────────────────────── */}
      <Grid item xs={12} sm={6} lg={2.4}>
        <StatCard
          loading={loading}
          dark
          title="Comptes actifs"
          value={stats.comptesActifs}
          subtitle="Moniteurs + secrétaires"
          icon={<Groups2OutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <StatCard
          loading={loading}
          title="Candidats actifs"
          value={stats.candidatsActifs}
          subtitle="Contrats en cours"
          icon={<PeopleAltOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <StatCard
          loading={loading}
          title="Mes candidats affectés"
          value={stats.mesCandidatsAffectes}
          subtitle="Affectation personnelle"
          icon={<SchoolOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <StatCard
          loading={loading}
          title="Séances conduite"
          value={stats.seancesConduiteAujourdhui}
          subtitle="Planifiées aujourd'hui"
          icon={<DirectionsCarOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <StatCard
          loading={loading}
          title="Séances code"
          value={stats.seancesCodeAujourdhui}
          subtitle="Planifiées aujourd'hui"
          icon={<MenuBookOutlinedIcon />}
        />
      </Grid>

      {/* ── Planning du propriétaire ──────────────────────────────────── */}
      <Grid item xs={12} md={8}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: BLUE[100],
            height: "100%",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={2}
            spacing={1}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: BLUE[100],
                  display: "grid",
                  placeItems: "center",
                  color: BLUE[700],
                }}
              >
                <DirectionsCarOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color={BLUE[900]}>
                  Mes séances de conduite
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(), "dd MMMM yyyy", { locale: fr })}
                </Typography>
              </Box>
            </Stack>

            {!loading && seancesToday.length > 0 && (
              <Stack direction="row" spacing={1}>
                {nbPlanifiees > 0 && (
                  <Chip
                    icon={<ScheduleRoundedIcon />}
                    label={`${nbPlanifiees} planifiée${nbPlanifiees > 1 ? "s" : ""}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {nbTerminees > 0 && (
                  <Chip
                    icon={<CheckCircleRoundedIcon />}
                    label={`${nbTerminees} terminée${nbTerminees > 1 ? "s" : ""}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Stack>

          <Divider sx={{ mb: 2, borderColor: BLUE[100] }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: BLUE[600] }} />
            </Box>
          ) : seancesToday.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                borderRadius: 2.5,
                bgcolor: BLUE[50],
                border: "1px dashed",
                borderColor: BLUE[100],
              }}
            >
              <AccessTimeRoundedIcon sx={{ fontSize: 44, color: BLUE[200] ?? "#bfdbfe", mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} color={BLUE[800]}>
                Aucune séance prévue aujourd'hui
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Votre planning est libre pour cette journée.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {seancesToday.map((s) => (
                <SeanceRow key={s.id} session={s} />
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>

      {/* ── Revenu mensuel ────────────────────────────────────────────── */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: BLUE[100],
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
          }}
        >
          {/* Revenu */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: BLUE[100],
                  display: "grid",
                  placeItems: "center",
                  color: BLUE[700],
                }}
              >
                <PriceChangeOutlinedIcon />
              </Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                Revenu ce mois
              </Typography>
            </Stack>
            {loading ? (
              <CircularProgress size={24} sx={{ color: BLUE[600] }} />
            ) : (
              <Typography variant="h5" fontWeight={800} color={BLUE[800]}>
                {Number(stats?.revenuMensuel ?? 0).toLocaleString("fr-TN")}{" "}
                <Typography component="span" variant="body1" fontWeight={600} color="text.secondary">
                  TND
                </Typography>
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: BLUE[100] }} />

          {/* Total séances */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: BLUE[100],
                  display: "grid",
                  placeItems: "center",
                  color: BLUE[700],
                }}
              >
                <EventAvailableOutlinedIcon />
              </Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                Total séances aujourd'hui
              </Typography>
            </Stack>
            {loading ? (
              <CircularProgress size={24} sx={{ color: BLUE[600] }} />
            ) : (
              <Typography variant="h5" fontWeight={800} color={BLUE[800]}>
                {(stats?.seancesConduiteAujourdhui ?? 0) + (stats?.seancesCodeAujourdhui ?? 0)}
              </Typography>
            )}
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                size="small"
                icon={<DirectionsCarOutlinedIcon />}
                label={`${stats?.seancesConduiteAujourdhui ?? 0} conduite`}
                sx={{ bgcolor: BLUE[50], color: BLUE[700], borderColor: BLUE[100], border: "1px solid" }}
              />
              <Chip
                size="small"
                icon={<MenuBookOutlinedIcon />}
                label={`${stats?.seancesCodeAujourdhui ?? 0} code`}
                sx={{ bgcolor: BLUE[50], color: BLUE[700], borderColor: BLUE[100], border: "1px solid" }}
              />
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeProprietaire;
