import { Box, Stack, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        mt: "auto",
        px: { xs: 2, md: 3 },
        py: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} AutoPilot. Tous droits réservés.
        </Typography>
        <Stack direction="row" spacing={3}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
          >
            Contact
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
          >
            Politique de confidentialité
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
