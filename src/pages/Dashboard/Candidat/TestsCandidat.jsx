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
  Alert
} from "@mui/material";
import {
  PlayArrow,
  History,
  Assessment,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import testService from "../../../api/testService";
import ProgressionChart from "../../../components/Test/ProgressionChart";

const TestsCandidat = () => {
  const navigate = useNavigate();
  // Dans une vraie app, récupéré depuis le contexte
  const contratId = localStorage.getItem("contratId") || 1;

  const [availableTests, setAvailableTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les tests disponibles (on utilise getAllTests pour la demo ou un filtre)
        const testsRes = await testService.getAllTests();
        if (testsRes.success) setAvailableTests(testsRes.data);

        // Charger l'historique
        const historyRes = await testService.getHistorique(contratId);
        if (historyRes.success) setHistory(historyRes.data);

        // Charger la progression
        const progRes = await testService.getProgression(contratId);
        if (progRes.success) setProgression(progRes.data);
      } catch (error) {
        console.error("Erreur chargement données tests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contratId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Tableau de bord des Tests
      </Typography>

      <Grid container spacing={4}>
        {/* Graphique de Progression */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Assessment color="primary" /> Évolution de vos scores
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ProgressionChart data={progression?.points || []} />
            </Box>
          </Paper>
        </Grid>

        {/* Statistiques Rapides & Recommandations */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                bgcolor: "#f0f9ff",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Résumé Global
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Moyenne
                  </Typography>
                  <Typography variant="h6">
                    {progression?.moyenneGlobale?.toFixed(1) || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Tests passés
                  </Typography>
                  <Typography variant="h6">
                    {progression?.nombreTests || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 4, border: "1px solid #e2e8f0" }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckCircle color="success" /> Recommandations
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {progression?.progressionParTheme
                  ?.filter((t) => t.tendance < 0 || t.scores.slice(-1)[0] < 70)
                  .map((theme, i) => (
                    <Alert key={i} severity="warning" sx={{ borderRadius: 2 }}>
                      Thème faible : <strong>{theme.theme}</strong>. Révisez ce
                      chapitre !
                    </Alert>
                  ))}
                {(!progression?.progressionParTheme ||
                  progression.progressionParTheme.length === 0) && (
                  <Typography variant="body2" color="textSecondary">
                    Passez plus de tests pour obtenir des conseils.
                  </Typography>
                )}
              </Stack>
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
                      Thème : {test.themeName} | Durée : {test.dureeMinutes} min
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
            <History /> Historique des tests passés
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "none",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell fontWeight="bold">Titre/Thème</TableCell>
                  <TableCell fontWeight="bold">Score</TableCell>
                  <TableCell fontWeight="bold">Statut</TableCell>
                  <TableCell fontWeight="bold" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold">{row.titre}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {row.themeName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography fontWeight="bold">
                          {row.pourcentage}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({row.score}/{row.totalQuestions})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={row.estReussi ? <CheckCircle /> : <Error />}
                        label={row.estReussi ? "Réussi" : "Échoué"}
                        color={row.estReussi ? "success" : "error"}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(`/dashboard/candidat/test/${row.id}`)
                        } // Re-take same ID logic
                        sx={{ borderRadius: 2 }}
                      >
                        Refaire
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        Aucun test passé pour le moment.
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
