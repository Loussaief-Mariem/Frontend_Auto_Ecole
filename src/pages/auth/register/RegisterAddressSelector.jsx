import { useState, useEffect } from "react";
import { Stack, TextField, MenuItem, InputAdornment } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AdresseService from "../../../api/adresseService";

const RegisterAddressSelector = ({
  form,
  setForm,
  errors,
  gouvernoratsList,
}) => {
  const [villesList, setVillesList] = useState([]);

  const [loadingVilles, setLoadingVilles] = useState(false);

  // =========================
  // LOAD DATA (Tunisie directe)
  // =========================
  useEffect(() => {
    const gouvernorat = form.Adresse.Gouvernorat;

    if (!gouvernorat) return;

    const loadVilles = async () => {
      try {
        setLoadingVilles(true);

        const data = await AdresseService.getVillesByPaysEtGouvernorats(
          "Tunisie",
          gouvernorat,
        );

        setVillesList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVilles(false);
      }
    };

    loadVilles();
  }, [form.Adresse.Gouvernorat]);
  // =========================
  // UPDATE FIELD
  // =========================
  const setField = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      Adresse: {
        ...prev.Adresse,
        [key]: e.target.value,
      },
    }));
  };

  return (
    <Stack spacing={2.5}>
      {/* RUE */}
      <TextField
        label="Rue / Adresse"
        fullWidth
        value={form.Adresse.Rue || ""}
        onChange={setField("Rue")}
        error={!!errors.Adresse?.Rue}
        helperText={errors.Adresse?.Rue}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      {/* GOUVERNORAT */}
      <TextField
        select
        label="Gouvernorat"
        fullWidth
        value={form.Adresse.Gouvernorat || ""}
        error={!!errors.Adresse?.Gouvernorat}
        helperText={errors.Adresse?.Gouvernorat}
        onChange={setField("Gouvernorat")}
      >
        <MenuItem value="">Sélectionner</MenuItem>
        {gouvernoratsList.map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </TextField>

      {/* VILLE */}
      <TextField
        select
        label="Ville"
        fullWidth
        value={form.Adresse.Ville || ""}
        onChange={setField("Ville")}
        error={!!errors.Adresse?.Ville}
        helperText={errors.Adresse?.Ville}
        disabled={!form.Adresse.Gouvernorat}
      >
        <MenuItem value="">Sélectionner</MenuItem>
        {villesList.map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default RegisterAddressSelector;
