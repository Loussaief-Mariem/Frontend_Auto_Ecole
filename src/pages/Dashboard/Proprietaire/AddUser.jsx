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
  Alert,
  CircularProgress,
  FormHelperText,
} from "@mui/material";

import { registerSecretaire } from "../../../api/secretaireService";
import { registerMoniteur } from "../../../api/moniteurService";

const PERMIS_OPTIONS = ["A", "AA", "B", "BE", "C", "CE", "D", "DE", "G", "H"];

// Validation functions
const validateForm = (form) => {
  const errors = {};

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{8}$/;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;

  // Nom validation
  if (!form.nom?.trim()) {
    errors.nom = "Le nom est obligatoire";
  } else if (!nameRegex.test(form.nom.trim())) {
    errors.nom = "Le nom doit contenir entre 2 et 50 caractères alphabétiques";
  }

  // Prénom validation
  if (!form.prenom?.trim()) {
    errors.prenom = "Le prénom est obligatoire";
  } else if (!nameRegex.test(form.prenom.trim())) {
    errors.prenom =
      "Le prénom doit contenir entre 2 et 50 caractères alphabétiques";
  }

  // Email validation
  if (!form.email?.trim()) {
    errors.email = "L'email est obligatoire";
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Format d'email invalide (ex: nom@domaine.com)";
  }

  // Téléphone validation
  if (!form.telephone?.trim()) {
    errors.telephone = "Le téléphone est obligatoire";
  } else if (!phoneRegex.test(form.telephone)) {
    errors.telephone = "Le téléphone doit contenir exactement 8 chiffres";
  }

  // Role validation
  if (!form.role) {
    errors.role = "Veuillez sélectionner un rôle";
  }

  // Types permis validation
  if (
    (form.role === "1" || form.role === "2") &&
    (!form.typesPermisCodes || form.typesPermisCodes.length === 0)
  ) {
    errors.typesPermisCodes =
      "Veuillez sélectionner au moins un type de permis";
  }

  return errors;
};

const AddUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // 🔥 récupérer user depuis localStorage with safety checks
  let autoEcoleId = null;
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const storedUser = JSON.parse(userData);
      console.log("Complete stored user data:", storedUser);
      // Handle different possible structures
      autoEcoleId = storedUser.user?.autoEcoleId || storedUser.autoEcoleId;
      console.log("Auto-école ID:", autoEcoleId);

      if (!autoEcoleId) {
        console.error("No autoEcoleId found in user data:", storedUser);
      }
    } else {
      console.error("No user data in localStorage");
    }
  } catch (err) {
    console.error("Error parsing user from localStorage:", err);
    setError(
      "Erreur de lecture des données utilisateur. Veuillez vous reconnecter.",
    );
  }

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    typesPermisCodes: [],
    role: "", // will store as string but send as number
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }

    // Clear general error when user starts typing
    if (error) setError(null);
  };

  const handleBlur = (fieldName) => {
    // Validate specific field on blur
    const errors = validateForm(form);
    if (errors[fieldName]) {
      setFieldErrors({ ...fieldErrors, [fieldName]: errors[fieldName] });
    } else {
      setFieldErrors({ ...fieldErrors, [fieldName]: undefined });
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const errors = validateForm(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // Set general error message
      const errorMessages = Object.values(errors).join(", ");
      setError(`Veuillez corriger les erreurs suivantes : ${errorMessages}`);
      return;
    }

    if (!autoEcoleId) {
      setError("Auto-école non trouvée. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Submitting form with data:", form);
    console.log("Auto-école ID being used:", autoEcoleId);
    console.log("Auto-école ID being used:", parseInt(autoEcoleId));

    try {
      // Prepare payload matching your example
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        typesPermisCodes: form.typesPermisCodes,
     
        telephone: form.telephone.trim(),
        compteDto: {
          login: form.email.trim(),
          role: parseInt(form.role),
             autoEcoleId: parseInt(autoEcoleId),
        },
      };
      console.log("Prepared payload:", payload);
      console.log("Payload to submit:", JSON.stringify(payload, null, 2));

      let res;

      if (form.role === "1") {
        res = await registerSecretaire(payload);
        console.log("Secrétaire registration response:", res);
        setSuccessMessage("Secrétaire ajoutée avec succès !");
        setSuccess(true);
      } else if (form.role === "2") {
        res = await registerMoniteur(payload);
        console.log("Moniteur registration response:", res);
        setSuccessMessage("Moniteur ajouté avec succès !");
        setSuccess(true);
      }

      console.log("Full response:", res);

      // Reset form on success
      setForm({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        typesPermisCodes: [],
        role: "",
      });
      setFieldErrors({});

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Registration error - Full error object:", err);

      // Better error handling to show actual backend error
      let errorMessage = "Erreur lors de l'ajout !";

      if (err.response) {
        // Server responded with error
        console.error("Error response status:", err.response.status);
        console.error("Error response data:", err.response.data);

        // Extract error message from different possible formats
        if (err.response.data) {
          if (typeof err.response.data === "string") {
            errorMessage = err.response.data;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.title) {
            errorMessage = err.response.data.title;
          } else if (err.response.data.errors) {
            // Handle validation errors
            const validationErrors = Object.values(
              err.response.data.errors,
            ).flat();
            errorMessage = validationErrors.join(", ");
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        }
      } else if (err.request) {
        // Request was made but no response
        console.error("No response received:", err.request);
        errorMessage =
          "Impossible de contacter le serveur. Vérifiez votre connexion et que le backend est démarré.";
      } else {
        // Something else happened
        console.error("Error message:", err.message);
        errorMessage = err.message || "Erreur inconnue";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
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
      <Typography variant="h5" fontWeight={700}>
        Ajouter Utilisateur
      </Typography>

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {error}
          </Typography>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Nom */}
      <TextField
        label="Nom"
        name="nom"
        value={form.nom}
        onChange={handleChange}
        onBlur={() => handleBlur("nom")}
        error={!!fieldErrors.nom}
        helperText={fieldErrors.nom}
        fullWidth
        required
        disabled={loading}
      />

      {/* Prénom */}
      <TextField
        label="Prénom"
        name="prenom"
        value={form.prenom}
        onChange={handleChange}
        onBlur={() => handleBlur("prenom")}
        error={!!fieldErrors.prenom}
        helperText={fieldErrors.prenom}
        fullWidth
        required
        disabled={loading}
      />

      {/* Email */}
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        onBlur={() => handleBlur("email")}
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
        fullWidth
        required
        disabled={loading}
      />

      {/* Téléphone */}
      <TextField
        label="Téléphone"
        name="telephone"
        value={form.telephone}
        onChange={handleChange}
        onBlur={() => handleBlur("telephone")}
        error={!!fieldErrors.telephone}
        helperText={fieldErrors.telephone}
        fullWidth
        required
        disabled={loading}
        inputProps={{ maxLength: 8 }}
      />

      {/* ROLE */}
      <FormControl fullWidth error={!!fieldErrors.role}>
        <InputLabel>Rôle *</InputLabel>
        <Select
          name="role"
          value={form.role}
          onChange={handleChange}
          onBlur={() => handleBlur("role")}
          disabled={loading}
        >
          <MenuItem value="1">Secrétaire</MenuItem>
          <MenuItem value="2">Moniteur</MenuItem>
        </Select>
        {fieldErrors.role && (
          <FormHelperText>{fieldErrors.role}</FormHelperText>
        )}
      </FormControl>

      {/* Types permis - Show for both roles with different helper text */}
      <FormControl fullWidth error={!!fieldErrors.typesPermisCodes}>
        <InputLabel>Types Permis *</InputLabel>
        <Select
          multiple
          name="typesPermisCodes"
          value={form.typesPermisCodes}
          onChange={handleChange}
          onBlur={() => handleBlur("typesPermisCodes")}
          input={<OutlinedInput label="Types Permis *" />}
          renderValue={(selected) => selected.join(", ")}
          disabled={loading}
        >
          {PERMIS_OPTIONS.map((code) => (
            <MenuItem key={code} value={code}>
              <Checkbox checked={form.typesPermisCodes.indexOf(code) > -1} />
              <ListItemText primary={code} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {fieldErrors.typesPermisCodes ||
            (form.role === "1"
              ? "Sélectionnez les types de permis que la secrétaire peut enseigner pour les séances de code"
              : form.role === "2"
                ? "Sélectionnez les types de permis que le moniteur peut enseigner"
                : "Sélectionnez les types de permis")}
        </FormHelperText>
      </FormControl>

      {/* Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Ajouter"}
      </Button>
    </Stack>
  );
};

export default AddUser;
