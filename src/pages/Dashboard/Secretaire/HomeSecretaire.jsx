import { Grid, Paper, Stack, Typography, Box, Chip, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";

// Harmonized BLUE palette matching the Proprietor style
const BLUE = {
  900: "#1e3a8a",
  800: "#1e40af",
  700: "#1d4ed8",
  600: "#2563eb",
  500: "#3b82f6",
  100: "#dbeafe",
  50:  "#eff6ff",
};

// Unified premium StatCard component
const StatCard = ({ title, value, subtitle, icon, dark = false }) => (
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
    {/* Decorative circle */}
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
      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ color: dark ? "rgba(255,255,255,0.75)" : "text.secondary" }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          lineHeight={1.1}
          mt={0.5}
          sx={{ color: dark ? "#fff" : BLUE[800] }}
        >
          {value}
        </Typography>
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
          zIndex: 1,
        }}
      >
        {icon}
      </Box>
    </Stack>

    {subtitle && (
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          color: dark ? "rgba(255,255,255,0.6)" : "text.secondary",
          fontWeight: 500,
          zIndex: 1,
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const HomeSecretaire = () => {
  const [tabValue, setTabValue] = useState(0);

  // Beautiful static demo data
  const stats = {
    paiementsAujourdhuiMontant: "1 450",
    paiementsAujourdhuiCount: 8,
    contratsNonSoldesCount: 3,
    candidatsActifsCount: 142,
    candidatsNouveauxCetteSemaine: 12,
    seancesAujourdhui: 8,
    examensProgrammes: 18
  };

  const todaySessions = [
    { id: 1, type: "Code", heureDebut: "09:00", heureFin: "10:30", titre: "Séance de Code - Règles de priorité", moniteur: "Khelil Hammami", statut: "Terminée", color: "success" },
    { id: 3, type: "Code", heureDebut: "14:00", heureFin: "15:30", titre: "Séance de Code - Examen Blanc", moniteur: "Khelil Hammami", statut: "Planifiée", color: "primary" }
  ];

  const tomorrowSessions = [
    { id: 10, type: "Code", heureDebut: "09:30", heureFin: "11:00", titre: "Séance de Code - Signalisation Routière", moniteur: "Khelil Hammami", statut: "Planifiée", color: "primary" },
    { id: 11, type: "Code", heureDebut: "15:00", heureFin: "16:30", titre: "Séance de Code - Croisement et Dépassement", moniteur: "Khelil Hammami", statut: "Planifiée", color: "primary" }
  ];

  const activeSessions = tabValue === 0 ? todaySessions : tomorrowSessions;

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} color={BLUE[900]}>
              Tableau de bord
            </Typography>
            <Typography color="text.secondary" variant="body2" mt={0.25}>
              Suivi et gestion des candidats, paiements et séances.
            </Typography>
            <DashboardUserMeta />
          </Box>
        </Stack>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Candidats actifs"
          value={stats.candidatsActifsCount}
          subtitle={`${stats.candidatsNouveauxCetteSemaine} nouveaux inscrits cette semaine`}
          icon={<SchoolOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Séances aujourd'hui"
          value={stats.seancesAujourdhui}
          subtitle="Séances de code aujourd'hui"
          icon={<EventAvailableOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          dark
          title="Examens programmés"
          value={stats.examensProgrammes}
          subtitle="6 théoriques, 12 pratiques"
          icon={<AssignmentTurnedInOutlinedIcon />}
        />
      </Grid>

      {/* Modern 8 / 4 Grid with interactive Today / Tomorrow Tabs */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid", borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                Planning des cours
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Séances de code théorique programmées
              </Typography>
            </Box>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mt: { xs: 1, sm: 0 } }}>
              <Tab label="Aujourd'hui" sx={{ fontWeight: 700 }} />
              <Tab label="Demain" sx={{ fontWeight: 700 }} />
            </Tabs>
          </Stack>

          <Stack spacing={2}>
            {activeSessions.map((session) => (
              <Box
                key={session.id}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderLeft: "5px solid",
                  borderLeftColor: `${session.color}.main`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover",
                    transform: "translateX(4px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip label={session.type} size="small" color={session.color} variant="outlined" sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {session.heureDebut} - {session.heureFin}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {session.titre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moniteur : <strong>{session.moniteur}</strong>
                    </Typography>
                  </Box>
                  <Chip label={session.statut} size="small" color={session.color} sx={{ fontWeight: 600 }} />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">
            Détails des examens
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            Sessions d'examens prévues pour ce mois
          </Typography>
          
          <Stack spacing={2.5}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "info.lighter", border: "1px solid", borderColor: "info.border" }}>
              <Typography variant="subtitle2" color="info.dark" fontWeight={800}>
                ✍ EXAMEN THÉORIQUE (CODE)
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }} color="info.dark">
                6 Candidats
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Moniteur responsable : <strong>Khelil Hammami</strong>
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "success.lighter", border: "1px solid", borderColor: "success.border" }}>
              <Typography variant="subtitle2" color="success.dark" fontWeight={800}>
                🚗 EXAMEN PRATIQUE (CONDUITE)
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }} color="success.dark">
                12 Candidats
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Moniteur responsable : <strong>Sonia Ghorbel</strong>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeSecretaire;
