import React, { useState } from "react";
import { TextField, Grid, Box } from "@mui/material";

const CompteForm = ({
  setCompte,
  initialCompte,
  fieldErrors = {},
  clearFieldError,
}) => {
  const [compte, setLocalCompte] = useState(
    initialCompte || {
      login: "",
      telephone: "",
      role: 0,
    },
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...compte, [name]: value };
    setLocalCompte(newData);
    setCompte(newData);
    if (typeof clearFieldError === "function" && name) {
      clearFieldError(name);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            name="login"
            value={compte.login}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            error={!!fieldErrors.login}
            helperText={fieldErrors.login || ""}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Téléphone"
            name="telephone"
            value={compte.telephone}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            error={!!fieldErrors.telephone}
            helperText={fieldErrors.telephone || ""}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompteForm;
