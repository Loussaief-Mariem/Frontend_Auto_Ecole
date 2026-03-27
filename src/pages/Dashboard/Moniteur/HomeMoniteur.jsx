import { Grid, Paper, Stack, Typography, Box, Chip } from "@mui/material";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";

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
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Dashboard Moniteur
            </Typography>
            <Typography color="text.secondary">
              Organisation des séances et progression des candidats.
            </Typography>
          </Box>
          <Chip icon={<DoneAllRoundedIcon />} color="primary" label="Journée planifiée" />
        </Stack>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card
          title="Séances aujourd'hui"
          value="6"
          subtitle="2 restantes"
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
            Planning du jour
          </Typography>
          <Stack spacing={1.25}>
            <Typography color="text.secondary">08:30 - Séance conduite avec Ahmed B.</Typography>
            <Typography color="text.secondary">10:15 - Séance code avec Lina S.</Typography>
            <Typography color="text.secondary">14:00 - Séance conduite avec Youssef K.</Typography>
            <Typography color="text.secondary">16:00 - Évaluation finale avec Hiba R.</Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeMoniteur;
