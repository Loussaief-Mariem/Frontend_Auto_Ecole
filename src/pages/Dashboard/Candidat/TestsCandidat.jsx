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
    // Données statiques pour la démonstration
    // Tests disponibles avec 6 questions chacun
    const staticAvailableTests = [
      { id: 101, titre: "Test Blanc #1", nombreQuestions: 6, themeName: "Général", dureeMinutes: 9 },
      { id: 102, titre: "Spécial Signalisation", nombreQuestions: 6, themeName: "Signalisation", dureeMinutes: 9 },
      { id: 103, titre: "Priorités et Croisements", nombreQuestions: 6, themeName: "Priorite", dureeMinutes: 9 },
      { id: 104, titre: "Conducteur et Véhicule", nombreQuestions: 6, themeName: "ConducteurVehicule", dureeMinutes: 9 },
      { id: 105, titre: "Stationnement", nombreQuestions: 6, themeName: "ArretStationnement", dureeMinutes: 9 },
      { id: 106, titre: "Circulation", nombreQuestions: 6, themeName: "Circulation", dureeMinutes: 9 },
      { id: 107, titre: "Délits", nombreQuestions: 6, themeName: "Delits", dureeMinutes: 9 },
      { id: 108, titre: "Premiers Secours", nombreQuestions: 6, themeName: "PremiersSecours", dureeMinutes: 9 },
      { id: 109, titre: "Maintenance", nombreQuestions: 6, themeName: "MaintenanceEnergie", dureeMinutes: 9 },
      { id: 110, titre: "Transport Matières Dangereuses", nombreQuestions: 6, themeName: "TransportMatieresDangereuses", dureeMinutes: 9 },
    ];

    const staticHistory = [
      { id: 1, titre: "Test Blanc #1", themeName: "Général", pourcentage: 83, score: 5, totalQuestions: 6, estReussi: true, date: "2025-03-15", meilleurScore: 83 },
      { id: 2, titre: "Priorités et Croisements", themeName: "Priorite", pourcentage: 67, score: 4, totalQuestions: 6, estReussi: false, date: "2025-03-10", meilleurScore: 67 },
      { id: 3, titre: "Spécial Signalisation", themeName: "Signalisation", pourcentage: 83, score: 5, totalQuestions: 6, estReussi: true, date: "2025-03-05", meilleurScore: 83 },
      { id: 4, titre: "Test Blanc #2", themeName: "Général", pourcentage: 100, score: 6, totalQuestions: 6, estReussi: true, date: "2025-02-28", meilleurScore: 100 },
      { id: 5, titre: "Stationnement", themeName: "ArretStationnement", pourcentage: 50, score: 3, totalQuestions: 6, estReussi: false, date: "2025-03-12", meilleurScore: 50 },
    ];

    const staticProgression = {
      moyenneGlobale: 76.6,
      nombreTests: 5,
      progressionParTheme: [
        { theme: "Priorite", score: 67, objectif: 80, meilleurScore: 67 },
        { theme: "Signalisation", score: 83, objectif: 80, meilleurScore: 83 },
        { theme: "Général", score: 91.5, objectif: 80, meilleurScore: 100 },
        { theme: "ArretStationnement", score: 50, objectif: 80, meilleurScore: 50 },
        { theme: "ConducteurVehicule", score: 0, objectif: 80, meilleurScore: 0 },
        { theme: "Circulation", score: 0, objectif: 80, meilleurScore: 0 },
        { theme: "Delits", score: 0, objectif: 80, meilleurScore: 0 },
        { theme: "PremiersSecours", score: 0, objectif: 80, meilleurScore: 0 },
        { theme: "MaintenanceEnergie", score: 0, objectif: 80, meilleurScore: 0 },
        { theme: "TransportMatieresDangereuses", score: 0, objectif: 80, meilleurScore: 0 },
      ]
    };

    setAvailableTests(staticAvailableTests);
    setHistory(staticHistory);
    setProgression(staticProgression);
    setLoading(false);
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
  const meilleurScoreGlobal = Math.max(...(history.map(t => t.meilleurScore || t.pourcentage) || [0]));
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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom fontWeight="800" color="primary" sx={{ mb: 1 }}>
        Espace Entraînement
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Suivez vos progrès et préparez votre examen du code avec nos tests blancs.
      </Typography>

      <Grid container spacing={4}>
        {/* Statistiques Rapides & Recommandations */}
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* Résumé Global */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                flex: 1,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="800" color="primary">
                    Résumé Global
                  </Typography>
                  <Assessment sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <TrendingUp fontSize="small" /> Moyenne
                      </Typography>
                      <Typography variant="h4" fontWeight="800" color="primary">
                        {progression?.moyenneGlobale?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={progression?.moyenneGlobale || 0} 
                        sx={{ height: 4, borderRadius: 2, mt: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <School fontSize="small" /> Tests passés
                      </Typography>
                      <Typography variant="h4" fontWeight="800" color="primary">
                        {totalTests}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {testsReussis} réussis
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Meilleur score</Typography>
                      <Typography variant="h6" fontWeight="700" color="success.main">
                        {meilleurScoreGlobal}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Recommandations - sans icônes */}
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", flex: 2 }}
            >
              <Typography
                variant="h6"
                fontWeight="800"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Warning color="warning" /> Conseils de révision personnalisés
              </Typography>
              
              {/* Thèmes à améliorer (score entre 1 et 79%) */}
              {themesFaibles.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight="600" color="warning.main" sx={{ mb: 1 }}>
                    Thèmes à améliorer :
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {themesFaibles.map((themeItem, i) => (
                      <Alert key={i} severity="warning" sx={{ borderRadius: 2 }}>
                        <strong>{getThemeLabel(themeItem.theme)}</strong> - Score actuel : {themeItem.score}% (Objectif : {themeItem.objectif}%)

                      </Alert>
                    ))}
                  </Stack>
                </>
              )}

              {/* Thèmes non encore testés */}
              {themesNonTentes.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight="600" color="info.main" sx={{ mb: 1, mt: themesFaibles.length > 0 ? 2 : 0 }}>
                    Thèmes non encore testés :
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {themesNonTentes.map((themeItem, i) => (
                        <Chip 
                          key={i}
                          label={getThemeLabel(themeItem.theme)}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      ))}
                    </Box>
                  </Stack>
                </>
              )}

              {themesFaibles.length === 0 && themesNonTentes.length === 0 && (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <EmojiEvents color="success" sx={{ fontSize: 48, mb: 1, opacity: 0.6 }} />
                  <Typography variant="body1" fontWeight="600" color="success.main" gutterBottom>
                    Excellent travail !
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tous vos thèmes sont maîtrisés à plus de 80%. Continuez à vous entraîner pour maintenir votre niveau.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>
        </Grid>

        {/* Tests Disponibles */}
        <Grid item xs={12}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ mt: 2 }}
          >
            Commencer un Test Blanc
          </Typography>
          <Grid container spacing={3}>
            {availableTests.map((test) => (
              <Grid item xs={12} sm={6} md={4} key={test.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    transition: "0.3s",
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {test.titre}
                      </Typography>
                      <Chip
                        label={`${test.nombreQuestions} Questions`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Thème : {getThemeLabel(test.themeName)} | Durée : {test.dureeMinutes} min
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() =>
                        navigate(`/dashboard/candidat/test/${test.id}`)
                      }
                      sx={{
                        mt: 3,
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: "bold",
                      }}
                    >
                      Démarrer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Historique des Tests */}
        <Grid item xs={12}>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ mt: 4, display: "flex", alignItems: "center", gap: 1 }}
          >
            <History color="primary" /> Historique des tests passés
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              overflow: "hidden"
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Test</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Meilleur score</TableCell>
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
                    sx={{ 
                      bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.02)
                    }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight="700">{row.titre}</Typography>
                        <Chip 
                          label={getThemeLabel(row.themeName)} 
                          size="small" 
                          variant="outlined"
                          sx={{ width: 'fit-content', fontSize: '0.7rem' }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography fontWeight="800" color={row.pourcentage >= 80 ? "success.main" : "warning.main"}>
                            {row.pourcentage}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
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
                      <Typography fontWeight="700" color="info.main">
                        {row.meilleurScore || row.pourcentage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={row.estReussi ? <CheckCircle /> : <Error />}
                        label={row.estReussi ? "Réussi" : "À améliorer"}
                        color={row.estReussi ? "success" : "error"}
                        variant="filled"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(row.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/dashboard/candidat/test/${row.id}`)}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                      >
                        Refaire
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Assessment sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                      <Typography color="textSecondary">
                        Aucun test passé pour le moment. Commencez votre premier test blanc !
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestsCandidat;