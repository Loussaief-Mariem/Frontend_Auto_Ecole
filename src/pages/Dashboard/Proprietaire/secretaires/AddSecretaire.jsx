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
import { registerSecretaire } from "../../../../api/secretaireService";

const PERMIS_OPTIONS = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];

const AddSecretaire = () => {
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
          role: 1, // SECRETAIRE
        },
      };

      const res = await registerSecretaire(payload);
      console.log(res);
      alert("Secrétaire ajoutée avec succès !");

      // Réinitialiser le formulaire après succès
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        typesPermisCodes: [],
        idAutoEcole: 1,
      });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de l'ajout de la secrétaire !",
      );
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
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" fontWeight={700} color="text.primary">
        Ajouter Secrétaire
      </Typography>

      <TextField
        label="Nom"
        name="nom"
        value={form.nom}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        label="Prénom"
        name="prenom"
        value={form.prenom}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        label="Téléphone"
        name="telephone"
        value={form.telephone}
        onChange={handleChange}
        fullWidth
        required
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
        sx={{ mt: 2 }}
      >
        Ajouter
      </Button>
    </Stack>
  );
};

export default AddSecretaire;
