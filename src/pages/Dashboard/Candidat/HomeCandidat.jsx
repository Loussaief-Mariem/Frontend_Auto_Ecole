import { Box, Grid, Paper, Typography, Stack, Avatar, Divider, Button } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { useAuth } from "../../../context/AuthContext";
import { useCandidat } from "../../../hooks/useCandidat";
import { getAuthDisplayName } from "../../../utils/dashboardUserLabels";
import DashboardUserMeta from "../../../components/common/dashboard/DashboardUserMeta";

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      display: "flex",
      alignItems: "center",
      gap: 2,
      width: "100%",
    }}
  >
    <Avatar
      sx={{
        bgcolor: `${color}15`,
        color: color,
        width: 48,
        height: 48,
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={800}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const ProfileCard = ({ profile }) => {
  if (!profile) return null;
  
  // Récupérer l'URL complète de la photo
  const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
  const photoUrl = profile.photoPath 
    ? `${apiUrl}${profile.photoPath}`
    : null;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        width: "100%",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" mb={3}>
        <Avatar
          src={photoUrl}
          sx={{
            width: 72,
            height: 72,
            bgcolor: "primary.main",
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
          }}
        >
          {!photoUrl && <PersonOutlineOutlinedIcon sx={{ fontSize: 36 }} />}
        </Avatar>
        <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h5" fontWeight={800}>
            {profile.prenom} {profile.nom}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={600}>
            Candidat
          </Typography>
        </Box>
      </Stack>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BadgeOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              N° CIN: <strong style={{ color: "var(--mui-palette-text-primary)" }}>{profile.numeroCIN || "Non défini"}</strong>
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EmailOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              Email : <strong style={{ color: "var(--mui-palette-text-primary)" }}>{profile.compte?.login || "Non défini"}</strong>
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PhoneOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              Tél: <strong style={{ color: "var(--mui-palette-text-primary)" }}>{profile.telephone || "Non défini"}</strong>
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LocationOnOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary" noWrap>
              Adresse: <strong style={{ color: "var(--mui-palette-text-primary)" }}>{profile.adresse || "Non définie"}</strong>
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalendarMonthOutlinedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              Né(e) le: <strong style={{ color: "var(--mui-palette-text-primary)" }}>{profile.dateNaissance ? new Date(profile.dateNaissance).toLocaleDateString("fr-FR") : "N/A"}</strong>
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

const ExamensSection = ({ examens }) => {
  if (!examens || examens.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          textAlign: "center",
          width: "100%",
        }}
      >
        <EventOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={600}>
          Aucun examen programmé pour le moment.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vous serez notifié lorsqu'un examen sera planifié.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        width: "100%",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <EventOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Examens programmés
        </Typography>
      </Stack>
      
      <Grid container spacing={2}>
        {examens.map((examen, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, rgba(25, 118, 210, 0.04) 0%, rgba(25, 118, 210, 0.01) 100%)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    <AssignmentOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {examen.type || "Examen de conduite"}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        {examen.description || "Épreuve pratique"}
                      </Typography>
                      {examen.lieu && (
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          • {examen.lieu}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
                
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(examen.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(examen.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const HomeCandidat = () => {
  const { user } = useAuth();
  const { profile, loading } = useCandidat(user?.user?.id, user?.autoEcoleId);
  const displayName = getAuthDisplayName(user);
  const firstName = displayName.split(/\s+/).filter(Boolean)[0] || "Candidat";

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography fontWeight={600}>Chargement de votre profil...</Typography>
      </Box>
    );
  }

  // Calculer les statistiques à partir des données du profil (avec exemples statiques si vide)
  const seancesCodeTotal = profile?.contrat?.heuresCodeTotal || 20;
  const seancesCodeEffectuees = profile?.seancesCode?.length > 0 ? profile.seancesCode.length : 7;
  const heuresConduiteTotal = profile?.contrat?.heuresConduiteTotal || 20;
  const heuresConduiteEffectuees = profile?.seancesConduite?.length > 0 ? profile.seancesConduite.length : 7;
  
  // Compter les séances à venir
  const seancesAVenirRaw = profile?.seancesConduite?.filter(
    seance => new Date(seance.date) > new Date()
  ).length || 0;
  const seancesAVenir = seancesAVenirRaw > 0 ? seancesAVenirRaw : 1;
  
  // Données d'exemple pour les examens
  const examensProgrammes = [
    {
      id: 1,
      type: "Conduite (Circulation)",
      description: "Épreuve pratique",
      date: "2026-05-25T10:00:00",
      lieu: "Parcours Circulation (Sidi Mansour)"
    }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          Bonjour, {profile?.prenom || firstName} 
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre progression et de vos prochaines étapes.
        </Typography>
        <DashboardUserMeta />
      </Box>

      {/* Vertical Stack Layout */}
      <Stack spacing={3}>
        {/* Profile Card */}
        <ProfileCard profile={profile} />

        {/* Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Séances à venir"
              value={`${seancesAVenir} Séance${seancesAVenir > 1 ? 's' : ''}`}
              icon={<CalendarMonthOutlinedIcon fontSize="large" />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Heures de conduite"
              value={`${heuresConduiteEffectuees} h `}
              icon={<AccessTimeOutlinedIcon fontSize="large" />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              title="Heures de code"
              value={`${seancesCodeEffectuees} h `}
              icon={<AssignmentOutlinedIcon fontSize="large" />}
              color="#ff9800"
            />
          </Grid>
        </Grid>

        {/* Contract Info Card */}
        {profile?.contrat && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              width: "100%",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Informations du contrat
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Type de permis
                </Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">
                  Permis {profile.contrat.typePermisCode}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Type de formation
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profile.contrat.typeFormation === 0 && "Théorique"}
                  {profile.contrat.typeFormation === 1 && "Pratique"}
                  {profile.contrat.typeFormation === 2 && "Complet"}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Auto-école
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profile.contrat.autoEcole?.nom || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Date d'inscription
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {profile.contrat.dateInscription ? new Date(profile.contrat.dateInscription).toLocaleDateString("fr-FR") : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Scheduled Exams */}
        <ExamensSection examens={examensProgrammes} />
      </Stack>
    </Box>
  );
};

export default HomeCandidat;