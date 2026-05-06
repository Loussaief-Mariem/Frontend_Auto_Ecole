// src/pages/Dashboard/Proprietaire/TarifsManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Container,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import * as tarifService from "../../../api/tarifService";
import { TypePermis } from "../../../enums";

const TarifsManagement = () => {
  const { user } = useAuth();
  console.log("TarifsManagement user:", user);
  const autoEcoleId = user.user.autoEcoleId;
  console.log("TarifsManagement autoEcoleId:", autoEcoleId);

  const [tarifs, setTarifs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialiser les tarifs avec des valeurs par défaut (0) pour tous les permis
  const initializeDefaultTarifs = useCallback(() => {
    const defaultTarifs = {};
    TypePermis.forEach((permis) => {
      defaultTarifs[permis.code] = {
        id: null,
        prixSeanceCode: 0,
        prixSeanceConduite: 0,
      };
    });
    return defaultTarifs;
  }, []);

  // Fonction pour charger les tarifs
  const loadTarifs = useCallback(async () => {
    if (!autoEcoleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Initialiser avec des valeurs par défaut (tous à 0)
      const defaultTarifs = initializeDefaultTarifs();

      // Charger les tarifs existants depuis l'API
      const response = await tarifService.getTarifsByAutoEcole(autoEcoleId);

      // Adapter selon la structure de votre API
      let tarifsList = [];
      if (Array.isArray(response)) {
        tarifsList = response;
      } else if (response && Array.isArray(response.data)) {
        tarifsList = response.data;
      } else if (response && response.$values) {
        tarifsList = response.$values;
      }

      // Mettre à jour les tarifs existants dans l'objet par défaut
      const updatedTarifs = { ...defaultTarifs };
      tarifsList.forEach((tarif) => {
        if (updatedTarifs[tarif.typePermisCode]) {
          updatedTarifs[tarif.typePermisCode] = {
            id: tarif.id,
            prixSeanceCode: tarif.prixSeanceCode || 0,
            prixSeanceConduite: tarif.prixSeanceConduite || 0,
          };
        }
      });

      setTarifs(updatedTarifs);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError(
        err.response?.data?.message ||
          "Impossible de charger les tarifs existants",
      );
      // En cas d'erreur, initialiser quand même avec des valeurs par défaut
      setTarifs(initializeDefaultTarifs());
    } finally {
      setLoading(false);
    }
  }, [autoEcoleId, initializeDefaultTarifs]);

  // Chargement initial
  useEffect(() => {
    loadTarifs();
  }, [loadTarifs]);

  const handlePrixChange = (permisCode, field, value) => {
    // Si la valeur est vide, on garde une chaîne vide pour permettre la suppression
    if (value === "") {
      setTarifs((prev) => ({
        ...prev,
        [permisCode]: {
          ...prev[permisCode],
          [field]: "",
        },
      }));
      return;
    }

    // Sinon, on convertit en nombre
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setTarifs((prev) => ({
        ...prev,
        [permisCode]: {
          ...prev[permisCode],
          [field]: numValue,
        },
      }));
    }
  };

  const handleSaveAll = async () => {
    if (!autoEcoleId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Séparer les tarifs à créer et ceux à mettre à jour
      const tarifsToCreate = [];
      const tarifsToUpdate = [];

      Object.entries(tarifs).forEach(([code, values]) => {
        // Convertir les valeurs vides en 0 pour la sauvegarde
        const prixCode =
          values.prixSeanceCode === "" ? 0 : values.prixSeanceCode || 0;
        const prixConduite =
          values.prixSeanceConduite === "" ? 0 : values.prixSeanceConduite || 0;

        // Vérifier si le tarif a des valeurs > 0 pour être sauvegardé
        if (prixCode > 0 || prixConduite > 0) {
          const tarifData = {
            autoEcoleId: autoEcoleId,
            typePermisCode: code,
            prixSeanceCode: prixCode,
            prixSeanceConduite: prixConduite,
          };

          if (values.id) {
            // Si l'ID existe, c'est une mise à jour
            tarifsToUpdate.push({
              id: values.id,
              prixSeanceCode: prixCode,
              prixSeanceConduite: prixConduite,
            });
          } else {
            // Sinon, c'est une création
            tarifsToCreate.push(tarifData);
          }
        }
      });

      // Exécuter les opérations en parallèle
      const promises = [];

      if (tarifsToCreate.length > 0) {
        promises.push(tarifService.createManyTarifs(tarifsToCreate));
      }

      if (tarifsToUpdate.length > 0) {
        promises.push(tarifService.updateManyTarifs(tarifsToUpdate));
      }

      if (promises.length === 0) {
        setError("Aucun tarif à enregistrer (les tarifs sont tous à 0)");
        setSaving(false);
        return;
      }

      await Promise.all(promises);

      setSuccess("Tous les tarifs ont été enregistrés avec succès");
      setTimeout(() => setSuccess(""), 3000);

      // Recharger les données
      await loadTarifs();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement des tarifs",
      );
    } finally {
      setSaving(false);
    }
  };

  const getTarifValue = (permisCode, field) => {
    const value = tarifs[permisCode]?.[field];
    // Retourner la valeur si elle existe, sinon 0
    // Si la valeur est 0, on retourne 0 pour l'affichage
    // Si la valeur est une chaîne vide, on retourne "" pour permettre la suppression
    return value !== undefined && value !== null ? value : 0;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Compter les tarifs configurés (ceux qui ont au moins un prix > 0)
  const configuredTarifsCount = Object.values(tarifs).filter((tarif) => {
    const prixCode =
      tarif.prixSeanceCode === "" ? 0 : tarif.prixSeanceCode || 0;
    const prixConduite =
      tarif.prixSeanceConduite === "" ? 0 : tarif.prixSeanceConduite || 0;
    return prixCode > 0 || prixConduite > 0;
  }).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Titre */}
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ color: "#1e3c72", fontWeight: "bold", mb: 3 }}
      >
        Configuration des tarifs
      </Typography>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Boutons d'action */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadTarifs}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Actualiser
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSaveAll}
          disabled={saving}
          sx={{
            backgroundColor: "#1e3c72",
            "&:hover": { backgroundColor: "#2a5298" },
            textTransform: "none",
            px: 3,
          }}
        >
          {saving ? "Enregistrement..." : "Enregistrer tous les tarifs"}
        </Button>
      </Box>

      {/* Tableau des tarifs */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f2f2f2" }}>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Code Permis
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Tarif Séance Code (DT)
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Tarif Séance Conduite (DT)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TypePermis.map((permis) => (
              <TableRow key={permis.code}>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  {permis.code}
                </TableCell>
                <TableCell align="center">
                  <TextField
                    type="text"
                    value={getTarifValue(permis.code, "prixSeanceCode")}
                    onChange={(e) =>
                      handlePrixChange(
                        permis.code,
                        "prixSeanceCode",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    size="small"
                    inputProps={{
                      style: { textAlign: "center", width: "120px" },
                    }}
                    sx={{ width: "140px" }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    type="text"
                    value={getTarifValue(permis.code, "prixSeanceConduite")}
                    onChange={(e) =>
                      handlePrixChange(
                        permis.code,
                        "prixSeanceConduite",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    size="small"
                    inputProps={{
                      style: { textAlign: "center", width: "120px" },
                    }}
                    sx={{ width: "140px" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TarifsManagement;