// RegisterPage.jsx - Version corrigée
import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Stack,
  Link,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { register } from "../../api/authService";

import { authPageSx, authSubmitSx } from "./authStyles";
import {
  initialRegisterForm,
  REGISTER_STEPS,
} from "./register/registerInitialState";
import RegisterStepFields from "./register/RegisterStepFields";
import { validateRegisterStep } from "../../validation/registerValidation";

import AdresseService from "../../api/adresseService";

const registerPaperSx = {
  width: "100%",
  maxWidth: { xs: "100%", sm: 480 },
  p: { xs: 2.5, sm: 4 },
  pt: { xs: 5, sm: 4 },
  borderRadius: 3,
  bgcolor: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 25px 50px -12px rgba(23, 37, 84, 0.45)",
  position: "relative",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialRegisterForm);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errors, setErrors] = useState({});
  const [gouvernoratsList, setGouvernoratsList] = useState([]);

  //  CORRECT : useEffect DANS le composant
  useEffect(() => {
    const loadGouvernorats = async () => {
      try {
        const data = await AdresseService.getGouvernoratsByPays("Tunisie");
        setGouvernoratsList(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadGouvernorats();
  }, []);

  const lastStep = REGISTER_STEPS.length - 1;

  // Activation du bouton "Créer Auto-École" uniquement quand l'étape Adresse est valide.
  const lastStepValidationErrors = validateRegisterStep(lastStep, form);
  const canSubmitLastStep = Object.keys(lastStepValidationErrors).length === 0;
  const handleNext = () => {
    // On valide l'étape courante avant d'aller à la suivante.
    setOpenSnackbar(false);
    setErrorMessage("");

    const validationErrors = validateRegisterStep(activeStep, form);

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      setActiveStep((s) => s + 1);
    } else {
      setErrors(validationErrors);
    }
  };

  const handlePrev = () => {
    // On évite qu'un message d'erreur de submit reste affiché pendant la navigation.
    setOpenSnackbar(false);
    setErrorMessage("");
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterStep(4, form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage(
        "Veuillez compléter correctement tous les champs requis.",
      );
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        NomProp: form.NomProp,
        PrenomProp: form.PrenomProp,
        NomEcole: form.NomEcole,
        CodeEtablissement: form.CodeEtablissement,
        IdentifiantFiscal: form.IdentifiantFiscal,
        Email: form.Email,
        Telephone: form.Telephone,
        Login: form.Email,

        TypePermisCode: form.TypePermisCode,

        Adresse: {
          Rue: form.Adresse.Rue,
          Ville: form.Adresse.Ville,
          Gouvernorat: form.Adresse.Gouvernorat,
          Pays: "Tunisie",
        },
      };

      await register(payload);

      alert("Auto-école créée avec succès !");
      navigate("/login");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Erreur lors de l'inscription",
      );
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        ...authPageSx,
        alignItems: "flex-start",
        py: { xs: 2, sm: 4 },
      }}
    >
      <Paper elevation={0} sx={registerPaperSx}>
        <IconButton
          onClick={() => navigate("/")}
          aria-label="Retour à l'accueil"
          sx={{ position: "absolute", top: 12, left: 12 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center" px={2}>
          Créer une Auto-École
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={2}
          px={2}
        >
          Inscription propriétaire — étape {activeStep + 1} sur{" "}
          {REGISTER_STEPS.length}
        </Typography>

        <Box
          sx={{
            overflowX: "auto",
            mb: 2,
            mx: -0.5,
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 6 },
          }}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              minWidth: { xs: 340, sm: "100%" },
              px: { xs: 0.5, sm: 1 },
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.62rem", sm: "0.8rem" },
                mt: 0.5,
              },
              "& .MuiStepIcon-root": {
                fontSize: { xs: "1.05rem", sm: "1.35rem" },
              },
            }}
          >
            {REGISTER_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {openSnackbar && errorMessage ? (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              setOpenSnackbar(false);
              setErrorMessage("");
            }}
          >
            {errorMessage}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              minHeight: { xs: 220, sm: 260 },
              mb: 2,
            }}
          >
            <RegisterStepFields
              step={activeStep}
              form={form}
              setForm={setForm}
              errors={errors}
              gouvernoratsList={gouvernoratsList}
            />
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            {activeStep > 0 && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                sx={{ flex: 1 }}
                onClick={handlePrev}
                disabled={loading}
              >
                Précédent
              </Button>
            )}
            {activeStep < lastStep ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                sx={{ ...authSubmitSx, flex: 1 }}
                disabled={loading}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                sx={{ ...authSubmitSx, flex: 1 }}
                disabled={loading || !canSubmitLastStep}
              >
                {loading ? "Création en cours..." : "Créer Auto-École"}
              </Button>
            )}
          </Stack>
        </form>

        <Typography textAlign="center" mt={2.5} fontSize={14}>
          Déjà un compte ?{" "}
          <Link component={RouterLink} to="/login" fontWeight={700}>
            Connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
