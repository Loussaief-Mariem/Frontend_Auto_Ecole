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
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

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
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
const HomeProprietaire = () => {
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
          title="Séances cette semaine"
          value="126"
          icon={<EventAvailableOutlinedIcon />}
          hint="+9% vs semaine dernière"
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
            Avancement des objectifs
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gestion des comptes
              </Typography>
              <LinearProgress
                variant="determinate"
                value={76}
                sx={{ height: 8, borderRadius: 10 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Planification des séances
              </Typography>
              <LinearProgress
                variant="determinate"
                value={88}
                sx={{ height: 8, borderRadius: 10 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gestion des tarifs
              </Typography>
              <LinearProgress
                variant="determinate"
                value={64}
                sx={{ height: 8, borderRadius: 10 }}
              />
            </Box>
          </Stack>
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
