import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  useTheme,
  alpha
} from "@mui/material";
import {
  PlayArrow,
  History,
  Assessment,
  CheckCircle,
  Error,
  TrendingUp,
  Warning,
  EmojiEvents,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import testService from "../../../api/testService";

const TestsCandidat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const contratId = localStorage.getItem("contratId") || 1;

  const [availableTests, setAvailableTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [testsRes, historyRes, progressionRes] = await Promise.all([
          testService.getAllTests(),
          testService.getHistorique(contratId),
          testService.getProgression(contratId)
        ]);

        if (testsRes && testsRes.success) {
          setAvailableTests(testsRes.data);
        }
        if (historyRes && historyRes.success) {
          setHistory(historyRes.data);
        }
        if (progressionRes && progressionRes.success) {
          // Calculer le champ score pour chaque thème basé sur le dernier score de la liste scores
          const mappedProgression = {
            ...progressionRes.data,
            progressionParTheme: progressionRes.data.progressionParTheme?.map(t => {
              const lastScore = t.scores && t.scores.length > 0 ? t.scores[t.scores.length - 1] : 0;
              return {
                ...t,
                score: lastScore
              };
            }) || []
          };
          setProgression(mappedProgression);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données de l'espace entraînement", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [contratId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calcul des statistiques
  const totalTests = progression?.nombreTests || 0;
  const testsReussis = history.filter(t => t.estReussi).length;
  const meilleurScoreGlobal = history.length > 0 
    ? Math.max(...(history.map(t => t.pourcentage) || [0])) 
    : 0;
  const themesFaibles = progression?.progressionParTheme?.filter(t => t.score < 80 && t.score > 0) || [];
  const themesNonTentes = progression?.progressionParTheme?.filter(t => t.score === 0) || [];

  // Fonction pour obtenir le libellé du thème
  const getThemeLabel = (themeCode) => {
    const themes = {
      "Signalisation": "Signalisation",
      "ConducteurVehicule": "Conducteur et Véhicule",
      "ArretStationnement": "Arrêt et Stationnement",
      "CroisementDepassement": "Croisement et Dépassement",
      "Priorite": "Priorités",
      "Circulation": "Circulation",
      "Delits": "Délits",
      "PremiersSecours": "Premiers Secours",
      "MaintenanceEnergie": "Maintenance et Énergie",
      "TransportMatieresDangereuses": "Transport de Matières Dangereuses",
      "Général": "Général"
    };
    return themes[themeCode] || themeCode;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={850} color="text.primary" gutterBottom>
            Espace Entraînement
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Préparez votre examen du code de la route avec nos séries d'entraînement et nos tests blancs.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={4}>
        {/* Statistiques Rapides & Recommandations */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          {/* Résumé Global */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
            }}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography variant="subtitle1" fontWeight="800" color="primary">
                  Résumé Global
                </Typography>
                <Assessment sx={{ color: theme.palette.primary.main, opacity: 0.8 }} />
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, fontWeight: 600 }}>
                      <TrendingUp fontSize="inherit" /> Moyenne
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="primary" mt={0.5}>
                      {progression?.moyenneGlobale ? progression.moyenneGlobale.toFixed(2).replace('.', ',') : "0,00"}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={progression?.moyenneGlobale || 0} 
                      sx={{ height: 4, borderRadius: 2, mt: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, fontWeight: 600 }}>
                      <School fontSize="inherit" /> Tests
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="primary" mt={0.5}>
                      {totalTests}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ borderRight: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      Meilleur Score
                    </Typography>
                    <Typography variant="h5" fontWeight={850} color="success.main" mt={0.5}>
                      {meilleurScoreGlobal.toFixed(2).replace('.', ',')}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      Tests Réussis
                    </Typography>
                    <Typography variant="h5" fontWeight={850} color="success.main" mt={0.5}>
                      {testsReussis}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Conseils de révision */}
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              border: "1px solid", 
              borderColor: "divider", 
              flex: 1.2,
              boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="850"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}
            >
              <Warning color="warning" /> Conseils de révision
            </Typography>
            
            {themesFaibles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="warning.main" sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Thèmes prioritaires :
                </Typography>
                <Stack spacing={1}>
                  {themesFaibles.slice(0, 2).map((themeItem, i) => (
                    <Alert key={i} severity="warning" sx={{ borderRadius: 3, py: 0.5, px: 2, "& .MuiAlert-message": { fontWeight: 600, fontSize: "0.85rem" } }}>
                      {getThemeLabel(themeItem.theme)} ({themeItem.score.toFixed(2).replace('.', ',')}%)
                    </Alert>
                  ))}
                </Stack>
              </Box>
            )}

            {themesNonTentes.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="info.main" sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Séries non entamées :
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {themesNonTentes.slice(0, 3).map((themeItem, i) => (
                    <Chip 
                      key={i}
                      label={getThemeLabel(themeItem.theme)}
                      size="small"
                      variant="outlined"
                      color="info"
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {themesFaibles.length === 0 && themesNonTentes.length === 0 && (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <EmojiEvents color="success" sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="body2" fontWeight={700} color="success.main" gutterBottom>
                  Excellent niveau général !
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tous vos thèmes ont un score supérieur à 80%. Continuez comme ça !
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>

        {/* Tests Disponibles */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={850}
            gutterBottom
            sx={{ mb: 2.5 }}
          >
            Séries disponibles
          </Typography>
          <Grid container spacing={2}>
            {availableTests.filter(test => test.totalQuestionsActual > 0).length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Aucune série d'entraînement n'est disponible pour le moment.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              availableTests.filter(test => test.totalQuestionsActual > 0).map((test) => (
                <Grid item xs={12} sm={6} key={test.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      transform: "translateY(-2px)"
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                          {test.titre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Thème : {getThemeLabel(test.themeName)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${test.nombreQuestions} Qs`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 800, borderRadius: 2 }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 3 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Objectif de réussite : {test.seuilReussite}%
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/dashboard/candidat/test/${test.id}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 750,
                          px: 2.5
                        }}
                      >
                        Commencer
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )))}
          </Grid>
        </Box>

        {/* Historique des Tests */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={850}
            gutterBottom
            sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}
          >
            <History color="primary" /> Historique de vos séries
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              overflow: "hidden"
            }}
          >
            <Table sx={{ minWidth: 500 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Série / Thème</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row, index) => (
                  <TableRow 
                    key={row.id} 
                    hover
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={0.5}>
                        <Typography fontWeight="800" variant="body2">{row.titre || row.testBlancNom}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {getThemeLabel(row.themeName)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography fontWeight="900" color={row.pourcentage >= 80 ? "success.main" : "warning.main"} variant="body2">
                            {row.pourcentage ? row.pourcentage.toFixed(2).replace('.', ',') : "0,00"}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            ({row.score}/{row.totalQuestions})
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={row.pourcentage} 
                          color={row.pourcentage >= 80 ? "success" : "warning"}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={row.estReussi ? <CheckCircle /> : <Error />}
                        label={row.estReussi ? "Réussi" : "À réviser"}
                        color={row.estReussi ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {row.dateTest ? new Date(row.dateTest).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/dashboard/candidat/test/${row.id}`)}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                      >
                        Refaire
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Assessment sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                      <Typography color="textSecondary" fontWeight={600}>
                        Aucun test passé pour le moment.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
};

export default TestsCandidat;