import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  debounce,
} from "@mui/material";
import {
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  DriveEta as CarIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import userManagementService from "../../../api/userManagementService";
import PaginationComponent from "../../../components/common/pagination/PaginationComponent";

// Composant pour les cartes de statistiques
const StatCard = ({ title, count, icon, color, loading }) => (
  <Card sx={{ flex: 1, bgcolor: color, color: "white" }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={30} color="inherit" />
          ) : (
            <Typography variant="h4" fontWeight="bold">
              {count}
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: 40, opacity: 0.8 }}>{icon}</Box>
      </Stack>
    </CardContent>
  </Card>
);

const GestionUtilisateurs = () => {
  const [usersData, setUsersData] = useState([]);
  // État pour la pagination (page commence à 1)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({
    total: 0,
    candidats: 0,
    moniteurs: 0,
    secretaires: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    statut: "TOUS",
    archive: "TOUS",
    recherche: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { label: "Tous", value: "all", icon: <PeopleIcon />, color: "#1976d2" },
    {
      label: "Candidats",
      value: "candidats",
      icon: <PeopleIcon />,
      color: "#2e7d32",
    },
    {
      label: "Moniteurs",
      value: "moniteurs",
      icon: <CarIcon />,
      color: "#ed6c02",
    },
    {
      label: "Secrétaires",
      value: "secretaires",
      icon: <AdminIcon />,
      color: "#9c27b0",
    },
  ];

  const autoEcoleId = localStorage.getItem("autoEcoleId") || 1;

  const loadTotals = async () => {
    try {
      setLoadingTotals(true);
      const totalsData = await userManagementService.getTotals(autoEcoleId);
      setTotals(totalsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTotals(false);
    }
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading users with filters:", filters);
      const tabValue = tabs[currentTab].value;

      let response;
      switch (tabValue) {
        case "all":
          response = await userManagementService.getAllUsersPaginated(
            autoEcoleId,
            page,
            pageSize,
            filters,
          );
          break;
        case "candidats":
          response = await userManagementService.getCandidatsPaginated(
            autoEcoleId,
            page,
            pageSize,
            filters,
          );
          break;
        case "moniteurs":
          response = await userManagementService.getMoniteursPaginated(
            autoEcoleId,
            page,
            pageSize,
            filters,
          );
          break;
        case "secretaires":
          response = await userManagementService.getSecretairesPaginated(
            autoEcoleId,
            page,
            pageSize,
            filters,
          );
          break;
        default:
          return;
      }

      setUsersData(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, currentTab, filters, autoEcoleId]);

  useEffect(() => {
    loadTotals();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, recherche: value }));
      setPage(1); // Reset to first page when searching
    }, 500),
    [],
  );

  const handleFilterChange = (key, value) => {
    if (key === "recherche") {
      debouncedSearch(value);
    } else {
      setFilters({ ...filters, [key]: value });
      setPage(1); // Reset to first page when filter changes
    }
  };

  const resetFilters = () => {
    setFilters({ statut: "TOUS", archive: "TOUS", recherche: "" });
    setPage(1);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1); // Reset to first page when tab changes
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when page size changes
  };

  const handleRefresh = () => {
    loadUsers();
    loadTotals();
  };
  console.log("selectedUser:", selectedUser);
  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      // Appel sans motif (ou avec motif par défaut)
      await userManagementService.bloquerUtilisateur(
        selectedUser,
        "Blocage par administrateur",
      );
      setSuccess(
        `Compte ${selectedUser.nom} ${selectedUser.prenom} bloqué avec succès`,
      );
      setOpenBlockDialog(false);
      loadUsers();
      loadTotals();
      console.log("selectedUser:", selectedUser);
    } catch (err) {
      setError("Erreur lors du blocage du compte");
      console.error(err);
    }
  };

  const handleUnblockUser = async (user) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment débloquer le compte de ${user.nom} ${user.prenom} ?`,
      )
    )
      return;
    try {
      await userManagementService.debloquerUtilisateur(user);
      setSuccess(`Compte ${user.nom} ${user.prenom} débloqué avec succès`);
      loadUsers();
      loadTotals();
      console.log("selectedUser:", selectedUser);
    } catch (err) {
      setError("Erreur lors du déblocage du compte");
      console.error(err);
    }
  };

  const handleArchiveUser = async (user) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment archiver ${user.nom} ${user.prenom} ?`,
      )
    )
      return;
    try {
      await userManagementService.archiverUtilisateur(user);
      setSuccess(`Utilisateur ${user.nom} ${user.prenom} archivé avec succès`);
      loadUsers();
      loadTotals();
      console.log("selectedUser:", selectedUser);
    } catch (err) {
      setError("Erreur lors de l'archivage");
      console.error(err);
    }
  };

  const handleUnarchiveUser = async (user) => {
    if (
      !window.confirm(
        `Voulez-vous vraiment désarchiver ${user.nom} ${user.prenom} ?`,
      )
    )
      return;
    try {
      await userManagementService.desarchiverUtilisateur(user);
      setSuccess(
        `Utilisateur ${user.nom} ${user.prenom} désarchivé avec succès`,
      );
      loadUsers();
      loadTotals();
      console.log("User:", user);
    } catch (err) {
      setError("Erreur lors du désarchivage");
      console.error(err);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "ACTIF":
        return "success";
      case "BLOQUÉ":
        return "error";
      case "INACTIF":
        return "warning";
      case "ARCHIVÉ":
        return "default";
      default:
        return "warning";
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case "Moniteur":
        return "Moniteur";
      case "Secretaire":
        return "Secrétaire";
      case "Candidat":
        return "Candidat";
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Moniteur":
        return "warning";
      case "Secretaire":
        return "secondary";
      case "Candidat":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Gestion des utilisateurs
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total"
            count={totals.total}
            icon={<PeopleIcon />}
            color="#1976d2"
            loading={loadingTotals}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Candidats"
            count={totals.candidats}
            icon={<PeopleIcon />}
            color="#2e7d32"
            loading={loadingTotals}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Moniteurs"
            count={totals.moniteurs}
            icon={<CarIcon />}
            color="#ed6c02"
            loading={loadingTotals}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Secrétaires"
            count={totals.secretaires}
            icon={<AdminIcon />}
            color="#9c27b0"
            loading={loadingTotals}
          />
        </Grid>
      </Grid>

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filtres et recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: showFilters ? 2 : 0,
          }}
        >
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
          >
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Button>
          <TextField
            placeholder="Rechercher par nom, prénom ou email"
            size="small"
            value={filters.recherche}
            onChange={(e) => handleFilterChange("recherche", e.target.value)}
            sx={{ ml: 2, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            Actualiser
          </Button>
        </Box>

        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.statut}
                  label="Statut"
                  onChange={(e) => handleFilterChange("statut", e.target.value)}
                >
                  <MenuItem value="TOUS">Tous</MenuItem>
                  <MenuItem value="ACTIF">Actifs</MenuItem>
                  <MenuItem value="BLOQUÉ">Bloqués</MenuItem>
                  <MenuItem value="INACTIF">Inactifs</MenuItem>
                  <MenuItem value="ARCHIVÉ">Archivés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Archive</InputLabel>
                <Select
                  value={filters.archive}
                  label="Archive"
                  onChange={(e) =>
                    handleFilterChange("archive", e.target.value)
                  }
                >
                  <MenuItem value="TOUS">Tous</MenuItem>
                  <MenuItem value="NON_ARCHIVÉ">Non archivés</MenuItem>
                  <MenuItem value="ARCHIVÉ">Archivés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="text" onClick={resetFilters} size="small">
                Réinitialiser les filtres
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              {currentTab === 0 && <TableCell>Rôle</TableCell>}
              <TableCell>Statut</TableCell>
              {(currentTab === 2 || currentTab === 0) && (
                <TableCell>Types permis</TableCell>
              )}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : usersData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    Aucun utilisateur trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usersData.map((user) => (
                <TableRow key={`${user.role}-${user.id}`}>
                  <TableCell>{user.nom}</TableCell>
                  <TableCell>{user.prenom}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telephone}</TableCell>
                  {currentTab === 0 && (
                    <TableCell>
                      <Chip
                        label={formatRole(user.role)}
                        size="small"
                        color={getRoleColor(user.role)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={user.statut}
                      size="small"
                      color={getStatusColor(user.statut)}
                    />
                  </TableCell>
                  {(currentTab === 2 || currentTab === 0) && (
                    <TableCell>
                      {user.typesPermisCodes?.join(", ") || "-"}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    {!user.archive && user.statut !== "ARCHIVÉ" ? (
                      <>
                        {user.statut === "ACTIF" && (
                          <Tooltip title="Bloquer le compte">
                            <IconButton
                              color="error"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenBlockDialog(true);
                              }}
                              size="small"
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {user.statut === "BLOQUÉ" && (
                          <Tooltip title="Débloquer le compte">
                            <IconButton
                              color="success"
                              onClick={() => handleUnblockUser(user)}
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Archiver">
                          <IconButton
                            color="warning"
                            onClick={() => handleArchiveUser(user)}
                            size="small"
                          >
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Désarchiver">
                        <IconButton
                          color="info"
                          onClick={() => handleUnarchiveUser(user)}
                          size="small"
                        >
                          <UnarchiveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Utilisation du composant PaginationComponent */}
        <PaginationComponent
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </TableContainer>

      {/* Dialogue de confirmation de blocage simplifié */}
      <Dialog
        open={openBlockDialog}
        onClose={() => setOpenBlockDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
          Confirmer le blocage
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir bloquer le compte de{" "}
            <strong>
              {selectedUser?.nom} {selectedUser?.prenom}
            </strong>{" "}
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            L'utilisateur ne pourra plus se connecter à son compte. Cette action
            peut être inversée ultérieurement.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenBlockDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleBlockUser}
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
          >
            Bloquer le compte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUtilisateurs;
