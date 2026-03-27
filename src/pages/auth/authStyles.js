import { blueGradients } from "../../theme/muiTheme";

export const authPageSx = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: 2,
  py: 4,
  background: blueGradients.heroSoft,
};

export const authPaperSx = {
  width: "100%",
  maxWidth: 420,
  p: { xs: 3, sm: 4 },
  borderRadius: 3,
  bgcolor: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 25px 50px -12px rgba(23, 37, 84, 0.45)",
};

export const authSubmitSx = {
  py: 1.35,
  mt: 1,
  fontSize: "1rem",
  color: "common.white",
  background: blueGradients.button,
  boxShadow: "0 8px 20px rgba(29, 78, 216, 0.35)",
  "&:hover": {
    filter: "brightness(1.06)",
    boxShadow: "0 10px 24px rgba(29, 78, 216, 0.45)",
  },
};
