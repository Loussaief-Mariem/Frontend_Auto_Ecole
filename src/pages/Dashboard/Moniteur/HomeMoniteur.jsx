import {
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
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

const HomeMoniteur = () => {
  const [tabValue, setTabValue] = useState(0);

  // Beautiful static demo data
  const stats = {
    seancesAujourdhuiCount: 6,
    seancesRestantesCount: 2,
    tempsMoyenSeanceMinutes: 75, // 1h 15m
    candidatsSuivisCount: 24,
    candidatsProchesExamenCount: 4
  };

  const todaySessions = [
    { id: 1, heureDebut: "08:30", heureFin: "09:30", candidatNom: "Ben Ali", candidatPrenom: "Amine", estEffectuee: true, estAnnulee: false },
    { id: 2, heureDebut: "10:00", heureFin: "11:30", candidatNom: "Tounsi", candidatPrenom: "Marwen", estEffectuee: true, estAnnulee: false },
    { id: 3, heureDebut: "14:00", heureFin: "15:30", candidatNom: "El Ouaer", candidatPrenom: "Rim", estEffectuee: false, estAnnulee: false },
    { id: 4, heureDebut: "16:00", heureFin: "17:00", candidatNom: "Trabelsi", candidatPrenom: "Yassine", estEffectuee: false, estAnnulee: false },
    { id: 5, heureDebut: "17:30", heureFin: "18:30", candidatNom: "Mansour", candidatPrenom: "Faten", estEffectuee: false, estAnnulee: true }
  ];

  const tomorrowSessions = [
    { id: 10, heureDebut: "09:00", heureFin: "10:30", candidatNom: "Tounsi", candidatPrenom: "Marwen", estEffectuee: false, estAnnulee: false },
    { id: 11, heureDebut: "11:00", heureFin: "12:30", candidatNom: "Ben Ali", candidatPrenom: "Amine", estEffectuee: false, estAnnulee: false },
    { id: 12, heureDebut: "14:30", heureFin: "16:00", candidatNom: "Mansour", candidatPrenom: "Faten", estEffectuee: false, estAnnulee: false }
  ];

  const activeSessions = tabValue === 0 ? todaySessions : tomorrowSessions;

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color={BLUE[900]}>
              Tableau de bord
            </Typography>
            <Typography color="text.secondary" variant="body2" mt={0.25}>
              Organisation des séances et progression des candidats.
            </Typography>
            <DashboardUserMeta />
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <StatCard
          title="Séances aujourd'hui"
          value={`${stats.seancesAujourdhuiCount}h`}
          subtitle="Heures de conduite"
          icon={<EventNoteOutlinedIcon />}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatCard
          dark
          title="Candidats affectés"
          value={stats.candidatsSuivisCount}
          subtitle="Affectations actives"
          icon={<SchoolOutlinedIcon />}
        />
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid", borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                Planning de conduite
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Séances de conduite pratique planifiées
              </Typography>
            </Box>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab label="Aujourd'hui" sx={{ fontWeight: 700 }} />
              <Tab label="Demain" sx={{ fontWeight: 700 }} />
            </Tabs>
          </Stack>

          <Stack spacing={1.25}>
            {activeSessions.map((session) => (
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
                      {session.heureDebut} - {session.heureFin}
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
                        label="Planifiée"
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
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HomeMoniteur;
