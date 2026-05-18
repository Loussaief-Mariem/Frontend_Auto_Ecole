import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip, Stack 
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Lightbulb,
  Cancel,
  ExpandMore,
  Info,
} from "@mui/icons-material";
import { THEME_CODE_LABELS } from "../../enums";

const TestResult = ({ result }) => {
  console.log("Résultat reçu dans TestResult.jsx :", result);
  
  const getImageUrl = (path) => {
    if (!path) return "";
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7057/api';
    const baseHost = baseUrl.replace('/api', '');

    if (path.startsWith("http://") || path.startsWith("https://")) {
      if (path.includes('https://localhost:7057')) {
        return path.replace('https://localhost:7057', baseHost);
      }
      return path;
    }
    return path.startsWith("/") ? `${baseHost}${path}` : `${baseHost}/${path}`;
  };

  if (!result) return null;

  const score = result.score ?? 0;
  const total = result.totalQuestions ?? 1;
  const estReussi = result.estReussi ?? false;
  const percentage =
    result.pourcentage ?? (total > 0 ? (score / total) * 100 : 0);
  const resultatsParTheme = result.resultatsParTheme ?? [];
  const recommendations = result.recommendations ?? [];
  const reponsesDetaillees = result.reponsesDetaillees ?? [];

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", width: "100%", px: { xs: 2, sm: 0 }, py: 3 }}>
      {/* Score Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          border: "1px solid",
          borderColor: estReussi ? "success.light" : "error.light",
          background: estReussi 
            ? "linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(22, 163, 74, 0.01) 100%)"
            : "linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.01) 100%)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.01)",
          mb: 3
        }}
      >
        <Typography variant="h5" fontWeight={850} color="text.primary" gutterBottom>
          Résultat du Test
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography
            variant="h2"
            color={estReussi ? "success.main" : "error.main"}
            fontWeight={900}
          >
            {score} <Typography variant="h4" component="span" color="text.secondary" fontWeight={700}>/ {total}</Typography>
          </Typography>
        </Box>

        <Chip
          icon={estReussi ? <CheckCircle sx={{ fontSize: "1.2rem !important" }} /> : <Cancel sx={{ fontSize: "1.2rem !important" }} />}
          label={estReussi ? "Test Réussi !" : "Test Échoué"}
          color={estReussi ? "success" : "error"}
          sx={{ 
            fontWeight: 800, 
            fontSize: "1rem", 
            px: 2, 
            py: 2.2, 
            borderRadius: 3, 
            mb: 3,
            "& .MuiChip-icon": {
              marginLeft: "4px !important",
              marginRight: "-4px !important",
            }
          }}
        />

        <Box sx={{ width: "100%", maxWidth: 320, mx: "auto" }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={estReussi ? "success" : "error"}
            sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
          />
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Score obtenu : {percentage.toFixed(1)}% (Objectif minimum : 70%)
          </Typography>
        </Box>
      </Paper>

      <Stack spacing={3}>
        {/* Recommandations */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={850}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2.5
            }}
          >
            <Lightbulb color="warning" /> Conseils et Recommandations
          </Typography>

          <List disablePadding>
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 600,
                        color: "text.primary"
                      }}
                    />
                  </ListItem>
                  {index < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary="Excellent travail ! Tous les thèmes sont bien maîtrisés."
                  primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "success.main" }}
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* Correction Détaillée */}
        <Box>
          <Typography
            variant="h6"
            fontWeight={850}
            gutterBottom
            sx={{ mb: 2.5 }}
          >
            Correction détaillée
          </Typography>

          <Stack spacing={2}>
            {reponsesDetaillees.map((rep, index) => (
              <Accordion
                key={rep.questionId || index}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "16px !important",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ 
                    bgcolor: rep.estCorrecte ? "rgba(22, 163, 74, 0.03)" : "rgba(220, 38, 38, 0.03)",
                    px: 2.5
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
                    {rep.estCorrecte ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <Cancel color="error" fontSize="small" />
                    )}
                    <Typography sx={{ fontWeight: 800, flexGrow: 1, fontSize: "0.95rem" }}>
                      Question {index + 1}
                    </Typography>
                    <Chip
                      label={rep.estCorrecte ? "Correct" : "Incorrect"}
                      color={rep.estCorrecte ? "success" : "error"}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 750, borderRadius: 2, fontSize: "0.75rem", height: 24 }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, bgcolor: "background.paper" }}>
                  <Typography variant="body1" sx={{ mb: 2.5, fontWeight: 750, color: "text.primary" }}>
                    {rep.enonce}
                  </Typography>

                  {rep.image && (
                    <Box sx={{ mb: 3, textAlign: "center" }}>
                      <img
                        src={getImageUrl(rep.image)}
                        alt="Question"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    </Box>
                  )}

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: "100%",
                          borderRadius: 3,
                          borderColor: rep.estCorrecte
                            ? "success.light"
                            : "error.light",
                          bgcolor: rep.estCorrecte ? "rgba(22, 163, 74, 0.02)" : "rgba(220, 38, 38, 0.02)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          fontWeight={600}
                          display="block"
                          gutterBottom
                        >
                          Votre réponse :
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={rep.estCorrecte ? "success.main" : "error.main"}
                        >
                          {rep.texteReponseCandidat}
                        </Typography>
                      </Paper>
                    </Grid>
                    {!rep.estCorrecte && (
                      <Grid item xs={12} sm={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            height: "100%",
                            borderRadius: 3,
                            borderColor: "success.light",
                            bgcolor: "rgba(22, 163, 74, 0.02)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            fontWeight={600}
                            display="block"
                            gutterBottom
                          >
                            Bonne réponse :
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.main"
                          >
                            {rep.texteReponseCorrecte}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {rep.explication && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderLeft: "4px solid",
                        borderLeftColor: "primary.main",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="primary"
                        fontWeight={750}
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Info fontSize="small" /> Explication
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {rep.explication}
                      </Typography>
                    </Paper>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default TestResult;
