import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import AdresseService from "../../../api/adresseService";

const AdresseForm = ({
  setAdresse,
  initialAdresse,
  paysOptions = [],
  fieldErrors = {},
  clearFieldError,
}) => {
  const [adresse, setLocalAdresse] = useState(
    initialAdresse || { pays: "Tunisie", gouvernorat: "", ville: "", rue: "" },
  );

  const [gouvernoratsList, setGouvernoratsList] = useState([]);
  const [villesList, setVillesList] = useState([]);
  const selectInputSx = {
    width: "100%",
    "& .MuiSelect-select": {
      minHeight: "1.4375em !important",
      display: "flex",
      alignItems: "center",
    },
  };
  const placeholderSx = { color: "text.secondary", fontStyle: "normal" };

  // Charger les gouvernorats quand le pays change
  useEffect(() => {
    if (!adresse.pays) return;
    const fetchGouvernorats = async () => {
      try {
        const data = await AdresseService.getGouvernoratsByPays(adresse.pays);
        setGouvernoratsList(data);
      } catch (error) {
        console.error("Erreur lors du chargement des gouvernorats :", error);
      }
    };
    fetchGouvernorats();
  }, [adresse.pays]);

  // Charger les villes quand le pays ou gouvernorat change
  useEffect(() => {
    if (!adresse.pays || !adresse.gouvernorat) return;
    const fetchVilles = async () => {
      try {
        const data = await AdresseService.getVillesByPaysEtGouvernorats(
          adresse.pays,
          adresse.gouvernorat,
        );
        setVillesList(data);
      } catch (error) {
        console.error("Erreur lors du chargement des villes :", error);
      }
    };
    fetchVilles();
  }, [adresse.pays, adresse.gouvernorat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...adresse, [name]: value };

    // Reset dépendances si le pays ou gouvernorat change
    if (name === "pays") {
      newData.gouvernorat = "";
      newData.ville = "";
    }
    if (name === "gouvernorat") {
      newData.ville = "";
    }

    setLocalAdresse(newData);
    setAdresse(newData);
    if (typeof clearFieldError === "function" && name) {
      clearFieldError(name);
      if (name === "pays") {
        clearFieldError("gouvernorat");
        clearFieldError("ville");
      }
      if (name === "gouvernorat") {
        clearFieldError("ville");
      }
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            required
            variant="outlined"
            size="medium"
            error={!!fieldErrors.pays}
          >
            <InputLabel>Pays</InputLabel>
            <Select
              name="pays"
              value={adresse.pays}
              onChange={handleChange}
              label="Pays"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              displayEmpty
              renderValue={(selected) =>
                selected === "" ? (
                  <Box component="span" sx={placeholderSx}>
                    Sélectionner un pays
                  </Box>
                ) : (
                  selected
                )
              }
              sx={selectInputSx}
            >
              <MenuItem value="">Sélectionner un pays</MenuItem>
              {paysOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.pays ? (
              <FormHelperText>{fieldErrors.pays}</FormHelperText>
            ) : null}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            required
            variant="outlined"
            size="medium"
            disabled={!adresse.pays}
            error={!!fieldErrors.gouvernorat}
          >
            <InputLabel>Gouvernorat</InputLabel>
            <Select
              name="gouvernorat"
              value={adresse.gouvernorat}
              onChange={handleChange}
              label="Gouvernorat"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                },
              }}
              displayEmpty
              renderValue={(selected) =>
                selected === "" ? (
                  <Box component="span" sx={placeholderSx}>
                    Sélectionner un gouvernorat
                  </Box>
                ) : (
                  selected
                )
              }
              sx={selectInputSx}
            >
              <MenuItem value="">Sélectionner un gouvernorat</MenuItem>
              {gouvernoratsList.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.gouvernorat ? (
              <FormHelperText>{fieldErrors.gouvernorat}</FormHelperText>
            ) : null}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            required
            variant="outlined"
            size="medium"
            disabled={!adresse.gouvernorat}
            error={!!fieldErrors.ville}
          >
            <InputLabel>Ville</InputLabel>
            <Select
              name="ville"
              value={adresse.ville}
              onChange={handleChange}
              label="Ville"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                },
              }}
              displayEmpty
              renderValue={(selected) =>
                selected === "" ? (
                  <Box component="span" sx={placeholderSx}>
                    Sélectionner une ville
                  </Box>
                ) : (
                  selected
                )
              }
              sx={selectInputSx}
            >
              <MenuItem value="">Sélectionner une ville</MenuItem>
              {villesList.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.ville ? (
              <FormHelperText>{fieldErrors.ville}</FormHelperText>
            ) : null}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Rue"
            name="rue"
            value={adresse.rue}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            error={!!fieldErrors.rue}
            helperText={fieldErrors.rue || ""}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdresseForm;
