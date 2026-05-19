// src/pages/Dashboard/Secretaire/CandidatsListPage.jsx
import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Ajout de l'import
import useCandidatsList from "../../../hooks/useCandidatsList";
import PaginationComponent from "../../../components/common/pagination/PaginationComponent";
import ReinscrireCandidatModal from "../../../components/common/Candidat/ReinscrireCandidatModal";
import AddCandidatModal from "../../../components/common/Candidat/AddCandidatModal";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AutorenewIcon from "@mui/icons-material/Autorenew";

// Mapping des enums pour le contrat
const ETAT_CONTRAT = {
  0: { label: "Actif", color: "success" },
  1: { label: "Terminé", color: "info" },
  2: { label: "Interrompu", color: "error" },
  4: { label: "Archivé", color: "default" },
};

const ETAT_COMPTE = {
  0: { label: "Actif", color: "success" },
  1: { label: "Inactif", color: "error" },
};

const CandidatsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Récupération de l'utilisateur connecté
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ContratActif");
  const [reinscrireModalOpen, setReinscrireModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [compteTab, setCompteTab] = useState(0); // 0 = Actif, 1 = Inactif

  const autoEcoleId = user?.autoEcoleId || user?.user?.autoEcoleId || 1; // Utilisation de l'autoEcoleId du contexte
  // ID du moniteur (à récupérer depuis le contexte ou les props)
  const moniteurId = user?.moniteurId || user?.user?.moniteurId || 1; // À remplacer par l'ID du moniteur connecté

  const {
    candidats,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = useCandidatsList(autoEcoleId);

  const getEtatContratChip = (etat) => {
    const config = ETAT_CONTRAT[etat] || {
      label: "Aucun",
      color: "default",
    };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getSoldeChip = (etatPaiement) => {
    if (etatPaiement === 2) return <Chip size="small" color="success" label="Soldé" />;
    if (etatPaiement === 1) return <Chip size="small" color="warning" label="Partiel" />;
    if (etatPaiement === 0) return "-";
    return "-";
  };

  // Filtrage côté client
  const filteredCandidats = candidats.filter((candidat) => {
    const matchesCompte = candidat.compte?.etat === compteTab;
    
    const matchesSearch =
      candidat.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.numeroCIN?.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "ContratActif") matchesStatus = candidat.etatContrat === 0;
      else if (statusFilter === "ContratTermine") matchesStatus = candidat.etatContrat === 1;
      else if (statusFilter === "ContratInterrompu") matchesStatus = candidat.etatContrat === 2;
      else if (statusFilter === "Solde") matchesStatus = candidat.etatPaiement === 2;
      else if (statusFilter === "NonSolde") matchesStatus = candidat.etatPaiement === 1 || candidat.etatPaiement === 0;
    }

    return matchesCompte && matchesSearch && matchesStatus;
  });

  // Redirection selon le rôle
  const handleViewProfile = (id) => {
    const role = user?.role;

    if (role === "Secretaire") {
      navigate(`/dashboard/secretaire/candidats/${id}`);
    } else if (role === "Moniteur" || role === "Proprietaire") {
      navigate(`/dashboard/moniteur/candidats/${id}`);
    } else {
      // Fallback par défaut
      navigate(`/dashboard/secretaire/candidats/${id}`);
    }
  };

  if (loading && candidats.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Gestion des Candidats
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les informations et le suivi des candidats
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage("")}>
              {successMessage}
            </Alert>
          )}
        </Box>

        {user?.role === "Secretaire" && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddModalOpen(true)}
            >
              Ajouter un candidat
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutorenewIcon />}
              onClick={() => setReinscrireModalOpen(true)}
            >
              Réinscrire
            </Button>
          </Stack>
        )}
      </Paper>

      <AddCandidatModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage("Candidat ajouté avec succès.");
          handleRefresh();
        }}
      />

      <ReinscrireCandidatModal
        open={reinscrireModalOpen}
        onClose={() => setReinscrireModalOpen(false)}
        autoEcoleId={autoEcoleId}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          handleRefresh();
        }}
      />

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={compteTab}
          onChange={(e, newValue) => setCompteTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Comptes Actifs" />
          <Tab label="Comptes Inactifs" />
        </Tabs>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom, prénom ou CIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                variant="outlined"
                size="medium"
              >
                Statut:{" "}
                {statusFilter === "all"
                  ? "Tous"
                  : statusFilter === "ContratActif"
                    ? "Contrat Actif"
                    : statusFilter === "ContratTermine"
                      ? "Contrat Terminé"
                      : statusFilter === "ContratInterrompu"
                        ? "Contrat Interrompu"
                        : statusFilter === "Solde"
                          ? "Soldé"
                          : "Non Soldé"}
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setStatusFilter("all");
                    setFilterAnchorEl(null);
                  }}
                >
                  Tous
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("ContratActif");
                    setFilterAnchorEl(null);
                  }}
                >
                  Contrat Actif
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("ContratTermine");
                    setFilterAnchorEl(null);
                  }}
                >
                  Contrat Terminé
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("ContratInterrompu");
                    setFilterAnchorEl(null);
                  }}
                >
                  Contrat Interrompu
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("Solde");
                    setFilterAnchorEl(null);
                  }}
                >
                  Soldé
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("NonSolde");
                    setFilterAnchorEl(null);
                  }}
                >
                  Non Soldé
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des candidats */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>Candidat</TableCell>
                <TableCell>CIN</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell>Statut compte</TableCell>
                <TableCell>Statut contrat</TableCell>
                <TableCell>Paiement</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 4 }}
                    >
                      Aucun candidat trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidats.map((candidat) => (
                  <TableRow key={candidat.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {candidat.prenom?.[0]}
                          {candidat.nom?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {candidat.prenom} {candidat.nom}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {candidat.numeroCIN}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {candidat.telephone || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {candidat.compte?.login || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {candidat.dateInscription
                        ? new Date(
                            candidat.dateInscription,
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          ETAT_COMPTE[candidat.compte?.etat]?.color || "default"
                        }
                        label={
                          ETAT_COMPTE[candidat.compte?.etat]?.label || "Inconnu"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {getEtatContratChip(candidat.etatContrat)}
                    </TableCell>
                    <TableCell>
                      {getSoldeChip(candidat.etatPaiement)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Voir profil">
                        <IconButton
                          onClick={() => handleViewProfile(candidat.id)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationComponent
          page={page}
          pageSize={pageSize}
          total={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={handleRefresh}
          loading={loading}
          showSettings={true}
          variant="outlined"
        />
      </Paper>


    </Box>
  );
};

export default CandidatsListPage;
