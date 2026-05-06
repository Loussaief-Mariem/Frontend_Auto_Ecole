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
  Chip,
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 4, textAlign: "center", mb: 4 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Résultat Final
        </Typography>

        <Box sx={{ position: "relative", display: "inline-flex", my: 3 }}>
          <Typography
            variant="h2"
            color={estReussi ? "success.main" : "error.main"}
            fontWeight="bold"
          >
            {score} / {total}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          color={estReussi ? "success.main" : "error.main"}
          sx={{ mb: 2 }}
        >
          {estReussi ? "Test Réussi ! 🎉" : "Test Échoué ❌"}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={percentage}
          color={estReussi ? "success" : "error"}
          sx={{ height: 10, borderRadius: 5, mb: 2 }}
        />
        <Typography variant="body2" color="textSecondary" fontWeight="bold">
          Score : {percentage.toFixed(1)}% (Objectif : 70%)
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: "bold",
            }}
          >
            <CheckCircle color="primary" /> Détails par thème
          </Typography>
          <Grid container spacing={2}>
            {resultatsParTheme.map((rt, index) => {
              const themeLabel = THEME_CODE_LABELS[rt.theme]?.label || rt.theme;
              return (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {themeLabel}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {rt.bonnesReponses ?? 0} / {rt.nombreQuestions ?? 0}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={rt.pourcentage ?? 0}
                        color={
                          (rt.pourcentage ?? 0) >= 70
                            ? "success"
                            : (rt.pourcentage ?? 0) >= 50
                              ? "warning"
                              : "error"
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: "bold",
            }}
          >
            <Lightbulb color="warning" /> Recommandations
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#fff8e1",
              border: "1px solid #ffe082",
            }}
          >
            <List disablePadding>
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    {index < recommendations.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem sx={{ px: 1 }}>
                  <ListItemText
                    primary="Excellent travail ! Continuez ainsi."
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Correction Détaillée */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 6, mb: 3, fontWeight: "bold" }}
      >
        Correction détaillée
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reponsesDetaillees.map((rep, index) => (
          <Accordion
            key={rep.questionId || index}
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px !important",
              overflow: "hidden",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ bgcolor: rep.estCorrecte ? "#f0fdf4" : "#fef2f2" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                {rep.estCorrecte ? (
                  <CheckCircle color="success" />
                ) : (
                  <Cancel color="error" />
                )}
                <Typography sx={{ fontWeight: "bold", flexGrow: 1 }}>
                  Question {index + 1}
                </Typography>
                <Chip
                  label={rep.estCorrecte ? "Correct" : "Incorrect"}
                  color={rep.estCorrecte ? "success" : "error"}
                  size="small"
                  variant="outlined"
                  sx={{ bgcolor: "white" }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: "white" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {rep.enonce}
              </Typography>

              {rep.image && (
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <img
                    src={rep.image}
                    alt="Question"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </Box>
              )}

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      borderColor: rep.estCorrecte
                        ? "success.main"
                        : "error.main",
                      bgcolor: rep.estCorrecte ? "#f0fdf4" : "#fef2f2",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                      gutterBottom
                    >
                      Votre réponse :
                    </Typography>
                    <Typography
                      variant="body1"
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
                        borderColor: "success.main",
                        bgcolor: "#f0fdf4",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                        gutterBottom
                      >
                        Bonne réponse :
                      </Typography>
                      <Typography
                        variant="body1"
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
                    bgcolor: "#f8fafc",
                    borderLeft: "4px solid #3b82f6",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Info fontSize="small" /> Explication
                  </Typography>
                  <Typography variant="body2">{rep.explication}</Typography>
                </Paper>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default TestResult;
