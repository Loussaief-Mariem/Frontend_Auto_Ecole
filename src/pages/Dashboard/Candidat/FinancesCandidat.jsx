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
  Chip,
  Button,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CarRentalOutlinedIcon from "@mui/icons-material/CarRentalOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import { useAuth } from "../../../context/AuthContext";
import { useCandidat } from "../../../hooks/useCandidat";

const FinancesCandidat = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { profile, loading: profileLoading, error } = useCandidat(
    user?.user?.id,
    user?.autoEcoleId
  );

  const VALIDITE_CODE_MOIS = 15; // 1 an et 3 mois = 15 mois

  // Fonction pour calculer la date d'expiration du code (1 an et 3 mois après obtention)
  const calculerDateExpirationCode = (dateObtention) => {
    if (!dateObtention) return null;
    const date = new Date(dateObtention);
    date.setMonth(date.getMonth() + VALIDITE_CODE_MOIS);
    return date;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDetails = (contrat) => {
    setSelectedContrat(contrat);
    setDetailDialogOpen(true);
  };

  const formatCurrency = (amount) => {
    return `${(amount || 0).toLocaleString("fr-TN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })} DT`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-TN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Vérifier si le code est expiré
  const isCodeExpired = (dateExpiration) => {
    if (!dateExpiration) return false;
    const today = new Date();
    const expirationDate = new Date(dateExpiration);
    return expirationDate < today;
  };

  const getEtatContratInfo = (etat) => {
    switch (etat) {
      case 0:
        return { label: "Actif", color: "success", icon: <CheckCircleOutlineIcon />, description: "Contrat en cours" };
      case 1:
        return { label: "Terminé", color: "primary", icon: <CheckCircleOutlineIcon />, description: "Candidat a réussi tous ses examens" };
      case 2:
        return { label: "Interrompu", color: "warning", icon: <PauseCircleOutlineIcon />, description: "Code expiré ou formation non terminée" };
      case 4:
        return { label: "Archivé", color: "error", icon: <ArchiveOutlinedIcon />, description: "Contrat archivé par le secrétariat" };
      default:
        return { label: "Inconnu", color: "default", icon: <CancelOutlinedIcon />, description: "Statut inconnu" };
    }
  };

  const getTypeFormationInfo = (typeFormation) => {
    switch (typeFormation) {
      case 0:
        return { label: "Théorique", icon: <SchoolOutlinedIcon />, color: "info", description: "Formation code uniquement" };
      case 1:
        return { label: "Pratique", icon: <CarRentalOutlinedIcon />, color: "warning", description: "Formation conduite uniquement" };
      case 2:
        return { label: "Complet", icon: <WorkspacePremiumOutlinedIcon />, color: "success", description: "Formation complète (code + conduite)" };
      default:
        return { label: "Inconnu", icon: <SchoolOutlinedIcon />, color: "default", description: "Type inconnu" };
    }
  };

  // Fonction pour générer le numéro de reçu au format REC-YYYY-XXXXX
  const formatNumeroRecu = (annee, numero) => {
    return `REC-${annee}-${numero.toString().padStart(5, '0')}`;
  };

  // DONNÉES STATIQUES AVEC DATES COHÉRENTES
  
  // Contrat Actif (2025) - Formation Complet
  const contratActif = {
    id: 1001,
    typePermisCode: "B",
    typeFormation: 2,
    autoEcole: { 
      id: 1,
      nomEcole: "Auto-École Excellence",
      adresse: "15 Rue Habib Bourguiba, Tunis"
    },
    moniteurId: 5,
    moniteur: { nom: "Karim", prenom: "Ben Ali" },
    etatContrat: 0,
    estSolde: false,
    heuresCodeTotal: 20,
    heuresCodeEffectuees: 1,
    heuresConduiteTotal: 20,
    heuresConduiteEffectuees: 1,
    montantTotal: 700.00,
    montantPaye: 500.00,
    montantRestant: 200.00,
    dateInscription: "2025-01-15T10:00:00",
    dateModification: "2025-06-05T11:00:00",
    dateObtentionCode: null,
    dateExpirationCode: null,
    paiements: [
      { id: 1, datePaiement: "2025-01-15T10:30:00", numeroRecu: formatNumeroRecu(2025, 1), montant: 300.00 },
      { id: 2, datePaiement: "2025-02-10T14:15:00", numeroRecu: formatNumeroRecu(2025, 2), montant: 100.00 },
      { id: 3, datePaiement: "2025-06-05T11:00:00", numeroRecu: formatNumeroRecu(2025, 3), montant: 100.00 },
    ]
  };

  // Contrats Historiques
  const contratsHistoriques = [
    {
      id: 1002,
      typePermisCode: "B",
      typeFormation: 0,
      autoEcole: { 
        id: 1,
        nomEcole: "Auto-École Excellence",
        adresse: "15 Rue Habib Bourguiba, Tunis"
      },
      moniteurId: 3,
      moniteur: { nom: "Sami", prenom: "Mansour" },
      etatContrat: 1,
      estSolde: true,
      heuresCodeTotal: 20,
      heuresCodeEffectuees: 20,
      heuresConduiteTotal: 0,
      heuresConduiteEffectuees: 0,
      montantTotal: 200.00,
      montantPaye: 200,
      montantRestant: 0,
      dateInscription: "2023-09-20T11:00:00",
      dateModification: "2024-01-10T14:00:00",
      dateObtentionCode: "2023-12-15T10:00:00",
      dateExpirationCode: calculerDateExpirationCode("2023-12-15T10:00:00"),
      paiements: [
        { id: 4, datePaiement: "2023-10-20T11:30:00", numeroRecu: formatNumeroRecu(2023, 1), montant: 100.00 },
        { id: 5, datePaiement: "2023-11-15T09:45:00", numeroRecu: formatNumeroRecu(2023, 2), montant: 100.00 },
      ]
    },
    {
      id: 1004,
      typePermisCode: "B",
      typeFormation: 1,
      autoEcole: { 
        id: 2,
        nomEcole: "Auto-École Rapid",
        adresse: "8 Rue de Marseille, Tunis"
      },
      moniteurId: 8,
      moniteur: { nom: "Nadia", prenom: "Ben Salem" },
      etatContrat: 2,
      estSolde: false,
      heuresCodeTotal: 0,
      heuresCodeEffectuees: 0,
      heuresConduiteTotal: 20,
      heuresConduiteEffectuees: 5,
      montantTotal: 500.00,
      montantPaye: 125,
      montantRestant: 375,
      dateInscription: "2024-03-10T10:00:00",
      dateModification: "2024-08-20T09:00:00",
      dateObtentionCode: "2023-12-15T10:00:00",
      dateExpirationCode: calculerDateExpirationCode("2023-12-15T10:00:00"),
      paiements: [
        { id: 7, datePaiement: "2024-03-10T10:30:00", numeroRecu: formatNumeroRecu(2024, 1), montant: 125.00 },
      ]
    }
  ];

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Situation Financière
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consultez votre situation financière et l'historique de vos paiements
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
            minWidth: 150,
          },
        }}
      >
        <Tab icon={<AccountBalanceWalletOutlinedIcon />} iconPosition="start" label="Contrat actif" />
        <Tab icon={<HistoryOutlinedIcon />} iconPosition="start" label="Historique des contrats" />
      </Tabs>

      {/* ONGLET 1: CONTRAT ACTIF */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {contratActif ? (
            <>
              {contratActif.estSolde && (
                <Grid item xs={12}>
                  <Alert 
                    icon={<CheckCircleOutlineIcon fontSize="inherit" />} 
                    severity="success"
                    sx={{ borderRadius: 2 }}
                  >
                    Votre contrat est intégralement soldé.
                  </Alert>
                </Grid>
              )}

              {contratActif.dateExpirationCode && isCodeExpired(contratActif.dateExpirationCode) && (
                <Grid item xs={12}>
                  <Alert 
                    icon={<WarningAmberOutlinedIcon fontSize="inherit" />} 
                    severity="warning"
                    sx={{ borderRadius: 2 }}
                  >
                    Attention: Votre code a expiré le {formatDate(contratActif.dateExpirationCode)}. Veuillez contacter votre auto-école.
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3, 
                    border: "1px solid", 
                    borderColor: "divider",
                    overflow: "visible"
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "primary.main", color: "white" }}>
                            <BusinessOutlinedIcon />
                          </Box>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="h5" fontWeight={800}>
                                Permis {contratActif.typePermisCode}
                              </Typography>
                              <Tooltip title={getTypeFormationInfo(contratActif.typeFormation).description}>
                                <Chip
                                  icon={getTypeFormationInfo(contratActif.typeFormation).icon}
                                  label={getTypeFormationInfo(contratActif.typeFormation).label}
                                  size="small"
                                  color={getTypeFormationInfo(contratActif.typeFormation).color}
                                  sx={{ fontWeight: 600 }}
                                />
                              </Tooltip>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {contratActif.autoEcole.nomEcole}
                            </Typography>
                            {contratActif.dateObtentionCode && (
                              <Typography variant="caption" color="success.main" display="block">
                                Code obtenu le {formatDate(contratActif.dateObtentionCode)}
                              </Typography>
                            )}
                            {contratActif.dateExpirationCode && !isCodeExpired(contratActif.dateExpirationCode) && (
                              <Typography variant="caption" color="warning.main" display="block">
                                Code valable jusqu'au {formatDate(contratActif.dateExpirationCode)} (valide 1 an et 3 mois)
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Tooltip title={getEtatContratInfo(contratActif.etatContrat).description}>
                          <Chip 
                            icon={getEtatContratInfo(contratActif.etatContrat).icon}
                            label={getEtatContratInfo(contratActif.etatContrat).label}
                            color={getEtatContratInfo(contratActif.etatContrat).color}
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                          />
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Situation financière
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                            <Typography variant="caption" color="text.secondary">
                              Montant total
                            </Typography>
                            <Typography variant="h5" fontWeight={800}>
                              {formatCurrency(contratActif.montantTotal)}
                            </Typography> 
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                            <Typography variant="caption" color="text.secondary">
                              Montant payé
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color="success.main">
                              {formatCurrency(contratActif.montantPaye)}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                            <Typography variant="caption" color="text.secondary">
                              Reste à payer
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color="error.main">
                              {formatCurrency(contratActif.montantRestant)}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Historique des paiements
                      </Typography>
                      
                      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflowX: "auto" }}>
                        <Table sx={{ minWidth: 500 }}>
                          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>N° Reçu</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Date de paiement</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">Montant versé</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {contratActif.paiements && contratActif.paiements.length > 0 ? (
                              contratActif.paiements.map((paiement) => (
                                <TableRow key={paiement.id} hover>
                                  <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <ReceiptOutlinedIcon fontSize="small" color="action" />
                                      <Typography variant="body2" fontWeight={500}>
                                        {paiement.numeroRecu}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell>{formatDate(paiement.datePaiement)}</TableCell>
                                  <TableCell align="right">
                                    <Typography fontWeight={700} color="primary.main">
                                      {formatCurrency(paiement.montant)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                  <Typography color="text.secondary">
                                    Aucun paiement enregistré pour le moment.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Aucun contrat actif trouvé.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* ONGLET 2: HISTORIQUE DES CONTRATS - CORRIGÉ */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {contratsHistoriques && contratsHistoriques.length > 0 ? (
            contratsHistoriques.map((contrat) => {
              const etatInfo = getEtatContratInfo(contrat.etatContrat);
              const formationInfo = getTypeFormationInfo(contrat.typeFormation);
              const codeExpired = contrat.dateExpirationCode && isCodeExpired(contrat.dateExpirationCode);
              return (
                <Grid item xs={12} key={contrat.id}>
                  <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                            <BusinessOutlinedIcon color="action" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="h6" fontWeight={700}>
                                Permis {contrat.typePermisCode}
                              </Typography>
                              <Chip
                                icon={formationInfo.icon}
                                label={formationInfo.label}
                                size="small"
                                color={formationInfo.color}
                                sx={{ fontWeight: 600 }}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {contrat.autoEcole.nomEcole}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Inscrit le {formatDate(contrat.dateInscription)}
                            </Typography>
                            {contrat.dateObtentionCode && (
                              <Typography variant="caption" color="success.main" display="block">
                                ✓ Code obtenu le {formatDate(contrat.dateObtentionCode)}
                              </Typography>
                            )}
                            {contrat.dateExpirationCode && (
                              <Typography variant="caption" color={codeExpired ? "error.main" : "warning.main"} display="block">
                                {codeExpired ? "⚠ Code expiré le" : "📅 Code valable jusqu'au"} {formatDate(contrat.dateExpirationCode)}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Tooltip title={etatInfo.description}>
                            <Chip 
                              icon={etatInfo.icon}
                              label={etatInfo.label}
                              color={etatInfo.color}
                              size="small"
                            />
                          </Tooltip>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => handleOpenDetails(contrat)}
                          >
                            Détails
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Aucun ancien contrat trouvé.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* DIALOG DÉTAILS CONTRAT */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Détails du contrat - Permis {selectedContrat?.typePermisCode}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            {selectedContrat?.dateInscription && (
              <Typography variant="body2" color="text.secondary">
                Contrat établi le {formatDate(selectedContrat?.dateInscription)} avec {selectedContrat?.autoEcole?.nomEcole}
              </Typography>
            )}
            {selectedContrat?.dateObtentionCode && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                ✓ Code obtenu le {formatDate(selectedContrat.dateObtentionCode)}
              </Typography>
            )}
            {selectedContrat?.dateExpirationCode && (
              <Typography variant="body2" color={isCodeExpired(selectedContrat.dateExpirationCode) ? "error.main" : "warning.main"} sx={{ mt: 1 }}>
                {isCodeExpired(selectedContrat.dateExpirationCode) ? "⚠ Code expiré le" : "📅 Code valable jusqu'au"} {formatDate(selectedContrat.dateExpirationCode)}
              </Typography>
            )}
          </Box>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Historique des paiements
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, overflowX: "auto" }}>
            <Table sx={{ minWidth: 400 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: "35%" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptOutlinedIcon fontSize="small" />
                      <span>N° Reçu</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, width: "35%" }}>Date de paiement</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: "30%" }} align="right">Montant versé</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedContrat?.paiements && selectedContrat.paiements.length > 0 ? (
                  selectedContrat.paiements.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {p.numeroRecu}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(p.datePaiement)}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          icon={<AttachMoneyOutlinedIcon />}
                          label={formatCurrency(p.montant)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Aucun paiement enregistré pour ce contrat
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Résumé financier
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Total contrat</Typography>
                <Typography variant="subtitle1" fontWeight={800}>
                  {formatCurrency(selectedContrat?.montantTotal)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Total réglé</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="success.main">
                  {formatCurrency(selectedContrat?.montantPaye)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Solde restant</Typography>
                <Typography variant="subtitle1" fontWeight={800} color={selectedContrat?.montantRestant === 0 ? "success.main" : "error.main"}>
                  {formatCurrency(selectedContrat?.montantRestant)}
                </Typography>
                {selectedContrat?.montantRestant === 0 && (
                  <Typography variant="caption" color="success.main" display="block">
                    ✓ Contrat soldé
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancesCandidat;