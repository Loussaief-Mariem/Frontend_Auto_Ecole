import React, { useState } from "react";
import { TextField, Grid, Box } from "@mui/material";

const CompteForm = ({ setCompte, initialCompte }) => {
  const [compte, setLocalCompte] = useState(
    initialCompte || {
      login: "",
      telephone: "",
      role: 0,
    },
  );

  const handleChange = (e) => {
    const newData = { ...compte, [e.target.name]: e.target.value };
    setLocalCompte(newData);
    setCompte(newData);
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
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompteForm;
