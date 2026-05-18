// src/components/common/paiement/PaiementSection.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import usePaiement from "../../../hooks/usePaiement";

// Mapping labels for formations
const LABEL_FORMATION = {
  0: "Code seulement",
  1: "Conduite seulement",
  2: "Formation complète",
};

// Formatting date
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-TN");
};

const PaiementSection = ({ tousContrats = [], onPaiementAdded }) => {
  const theme = useTheme();

  // Selected contract state
  const [selectedContrat, setSelectedContrat] = useState(null);

  // Hook for active payments
  const { historique, situation, addPaiement, loading } = usePaiement(
    selectedContrat?.id
  );

  // Form state
  const [form, setForm] = useState({
    montant: "",
    description: "",
    type: 0, // 0 = ACOMPTE_CONDUITE, 1 = ACOMPTE_CODE
  });

  // Dialogs & alerts
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [deniedDialogOpen, setDeniedDialogOpen] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState({
    open: false,
    message: "",
  });
  const [errorAlert, setErrorAlert] = useState("");

  // Sync selected contract with backend situation if updated
  useEffect(() => {
    if (selectedContrat && situation) {
      setSelectedContrat((prev) => {
        if (!prev) return null;
        const total = situation.montantTotal ?? situation.total ?? 0;
        const paye = situation.montantPaye ?? situation.totalPaye ?? 0;
        const reste = situation.montantRestant ?? situation.reste ?? 0;
        return {
          ...prev,
          montantTotal: total,
          montantPaye: paye,
          montantRestant: reste,
          estSolde: reste <= 0,
        };
      });
    }
  }, [situation]);

  // Natively print a beautifully formatted payment receipt as a PDF
  const handlePrintRecu = (paiement) => {
    // Get auto-ecole name from local storage or fallback
    let autoEcoleName = "AUTO-ÉCOLE";
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const storedUser = JSON.parse(userData);
        autoEcoleName = storedUser.autoEcoleNom || storedUser.nomAutoEcole || "AUTO-ÉCOLE";
      }
    } catch (e) {
      console.error(e);
    }

    const printWindow = window.open("", "_blank");
    const datePaiementStr = formatDate(paiement.datePaiement);
    const dateImpressionStr = new Date().toLocaleDateString("fr-TN");
    const motifLabel = paiement.type === 0 ? "Acompte Conduite" : "Acompte Code";
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Reçu de Paiement ${paiement.numeroRecu}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #333;
              margin: 40px;
              padding: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #eaeaea;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #eaeaea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header-left h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              color: #1976d2;
              letter-spacing: -0.5px;
            }
            .header-left p {
              margin: 5px 0 0 0;
              font-size: 13px;
              color: #666;
            }
            .header-right {
              text-align: right;
            }
            .header-right h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 800;
              color: #333;
            }
            .header-right p {
              margin: 5px 0 0 0;
              font-size: 14px;
              font-weight: 600;
              color: #1976d2;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-block {
              background-color: #fafafa;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              padding: 15px 20px;
            }
            .info-block p {
              margin: 6px 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #888;
              margin-bottom: 10px;
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 5px;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .receipt-table th {
              border-bottom: 2px solid #dee2e6;
              padding: 12px;
              text-align: left;
              font-size: 13px;
              font-weight: 700;
              color: #555;
            }
            .receipt-table td {
              padding: 12px;
              border-bottom: 1px solid #dee2e6;
              font-size: 14px;
            }
            .amount-total {
              font-size: 24px;
              font-weight: 800;
              color: #1976d2;
            }
            .summary-card {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              display: flex;
              justify-content: space-around;
              margin-top: 20px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-item span {
              display: block;
              font-size: 12px;
              color: #888;
              font-weight: 600;
              text-transform: uppercase;
            }
            .summary-item strong {
              font-size: 18px;
              color: #333;
              font-weight: 700;
              margin-top: 5px;
              display: block;
            }
            .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 12px;
              color: #999;
            }
            .signature-area {
              text-align: center;
              border-top: 1px dashed #ccc;
              width: 200px;
              padding-top: 10px;
              margin-top: 20px;
              color: #666;
            }
            @media print {
              body { margin: 20px; }
              .container { border: none; box-shadow: none; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <h1>${autoEcoleName.toUpperCase()}</h1>
                <p>Reçu de Paiement Officiel</p>
              </div>
              <div class="header-right">
                <h2>REÇU DE PAIEMENT</h2>
                <p>N° ${paiement.numeroRecu}</p>
                <p style="font-size: 12px; color: #555; font-family: inherit; margin-top: 5px;">Date: ${datePaiementStr}</p>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-block">
                <div class="section-title">Informations Candidat</div>
                <p><strong>Candidat :</strong> ${selectedContrat.candidatNom || "Candidat"} ${selectedContrat.candidatPrenom || ""}</p>
                <p><strong>N° CIN :</strong> ${selectedContrat.cin || "—"}</p>
              </div>
              <div class="info-block">
                <div class="section-title">Informations Contrat</div>
                <p><strong>Type de permis :</strong> Permis ${selectedContrat.typePermisCode}</p>
                <p><strong>Type de formation :</strong> ${LABEL_FORMATION[selectedContrat.typeFormation] || "—"}</p>
                <p><strong>Date d'inscription :</strong> ${formatDate(selectedContrat.dateInscription)}</p>
              </div>
            </div>

            <div class="section-title">Détails du Paiement</div>
            <table class="receipt-table">
              <thead>
                <tr>
                  <th>Description / Motif</th>
                  <th>Type de Paiement</th>
                  <th style="text-align: right;">Montant Versé</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${paiement.description || "Paiement sur contrat de formation"}</td>
                  <td>${motifLabel}</td>
                  <td style="text-align: right;" class="amount-total">${paiement.montant} DT</td>
                </tr>
              </tbody>
            </table>

            <div class="section-title">Situation Financière Actuelle</div>
            <div class="summary-card">
              <div class="summary-item">
                <span>Total Contrat</span>
                <strong>${selectedContrat.montantTotal} DT</strong>
              </div>
              <div class="summary-item">
                <span>Total Réglé</span>
                <strong>${selectedContrat.montantPaye} DT</strong>
              </div>
              <div class="summary-item">
                <span>Reste à Payer</span>
                <strong style="color: #f44336;">${selectedContrat.montantRestant} DT</strong>
              </div>
            </div>

            <div class="footer">
              <div>
                <p>Edité le ${dateImpressionStr}</p>
                <p>Merci pour votre confiance.</p>
              </div>
              <div>
                <div class="signature-area">
                  Cachet & Signature
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle contract selection
  const handleSelectContrat = (contrat) => {
    setSelectedContrat(contrat);
    setForm({
      montant: "",
      description: "",
      type: contrat.typeFormation === 0 ? 1 : 0, // Default type based on formation
    });
    setErrorAlert("");
  };

  // Submit payment handler
  const handlePayerClick = () => {
    setErrorAlert("");
    const montantNum = parseFloat(form.montant);

    // Exception 2 : Montant invalide
    if (!form.montant || Number.isNaN(montantNum) || montantNum <= 0) {
      setErrorAlert("Le montant doit être supérieur à zéro.");
      return;
    }

    // Check if amount exceeds remaining balance
    if (montantNum > selectedContrat.montantRestant) {
      setWarningDialogOpen(true);
    } else {
      executePaiement();
    }
  };

  // Execute payment call
  const executePaiement = async () => {
    try {
      const montantNum = parseFloat(form.montant);
      const res = await addPaiement({
        montant: montantNum,
        description: form.description,
        type: form.type,
        contratId: selectedContrat.id,
      });

      // Show success message
      const isNowFullyPaid = selectedContrat.montantRestant - montantNum <= 0;
      if (isNowFullyPaid) {
        setSuccessSnackbar({
          open: true,
          message: "Paiement enregistré avec succès. Contrat totalement soldé !",
        });
      } else {
        setSuccessSnackbar({
          open: true,
          message: "Paiement enregistré avec succès.",
        });
      }

      // Reset form
      setForm({
        montant: "",
        description: "",
        type: selectedContrat.typeFormation === 0 ? 1 : 0,
      });

      // Refresh parent profile data to stay in sync
      if (onPaiementAdded) {
        onPaiementAdded();
      }
    } catch (err) {
      setErrorAlert(
        err.response?.data?.message || "Erreur lors de l'enregistrement du paiement."
      );
    }
  };

  // Render list of contracts
  if (!selectedContrat) {
    return (
      <Box>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
            }}
          >
            <WalletIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Contrats et Paiements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sélectionnez un contrat actif ou suspendu pour enregistrer un paiement ou consulter l'historique.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {tousContrats.map((contrat) => {
            const progress =
              contrat.montantTotal > 0
                ? Math.min((contrat.montantPaye / contrat.montantTotal) * 100, 100)
                : 0;

            const isActif = contrat.etatContrat === 0;
            const isSuspendu = contrat.etatContrat === 2;

            return (
              <Grid item xs={12} key={contrat.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: "all 0.2s ease-in-out",
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    position: "relative",
                    overflow: "visible",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Permis {contrat.typePermisCode} —{" "}
                            {LABEL_FORMATION[contrat.typeFormation] || "Formation"}
                          </Typography>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip
                              label={
                                contrat.etatContrat === 0
                                  ? "Actif"
                                  : contrat.etatContrat === 1
                                    ? "Terminé"
                                    : "Suspendu"
                              }
                              size="small"
                              color={
                                contrat.etatContrat === 0
                                  ? "success"
                                  : contrat.etatContrat === 1
                                    ? "default"
                                    : "error"
                              }
                              variant="outlined"
                            />

                            <Chip
                              label={contrat.estSolde ? "Soldé" : "Non soldé"}
                              size="small"
                              color={contrat.estSolde ? "success" : "warning"}
                            />
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            Inscrit le : {formatDate(contrat.dateInscription)}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Stack spacing={1}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              Progression paiement
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {contrat.montantPaye} / {contrat.montantTotal} DT
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                bgcolor: contrat.estSolde ? "success.main" : "primary.main",
                              },
                            }}
                          />
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Payé : {contrat.montantPaye} DT
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color={contrat.montantRestant > 0 ? "error.main" : "success.main"}
                            >
                              Reste : {contrat.montantRestant} DT
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={3} sx={{ textAlign: "right" }}>
                        <Button
                          variant="contained"
                          color={contrat.estSolde ? "success" : "primary"}
                          onClick={() => handleSelectContrat(contrat)}
                          endIcon={<ArrowRightIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "bold",
                            boxShadow: "none",
                          }}
                        >
                          {contrat.estSolde ? "Consulter" : "Gérer les paiements"}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* DIALOG ACCESS DENIED FOR SOLDED CONTRACT */}
        <Dialog open={deniedDialogOpen} onClose={() => setDeniedDialogOpen(false)}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon color="success" />
            Contrat entièrement soldé
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ce contrat a déjà été entièrement payé (le montant restant est égal à 0). Il n'est
              plus possible d'ajouter de nouveaux paiements pour ce dossier (Accès refusé).
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeniedDialogOpen(false)} variant="contained" autoFocus>
              Compris
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Active Contract Payment and History Panel
  const progressPercent =
    selectedContrat.montantTotal > 0
      ? Math.min((selectedContrat.montantPaye / selectedContrat.montantTotal) * 100, 100)
      : 0;

  return (
    <Box>
      {/* HEADER WITH BACK BUTTON */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSelectedContrat(null)}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: 2,
            color: "text.primary",
          }}
        >
          Retour aux contrats
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Chip
            label={`Permis ${selectedContrat.typePermisCode}`}
            color="primary"
            variant="outlined"
            fontWeight="bold"
          />
          <Chip
            label={LABEL_FORMATION[selectedContrat.typeFormation]}
            color="info"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* DETAILED SITUATION CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Montant total du contrat
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {selectedContrat.montantTotal} DT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total payé à ce jour
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {selectedContrat.montantPaye} DT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Montant restant dû
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {selectedContrat.montantRestant} DT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* VISUAL PAYMENT PROGRESS BAR */}
      <Card variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Progression financière
            </Typography>
            <Chip
              label={`${progressPercent.toFixed(0)}% réglé`}
              color={progressPercent === 100 ? "success" : "primary"}
              size="small"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
              },
            }}
          />
        </Stack>
      </Card>

      <Grid container spacing={4}>
        {/* ADD PAYMENT FORM */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <PaymentIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Enregistrer un paiement
                </Typography>
              </Box>

              {selectedContrat.estSolde && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Ce contrat est entièrement soldé. Aucun paiement supplémentaire n'est requis ou autorisé.
                </Alert>
              )}

              {errorAlert && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errorAlert}
                </Alert>
              )}

              <Stack spacing={3.5}>
                <TextField
                  label="Montant du paiement (DT)"
                  type="number"
                  fullWidth
                  required
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  inputProps={{ min: 1, step: "any" }}
                  placeholder="Exemple: 150"
                  variant="outlined"
                  disabled={selectedContrat.estSolde}
                />

                <TextField
                  select
                  label="Type / Motif du paiement"
                  fullWidth
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  variant="outlined"
                  disabled={selectedContrat.estSolde}
                >
                  <MenuItem value={0}>Acompte Conduite</MenuItem>
                  <MenuItem value={1}>Acompte Code</MenuItem>
                </TextField>

                <TextField
                  label="Description / Note"
                  fullWidth
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Exemple: Reçu par chèque n°12345"
                  multiline
                  rows={2}
                  variant="outlined"
                  disabled={selectedContrat.estSolde}
                />

                {form.montant && !Number.isNaN(parseFloat(form.montant)) && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                    }}
                  >
                    <Typography variant="body2" color="info.main" fontWeight="500">
                      Nouveau solde estimé :{" "}
                      <strong>
                        {Math.max(
                          (selectedContrat.montantRestant ?? 0) - parseFloat(form.montant),
                          0
                        ).toFixed(0)}{" "}
                        DT
                      </strong>
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePayerClick}
                  disabled={loading || selectedContrat.estSolde}
                  fullWidth
                  size="large"
                  sx={{
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: "bold",
                    py: 1.5,
                  }}
                >
                  {loading ? "Enregistrement..." : selectedContrat.estSolde ? "Contrat totalement soldé" : "Confirmer le paiement"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* PAYMENT HISTORY */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Historique des paiements
                </Typography>
              </Box>

              {historique.length === 0 ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.grey[50], 0.5),
                    borderRadius: 2.5,
                    border: "1px dashed #e0e0e0",
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Aucun paiement enregistré pour ce contrat.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>N° Reçu</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Motif</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          Montant
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historique.map((paiement) => (
                        <TableRow key={paiement.id} hover>
                          <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                            {paiement.numeroRecu}
                          </TableCell>
                          <TableCell>{formatDate(paiement.datePaiement)}</TableCell>
                          <TableCell>
                            <Chip
                              label={paiement.type === 0 ? "Conduite" : "Code"}
                              size="small"
                              variant="outlined"
                              color={paiement.type === 0 ? "primary" : "info"}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary" }}>
                            {paiement.description || "—"}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {paiement.montant} DT
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handlePrintRecu(paiement)}
                              title="Imprimer le reçu"
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WARNING DIALOG FOR OVERPAYMENT */}
      <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "warning.main" }}>
          <WarningIcon />
          Montant supérieur au solde restant
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le montant saisi (<strong>{form.montant} DT</strong>) dépasse le montant restant dû
            pour ce contrat (<strong>{selectedContrat.montantRestant} DT</strong>).
            <br />
            <br />
            Voulez-vous quand même enregistrer ce paiement excédentaire ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWarningDialogOpen(false)} variant="outlined" color="inherit">
            Annuler
          </Button>
          <Button
            onClick={() => {
              setWarningDialogOpen(false);
              executePaiement();
            }}
            variant="contained"
            color="warning"
            autoFocus
          >
            Oui, enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS NOTIFICATION */}
      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })}
          severity="success"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaiementSection;
