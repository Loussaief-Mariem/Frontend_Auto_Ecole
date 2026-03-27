import { createTheme } from "@mui/material/styles";

/**
 * Palette unique : bleu et dégradés de bleu (pas de violet / autre teinte).
 */
export const blueGradients = {
  hero: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)",
  heroSoft:
    "linear-gradient(160deg, #172554 0%, #1e40af 35%, #2563eb 70%, #3b82f6 100%)",
  bar: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
  button: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)",
  cta: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      // Toujours dans la famille bleue (tons plus clairs)
      main: "#60a5fa",
      light: "#93c5fd",
      dark: "#3b82f6",
      contrastText: "#0f172a",
    },
    background: {
      default: "#f1f5f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
