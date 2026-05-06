import { Box, Typography, Paper, LinearProgress, Grid, Stack } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const HoursCandidat = () => {
  const totalHours = 20;
  const completedHours = 12;
  const progress = (completedHours / totalHours) * 100;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Mes Heures
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)",
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Progression de conduite
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous avez effectué {completedHours} heures sur les {totalHours} prévues dans votre forfait.
                </Typography>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={700}>
                    {progress}% complété
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalHours - completedHours}h restantes
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: "rgba(0,0,0,0.05)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "white",
                border: "1px dashed",
                borderColor: "primary.main",
                textAlign: "center",
              }}
            >
              <AccessTimeOutlinedIcon
                sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h3" fontWeight={800} color="primary.main">
                {completedHours}h
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total effectué
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Détail des dernières heures (Optionnel) */}
      <Typography variant="h6" fontWeight={700} mb={3}>
        Dernières séances de conduite
      </Typography>
      {[1, 2, 3].map((item) => (
        <Paper
          key={item}
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={600}>Séance de conduite #{4 - item}</Typography>
            <Typography variant="body2" color="text.secondary">2 heures effectuées</Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
};

export default HoursCandidat;
