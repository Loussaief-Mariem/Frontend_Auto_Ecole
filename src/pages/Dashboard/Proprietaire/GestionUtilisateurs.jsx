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
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material"; //
import userManagementService from "../../../api/userManagementService";
import PaginationComponent from "../../../components/common/pagination/PaginationComponent";
import AddUser from "./AddUser";

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
    recherche: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const tabs = [
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
    setFilters({ statut: "TOUS", recherche: "" });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold">
          Gestion du personnel
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Ajouter du personnel
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Personnel"
            count={(totals.moniteurs || 0) + (totals.secretaires || 0)}
            icon={<PeopleIcon />}
            color="#1976d2"
            loading={loadingTotals}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Moniteurs"
            count={totals.moniteurs}
            icon={<CarIcon />}
            color="#ed6c02"
            loading={loadingTotals}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
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
                  <MenuItem value="INACTIF">Inactifs</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Optional secondary filter placeholder */}
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
              <TableCell>Statut</TableCell>
              <TableCell>Types permis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : usersData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
                  <TableCell>{user.telephone || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.statut}
                      size="small"
                      color={getStatusColor(user.statut)}
                    />
                  </TableCell>
                  <TableCell>
                    {user.typesPermisCodes?.join(", ") || "-"}
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

      {/* Modal pour Ajouter du Personnel */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1, pt: 3 }}>
          Ajouter un membre du personnel
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <AddUser onSuccess={() => { setOpenAddDialog(false); handleRefresh(); }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUtilisateurs;
