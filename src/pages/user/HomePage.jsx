import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Stack,
  Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SpeedIcon from "@mui/icons-material/Speed";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import Menu from "../../components/layout/Menu";
import Footer from "../../components/layout/Footer";
import HomeCard from "../../components/common/HomeCard";
import { blueGradients } from "../../theme/muiTheme";

const services = [
  {
    title: "Conduite accompagnée",
    description:
      "Heures pratiques structurées avec des moniteurs diplômés et pédagogie progressive.",
    icon: DirectionsCarIcon,
  },
  {
    title: "Code de la route",
    description:
      "Supports à jour, quiz et suivi pour maîtriser le code dans les meilleures conditions.",
    icon: MenuBookIcon,
  },
  {
    title: "Planning en ligne",
    description:
      "Réservez vos créneaux quand vous voulez, depuis votre espace personnel.",
    icon: EventAvailableIcon,
  },
];

const highlights = [
  "Suivi clair de votre progression",
  "Interface simple pour tous les élèves",
  "Équipe à l’écoute et disponible",
];

const HomePage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Menu />

      <Box component="main" sx={{ flex: 1 }}>
        {/* Hero — landing publique */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: blueGradients.hero,
            color: "common.white",
            py: { xs: 8, md: 12 },
            px: 2,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.35,
              background:
                "radial-gradient(ellipse 80% 60% at 70% 0%, rgba(147, 197, 253, 0.6), transparent)",
              pointerEvents: "none",
            }}
          />
          <Container maxWidth="lg" sx={{ position: "relative" }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Chip
                icon={<SchoolIcon sx={{ color: "common.white !important" }} />}
                label="Formation au permis"
                sx={{
                  bgcolor: "rgba(255,255,255,0.18)",
                  color: "common.white",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.25)",
                  py: 2.5,
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  maxWidth: 800,
                  fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
                  lineHeight: 1.15,
                }}
              >
                Réussissez votre permis avec une auto-école pensée pour vous
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 560,
                  fontWeight: 400,
                  opacity: 0.92,
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                }}
              >
                Cours de conduite, préparation au code et réservation de
                séances : tout est réuni sur une plateforme moderne, accessible
                à tous.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ pt: 1 }}
              >
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    fontSize: "1rem",
                    bgcolor: "common.white",
                    color: "primary.dark",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  Créer un compte
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    fontSize: "1rem",
                    borderColor: "rgba(255,255,255,0.65)",
                    color: "common.white",
                    "&:hover": {
                      borderColor: "common.white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  J’ai déjà un compte
                </Button>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.5, sm: 3 }}
                sx={{ pt: 2, alignItems: "center" }}
              >
                {highlights.map((text) => (
                  <Stack
                    key={text}
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 22, opacity: 0.95 }} />
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      {text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Bandeau confiance */}
        <Box sx={{ bgcolor: "primary.dark", color: "common.white", py: 2.5 }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="center"
              textAlign={{ xs: "center", md: "left" }}
            >
              <SpeedIcon sx={{ fontSize: 32, opacity: 0.95 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Parcours structuré, outils simples — concentrez-vous sur la route.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Services */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: 5 }}>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={700}
              letterSpacing={2}
            >
              Nos services
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={800}>
              Tout ce qu’il vous faut pour avancer
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 560 }}
            >
              Une expérience unifiée du premier clic à la réussite du permis.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {services.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <HomeCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* CTA final */}
        <Box
          sx={{
            background: blueGradients.cta,
            color: "common.white",
            py: { xs: 6, md: 8 },
          }}
        >
          <Container maxWidth="md">
            <Stack spacing={2.5} alignItems="center" textAlign="center">
              <Typography variant="h4" fontWeight={800}>
                Prêt à démarrer ?
              </Typography>
              <Typography sx={{ opacity: 0.92, maxWidth: 480 }}>
                Inscrivez-vous en quelques minutes et accédez à votre espace
                élève.
              </Typography>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  px: 4,
                  py: 1.5,
                  bgcolor: "common.white",
                  color: "primary.dark",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Commencer gratuitement
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default HomePage;
