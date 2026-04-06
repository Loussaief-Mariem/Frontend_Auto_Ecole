import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CompteForm from "./CompteForm";
import AdresseForm from "./AdresseForm";
import useCandidatForm from "../hooks/useCandidatForm";
import AdresseService from "../api/adresseService";

const CandidatForm = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    setAdresse,
    setCompte,
    documentsState,
    setDocumentChecked,
    loading,
    error,
  } = useCandidatForm();
  const [paysList, setPaysList] = useState([]);
  const typePermisList = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];
  console.log("useCandidatForm:", useCandidatForm);
  console.log("formData:", formData);
  console.log("formData:", formData.dossier);
  useEffect(() => {
    const fetchPays = async () => {
      try {
        const data = await AdresseService.getPays();
        setPaysList(data);
      } catch (fetchError) {
        console.error("Erreur lors du chargement des pays :", fetchError);
      }
    };
    fetchPays();
  }, []);

  const selectInputSx = {
    width: "100%",
    "& .MuiSelect-select": {
      minHeight: "1.4375em !important",
      display: "flex",
      alignItems: "center",
    },
  };
  const placeholderSx = { color: "text.secondary", fontStyle: "normal" };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper
        sx={{ p: 4, maxWidth: 900, margin: "auto", borderRadius: 2 }}
        elevation={3}
      >
        <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
          Ajouter un nouveau candidat
        </Typography>

        <Divider sx={{ mb: 3 }} />
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Informations personnelles */}
            <Typography variant="h6" fontWeight="medium" color="text.secondary">
              Informations personnelles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom d'époux"
                  name="nomEpoux"
                  value={formData.nomEpoux}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="medium">
                  <InputLabel>Sexe</InputLabel>
                  <Select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    label="Sexe"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          width: 200,
                        },
                      },
                    }}
                    displayEmpty
                    renderValue={(selected) =>
                      selected === "" ? (
                        <Box component="span" sx={placeholderSx}>
                          Sélectionner le sexe
                        </Box>
                      ) : selected === 0 ? (
                        "Masculin"
                      ) : (
                        "Féminin"
                      )
                    }
                    sx={selectInputSx}
                  >
                    <MenuItem value="">Sélectionner le sexe</MenuItem>
                    <MenuItem value={0}>Masculin</MenuItem>
                    <MenuItem value={1}>Féminin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro CIN"
                  name="numeroCIN"
                  value={formData.numeroCIN}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de naissance"
                  value={formData.dateNaissance}
                  onChange={(date) =>
                    handleChange({
                      target: { name: "dateNaissance", value: date },
                    })
                  }
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lieu de naissance"
                  name="lieuDeNaissance"
                  value={formData.lieuDeNaissance}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de délivrance CIN"
                  value={formData.dateDelivranceCIN}
                  onChange={(date) =>
                    handleChange({
                      target: { name: "dateDelivranceCIN", value: date },
                    })
                  }
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Compte */}
            <Typography variant="h6" fontWeight="medium" color="text.secondary">
              Informations de compte
            </Typography>
            <CompteForm setCompte={setCompte} initialCompte={formData.compte} />

            <Divider />

            {/* Adresse */}
            <Typography variant="h6" fontWeight="medium" color="text.secondary">
              Adresse
            </Typography>
            <AdresseForm
              setAdresse={setAdresse}
              initialAdresse={formData.adresse}
              paysOptions={paysList}
            />

            <Divider />

            {/* Documents */}
            <Typography variant="h6" fontWeight="medium" color="text.secondary">
              Documents du dossier
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={documentsState.photoIdentite}
                    onChange={(e) =>
                      setDocumentChecked("photoIdentite", e.target.checked)
                    }
                  />
                }
                label="Photo d'identité"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={documentsState.copieCIN}
                    onChange={(e) =>
                      setDocumentChecked("copieCIN", e.target.checked)
                    }
                  />
                }
                label="Copie CIN"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={documentsState.certificatMedical}
                    onChange={(e) =>
                      setDocumentChecked("certificatMedical", e.target.checked)
                    }
                  />
                }
                label="Certificat médical"
              />
            </FormGroup>

            <Divider />

            {/* Formation & Permis */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Type de permis</InputLabel>
                  <Select
                    name="typePermisCode"
                    value={formData.typePermisCode}
                    onChange={handleChange}
                    label="Type de permis"
                    sx={selectInputSx}
                  >
                    {typePermisList.map((typePermis) => (
                      <MenuItem key={typePermis} value={typePermis}>
                        {typePermis}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="medium">
                  <InputLabel>Type de formation</InputLabel>
                  <Select
                    name="typeFormation"
                    value={formData.typeFormation}
                    onChange={handleChange}
                    label="Type de formation"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          width: 250,
                        },
                      },
                    }}
                    displayEmpty
                    renderValue={(selected) =>
                      selected === "" ? (
                        <Box component="span" sx={placeholderSx}>
                          Sélectionner le type de formation
                        </Box>
                      ) : selected === 0 ? (
                        "Code seulement"
                      ) : selected === 1 ? (
                        "Conduite seulement"
                      ) : (
                        "Formation complète"
                      )
                    }
                    sx={selectInputSx}
                  >
                    <MenuItem value="">
                      Sélectionner le type de formation
                    </MenuItem>
                    <MenuItem value={0}>Code seulement</MenuItem>
                    <MenuItem value={1}>Conduite seulement</MenuItem>
                    <MenuItem value={2}>Formation complète</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Centre d'examen"
                  name="centreExamen"
                  value={formData.centreExamen}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Bouton */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Créer le candidat"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default CandidatForm;
