import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Typography, Link, Stack } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { blueGradients } from "../../theme/muiTheme";

const Footer = () => {
  const linkSx = {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textDecoration: "none",
    "&:hover": { color: "common.white", textDecoration: "underline" },
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        background: blueGradients.heroSoft,
        color: "common.white",
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Auto-École
            </Typography>
            <Typography
              variant="body2"
              sx={{ maxWidth: 320, opacity: 0.9, lineHeight: 1.7 }}
            >
              Une plateforme simple pour suivre votre formation et réussir le
              permis avec des parcours clairs et un accompagnement moderne.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.95 }}>
              Liens
            </Typography>
            <Link component={RouterLink} to="/" sx={linkSx}>
              Accueil
            </Link>
            <Link component={RouterLink} to="/login" sx={linkSx}>
              Connexion
            </Link>
            <Link component={RouterLink} to="/register" sx={linkSx}>
              Inscription
            </Link>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.95 }}>
              Contact
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.9 }}>
              <EmailOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">contact@auto-ecole.fr</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.9 }}>
              <PhoneInTalkOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">01 23 45 67 89</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ opacity: 0.9 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 20, mt: 0.25 }} />
              <Typography variant="body2">Paris, France</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} Auto-École — Tous droits réservés
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
