import { Grid, Paper, Stack, Typography, Box, Chip } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";

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

const HomeSecretaire = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Dashboard Secrétaire
            </Typography>
            <Typography color="text.secondary">
              Suivi des paiements, candidats et séances.
            </Typography>
            <DashboardUserMeta />
          </Box>
          <Chip icon={<TaskAltOutlinedIcon />} color="primary" label="Opérations à jour" />
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card
          title="Paiements aujourd'hui"
          value="18"
          subtitle="3 en attente"
          icon={<PaymentsOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Candidats actifs"
          value="142"
          subtitle="12 nouveaux cette semaine"
          icon={<SchoolOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Séances confirmées"
          value="34"
          subtitle="pour demain"
          icon={<EventAvailableOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Tâches prioritaires
          </Typography>
          <Stack spacing={1.25}>
            <Typography color="text.secondary">- Vérifier les paiements en retard.</Typography>
            <Typography color="text.secondary">- Finaliser les dossiers candidats incomplets.</Typography>
            <Typography color="text.secondary">- Confirmer les séances du week-end.</Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeSecretaire;
