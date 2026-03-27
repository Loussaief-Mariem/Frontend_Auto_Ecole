import { Card, CardContent, Typography, Box } from "@mui/material";
import { blueGradients } from "../../theme/muiTheme";

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {import('@mui/material/SvgIcon').SvgIconComponent} props.icon — composant icône MUI
 */
const HomeCard = ({ title, description, icon: Icon }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.25)",
          borderColor: "primary.light",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {Icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              color: "common.white",
              background: blueGradients.button,
              boxShadow: "0 8px 16px rgba(29, 78, 216, 0.35)",
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Box>
        )}
        <Typography variant="h6" component="h3" gutterBottom fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HomeCard;
