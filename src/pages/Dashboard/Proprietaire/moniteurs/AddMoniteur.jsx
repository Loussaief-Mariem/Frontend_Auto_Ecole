import { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { registerMoniteur } from "../../../../api/moniteurService";

// Liste des types de permis
const PERMIS_OPTIONS = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];

const AddMoniteur = () => {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    typesPermisCodes: [],
    idAutoEcole: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        typesPermisCodes: form.typesPermisCodes,
        idAutoEcole: form.idAutoEcole,
        compteDto: {
          login: form.email,
          telephone: form.telephone,
          role: 2, // MONITEUR
        },
      };

      const res = await registerMoniteur(payload);
      console.log(res);
      alert("Moniteur ajouté !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout !");
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        maxWidth: 500,
        margin: "0 auto",
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Ajouter Moniteur
      </Typography>

      <TextField
        label="Nom"
        name="nom"
        value={form.nom}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Prénom"
        name="prenom"
        value={form.prenom}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Téléphone"
        name="telephone"
        value={form.telephone}
        onChange={handleChange}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel>Types Permis</InputLabel>
        <Select
          multiple
          name="typesPermisCodes"
          value={form.typesPermisCodes}
          onChange={handleChange}
          input={<OutlinedInput label="Types Permis" />}
          renderValue={(selected) => selected.join(", ")}
        >
          {PERMIS_OPTIONS.map((code) => (
            <MenuItem key={code} value={code}>
              <Checkbox checked={form.typesPermisCodes.indexOf(code) > -1} />
              <ListItemText primary={code} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSubmit}
      >
        Ajouter
      </Button>
    </Stack>
  );
};

export default AddMoniteur;
