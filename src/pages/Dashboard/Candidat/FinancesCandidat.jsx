import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Button,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useAuth } from "../../../context/AuthContext";
import { useCandidat } from "../../../hooks/useCandidat";
import usePaiement from "../../../hooks/usePaiement";

const FinancesCandidat = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Charger le profil pour obtenir le contratId
  const { profile, loading: profileLoading } = useCandidat(
    user?.user?.id,
    user?.autoEcoleId
  );

  const contratId = profile?.contrat?.id;

  // Utiliser le hook usePaiement avec le contratId
  const { historique, situation, loading: financeLoading, error } = usePaiement(contratId);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-TN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusChip = (status) => {
    // Supposons que l'API renvoie des chaînes ou des enums
    // Ici on adapte selon ce qu'on attendrait (0=en attente, 1=validé par ex)
    const isValidated = status === 1 || status === "Validé" || status === true;
    return (
      <Chip
        label={isValidated ? "Validé" : "En attente"}
        color={isValidated ? "success" : "warning"}
        size="small"
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      />
    );
  };

  if (profileLoading || (financeLoading && !situation)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!contratId && !profileLoading) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Aucun contrat actif n'a été trouvé pour votre compte. Veuillez contacter votre auto-école.
        </Alert>
      </Box>
    );
  }

  const progress = situation
    ? (situation.montantPaye / situation.montantTotal) * 100
    : 0;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Ma gestion financière
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consultez votre situation et l'historique de vos règlements.
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            minWidth: 120,
          },
        }}
      >
        <Tab icon={<AccountBalanceWalletOutlinedIcon />} iconPosition="start" label="Ma situation" />
        <Tab icon={<HistoryEduOutlinedIcon />} iconPosition="start" label="Historique des paiements" />
      </Tabs>

      {/* SECTION SITUATION */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Cartes récapitulatives */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: "primary.main",
                color: "white",
                boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Montant total contrat
                  </Typography>
                  <TrendingUpIcon sx={{ opacity: 0.8 }} />
                </Stack>
                <Typography variant="h3" fontWeight={800} mb={1}>
                  {formatCurrency(situation?.montantTotal)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Inclut formation et frais administratifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: "white",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Montant déjà payé
                  </Typography>
                  <Box
                    sx={{
                      p: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.main",
                    }}
                  >
                    <PaymentsOutlinedIcon fontSize="small" />
                  </Box>
                </Stack>
                <Typography variant="h3" fontWeight={800} color="success.main" mb={1}>
                  {formatCurrency(situation?.montantPaye)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total des règlements validés
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: "white",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reste à payer
                  </Typography>
                  <Box
                    sx={{
                      p: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: "error.main",
                    }}
                  >
                    <AccountBalanceWalletOutlinedIcon fontSize="small" />
                  </Box>
                </Stack>
                <Typography variant="h3" fontWeight={800} color="error.main" mb={1}>
                  {formatCurrency(situation?.montantRestant)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solde débiteur à régulariser
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Barre de progression */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Progression du règlement
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary">
                  {Math.round(progress)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 6,
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
                {progress >= 100 
                  ? "Votre contrat est intégralement soldé. Merci !" 
                  : `Il vous reste ${formatCurrency(situation?.montantRestant)} à payer pour solder votre compte.`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* SECTION HISTORIQUE */}
      {tabValue === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Méthode</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historique && historique.length > 0 ? (
                historique.map((p, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{formatDate(p.datePaiement)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700} color="primary">
                        {formatCurrency(p.montant)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.methodePaiement || "Espèces"}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(p.estValide)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadOutlinedIcon />}
                        sx={{ borderRadius: 2, fontSize: "0.75rem" }}
                        onClick={() => alert("Téléchargement du reçu...")}
                      >
                        Reçu
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucun paiement enregistré pour le moment.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FinancesCandidat;
