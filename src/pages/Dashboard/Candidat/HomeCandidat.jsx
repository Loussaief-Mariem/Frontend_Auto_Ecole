import { Box, Grid, Paper, Typography, Stack, Avatar } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useAuth } from "../../../context/AuthContext";
import { getAuthDisplayName } from "../../../utils/dashboardUserLabels";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Avatar
      sx={{
        bgcolor: `${color}15`,
        color: color,
        width: 56,
        height: 56,
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const HomeCandidat = () => {
  const { user } = useAuth();
  const displayName = getAuthDisplayName(user);
  const firstName = displayName.split(/\s+/).filter(Boolean)[0] || "Candidat";

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          Bonjour, {firstName} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre progression et de vos prochaines étapes.
        </Typography>
        <DashboardUserMeta />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Séances à venir"
            value="3 Séances"
            icon={<CalendarMonthOutlinedIcon fontSize="large" />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Heures de conduite"
            value="12h / 20h"
            icon={<AccessTimeOutlinedIcon fontSize="large" />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Prochain examen"
            value="15 Mai 2026"
            icon={<AssignmentOutlinedIcon fontSize="large" />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Section interactive optionnelle ou infos supplémentaires */}
      <Box sx={{ mt: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: "primary.main",
            color: "white",
            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          }}
        >
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Prêt pour votre prochaine leçon ?
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, maxWidth: 600 }}>
            N'oubliez pas de réviser votre code de la route avant chaque séance théorique. 
            La régularité est la clé de votre succès !
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomeCandidat;
