import { Link as RouterLink } from "react-router-dom";
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";
import { useAuth } from "../../../context/AuthContext";
import { getPlanningMoniteurByDate } from "../../../api/seanceConduiteService";
import { format } from "date-fns";

const StatCard = ({ title, value, icon, hint }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: "primary.50",
        }}
      >
        {icon}
      </Box>
    </Stack>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mt: 1, display: "block" }}
    >
      {hint}
    </Typography>
  </Paper>
);

const HomeProprietaire = () => {
  const { user } = useAuth();
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodaySessions = async () => {
      try {
        const moniteurId = user?.id; // Assuming owner can also be a monitor or we fetch for the owner's related monitors
        if (!moniteurId) return;

        const today = format(new Date(), "yyyy-MM-dd");
        const data = await getPlanningMoniteurByDate(moniteurId, today);
        setTodaySessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Erreur lors de la récupération des séances.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySessions();
  }, [user]);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Dashboard Propriétaire
            </Typography>
            <Typography color="text.secondary">
              Vue globale de votre auto-école AutoPilot.
            </Typography>
            <DashboardUserMeta />
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Button
              component={RouterLink}
              to="/dashboard/proprietaire/profile"
              variant="outlined"
              color="primary"
              startIcon={<PersonOutlineIcon />}
            >
              Mon profil
            </Button>
            <Chip
              icon={<TrendingUpRoundedIcon />}
              color="primary"
              label="Performance +12%"
            />
          </Stack>
        </Stack>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Comptes actifs"
          value="48"
          icon={<Groups2OutlinedIcon />}
          hint="Moniteurs + secrétaires"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Séances aujourd'hui"
          value={todaySessions.length}
          icon={<EventAvailableOutlinedIcon />}
          hint={`${todaySessions.filter((s) => !s.estEffectuee).length} séances restantes`}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Revenu mensuel"
          value="24 500 TND"
          icon={<PriceChangeOutlinedIcon />}
          hint="Objectif mensuel en cours"
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Occupation planning"
          value="82%"
          icon={<CalendarMonthOutlinedIcon />}
          hint="Créneaux optimisés"
        />
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Séances de conduite aujourd'hui ({format(new Date(), "dd/MM/yyyy")})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : todaySessions.length === 0 ? (
            <Typography color="text.secondary">
              Aucune séance de conduite prévue pour aujourd'hui.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {todaySessions.map((session) => (
                <Box
                  key={session.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: session.estAnnulee
                      ? "action.hover"
                      : "background.default",
                    borderLeft: "4px solid",
                    borderColor: session.estAnnulee
                      ? "error.main"
                      : session.estEffectuee
                        ? "success.main"
                        : "primary.main",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {session.heureDebut.substring(0, 5)} -{" "}
                        {session.heureFin.substring(0, 5)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Candidat:{" "}
                        <strong>
                          {session.candidatNom} {session.candidatPrenom}
                        </strong>
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        session.estAnnulee
                          ? "Annulée"
                          : session.estEffectuee
                            ? "Terminée"
                            : "En cours"
                      }
                      size="small"
                      color={
                        session.estAnnulee
                          ? "error"
                          : session.estEffectuee
                            ? "success"
                            : "primary"
                      }
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Alertes rapides
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              - 3 paiements en attente de validation.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - 2 moniteurs sans planning demain.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - 5 candidats proches de l’examen final.
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeProprietaire;
