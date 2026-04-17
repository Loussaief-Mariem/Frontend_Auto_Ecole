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
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  EventNote as EventIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Ajout de l'import
import useCandidatsList from "../../../hooks/useCandidatsList";
import PaginationComponent from "../../../components/common/pagination/PaginationComponent";
import SeanceConduiteForm from "../../../components/common/seances/SeanceConduiteForm";
import { planifierSeanceConduite } from "../../../api/seanceConduiteService";

// Mapping des enums
const ETAT_CANDIDAT = {
  0: { label: "Actif", color: "success" },
  1: { label: "Archivé", color: "default" },
};

const ETAT_COMPTE = {
  0: { label: "Actif", color: "success" },
  1: { label: "Inactif", color: "error" },
  2: { label: "Bloqué", color: "warning" },
  3: { label: "Archivé", color: "default" },
};

const ETAT_DOSSIER = {
  0: { label: "Incomplet", color: "warning" },
  1: { label: "Complet", color: "success" },
  2: { label: "Annulé", color: "error" },
  3: { label: "Clôturé", color: "info" },
};

const CandidatsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Récupération de l'utilisateur connecté
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // États pour le dialogue de planification de séance
  const [openSeanceForm, setOpenSeanceForm] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [planificationLoading, setPlanificationLoading] = useState(false);

  // ID de l'auto-école (à récupérer depuis le contexte ou les props)
  const autoEcoleId = user?.autoEcoleId || 1; // Utilisation de l'autoEcoleId du contexte
  // ID du moniteur (à récupérer depuis le contexte ou les props)
  const moniteurId = user?.moniteurId || 1; // À remplacer par l'ID du moniteur connecté

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

  const getStatusChip = (etat) => {
    const config = ETAT_CANDIDAT[etat] || {
      label: "Inconnu",
      color: "default",
    };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getDossierChip = (etatDossier) => {
    const config = ETAT_DOSSIER[etatDossier] || {
      label: "Inconnu",
      color: "default",
    };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  // Filtrage côté client
  const filteredCandidats = candidats.filter((candidat) => {
    const matchesSearch =
      candidat.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.numeroCIN?.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "Actif") matchesStatus = candidat.etat === 0;
      else if (statusFilter === "Archivé") matchesStatus = candidat.etat === 1;
      else if (statusFilter === "CompteInactif")
        matchesStatus = candidat.compte?.etat === 1;
    }

    return matchesSearch && matchesStatus;
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

  const handlePlanifierSeance = (candidat) => {
    setSelectedCandidat(candidat);
    setOpenSeanceForm(true);
  };

  const handleSubmitSeance = async (data) => {
    setPlanificationLoading(true);
    try {
      // Planifier la séance directement sans vérification
      await planifierSeanceConduite(data);

      // Afficher un message de succès
      alert("Séance planifiée avec succès !");

      // Fermer le dialogue
      setOpenSeanceForm(false);
      setSelectedCandidat(null);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la planification",
      );
    } finally {
      setPlanificationLoading(false);
    }
  };

  const handleExport = () => {
    console.log("Export des candidats");
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
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Gestion des Candidats
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les informations et le suivi des candidats
        </Typography>
      </Paper>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
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
                  : statusFilter === "Actif"
                    ? "Actifs"
                    : statusFilter === "Archivé"
                      ? "Archivés"
                      : "Compte inactif"}
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
                    setStatusFilter("Actif");
                    setFilterAnchorEl(null);
                  }}
                >
                  Candidats Actifs
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("Archivé");
                    setFilterAnchorEl(null);
                  }}
                >
                  Candidats Archivés
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setStatusFilter("CompteInactif");
                    setFilterAnchorEl(null);
                  }}
                >
                  Compte Inactif
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Exporter
              </Button>
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
                <TableCell>Statut dossier</TableCell>
                <TableCell>Statut compte</TableCell>
                <TableCell>Statut candidat</TableCell>
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
                        {candidat.compte?.telephone || "N/A"}
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
                      {getDossierChip(candidat.dossier?.etatDossier)}
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
                    <TableCell>{getStatusChip(candidat.etat)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Voir profil">
                        <IconButton
                          onClick={() => handleViewProfile(candidat.id)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Planifier séance de conduite">
                        <IconButton
                          onClick={() => handlePlanifierSeance(candidat)}
                          color="success"
                        >
                          <EventIcon />
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

      {/* Dialogue pour planifier une séance de conduite */}
      <SeanceConduiteForm
        open={openSeanceForm}
        onClose={() => {
          setOpenSeanceForm(false);
          setSelectedCandidat(null);
        }}
        onSubmit={handleSubmitSeance}
        moniteurs={[{ id: moniteurId, prenom: "Moniteur", nom: "Principal" }]} // À remplacer par la liste réelle des moniteurs
        candidats={selectedCandidat ? [selectedCandidat] : []}
        initialData={
          selectedCandidat
            ? {
                candidatId: selectedCandidat.id,
              }
            : null
        }
        loading={planificationLoading}
      />
    </Box>
  );
};

export default CandidatsListPage;
