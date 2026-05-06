import {
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";
import { useAuth } from "../../../context/AuthContext";
import { getPlanningMoniteurByDate } from "../../../api/seanceConduiteService";
import { format } from "date-fns";

const Card = ({ title, value, subtitle, icon }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 8px 20px rgba(37,99,235,0.08)",
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
      <Box sx={{ color: "primary.main" }}>{icon}</Box>
    </Stack>
    <Typography variant="caption" color="text.secondary">
      {subtitle}
    </Typography>
  </Paper>
);

const HomeMoniteur = () => {
  const { user } = useAuth();
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodaySessions = async () => {
      try {
        // Use user.id which is the moniteur ID
        const moniteurId = user?.id;
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
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Dashboard Moniteur
            </Typography>
            <Typography color="text.secondary">
              Organisation des séances et progression des candidats.
            </Typography>
            <DashboardUserMeta />
          </Box>
          <Chip
            icon={<DoneAllRoundedIcon />}
            color="primary"
            label="Journée planifiée"
          />
        </Stack>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Séances aujourd'hui"
          value={todaySessions.length}
          subtitle={`${todaySessions.filter((s) => !s.estEffectuee && !s.estAnnulee).length} restantes`}
          icon={<EventNoteOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Temps moyen/séance"
          value="1h 20"
          subtitle="ce mois"
          icon={<AccessTimeOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Candidats suivis"
          value="24"
          subtitle="4 proches de l'examen"
          icon={<SchoolOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Planning du jour ({format(new Date(), "dd/MM/yyyy")})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : todaySessions.length === 0 ? (
            <Typography color="text.secondary">
              Aucune séance prévue pour aujourd'hui.
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
                    opacity: session.estAnnulee ? 0.7 : 1,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color={
                          session.estAnnulee ? "text.disabled" : "text.primary"
                        }
                      >
                        {session.heureDebut.substring(0, 5)} -{" "}
                        {session.heureFin.substring(0, 5)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Séance conduite avec{" "}
                        <strong>
                          {session.candidatNom} {session.candidatPrenom}
                        </strong>
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {session.estAnnulee && (
                        <Chip
                          label="Annulée"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {session.estEffectuee && (
                        <Chip
                          label="Terminée"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {!session.estAnnulee && !session.estEffectuee && (
                        <Chip
                          label="À venir"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeMoniteur;
