import { useState } from "react";
import { Stack, TextField, InputAdornment } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const RegisterAddressSelector = ({ form, setForm, errors }) => {
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
      {/* RUE / ADRESSE */}
      <TextField
        label="Rue / Adresse"
        fullWidth
        value={form.Adresse.Rue || ""}
        onChange={setField("Rue")}
        error={!!errors.Adresse?.Rue}
        helperText={errors.Adresse?.Rue}
        placeholder="Ex: 123 Rue Habib Bourguiba, App 5..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      {/* VILLE */}
      <TextField
        label="Ville"
        fullWidth
        value={form.Adresse.Ville || ""}
        onChange={setField("Ville")}
        error={!!errors.Adresse?.Ville}
        helperText={errors.Adresse?.Ville}
        placeholder="Ex: Tunis, Sousse, Sfax, Nabeul..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
};

export default RegisterAddressSelector;
