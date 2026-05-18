import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Chip,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EventIcon from "@mui/icons-material/Event";

import { getCandidatByCin, reinscrireCandidat } from "../../../api/candidatService";
import { getMoniteursByAutoEcole } from "../../../api/moniteurService";

const typePermisList = [
  { code: "A", label: "Permis A - Moto", description: "Motos légères" },
  { code: "AA", label: "Permis AA - Moto", description: "Motos puissantes" },
  { code: "B", label: "Permis B - Voiture", description: "Véhicules légers" },
  { code: "BE", label: "Permis BE - Remorque", description: "Voiture avec remorque" },
  { code: "C", label: "Permis C - Camion", description: "Poids lourds" },
  { code: "CE", label: "Permis CE", description: "Camion avec remorque" },
  { code: "D", label: "Permis D - Bus", description: "Transports en commun" },
  { code: "DE", label: "Permis DE", description: "Bus avec remorque" },
  { code: "G", label: "Permis G", description: "Véhicules agricoles" },
  { code: "H", label: "Permis H", description: "Engins spéciaux" },
];

const formationTypes = [
  { value: 0, label: "📚 Code seulement", description: "Préparation et passage du code" },
  { value: 1, label: "🚗 Conduite seulement", description: "Préparation et passage de la conduite" },
  { value: 2, label: "✨ Formation complète", description: "Code + Conduite" },
];

const ReinscrireCandidatModal = ({ open, onClose, autoEcoleId, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cin, setCin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidat, setCandidat] = useState(null);
  const [moniteurs, setMoniteurs] = useState([]);
  const [cinError, setCinError] = useState("");

  const [formData, setFormData] = useState({
    typePermisCode: "B",
    typeFormation: "",
    moniteurId: "",
    dateObtentionCode: null,
    email: "",
    telephone: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    telephone: false,
    typeFormation: false,
    moniteurId: false,
  });

  useEffect(() => {
    if (open && autoEcoleId) {
      getMoniteursByAutoEcole(autoEcoleId)
        .then((data) => setMoniteurs(data))
        .catch((err) => console.error("Erreur chargement moniteurs:", err));
    } else {
      resetForm();
    }
  }, [open, autoEcoleId]);

  const resetForm = () => {
    setActiveStep(0);
    setCin("");
    setCandidat(null);
    setError(null);
    setCinError("");
    setFormData({
      typePermisCode: "B",
      typeFormation: "",
      moniteurId: "",
      dateObtentionCode: null,
      email: "",
      telephone: "",
    });
    setTouched({
      email: false,
      telephone: false,
      typeFormation: false,
      moniteurId: false,
    });
  };

  const handleSearch = async () => {
    if (!cin || cin.length !== 8) {
      setCinError("Le CIN doit contenir exactement 8 chiffres");
      return;
    }
    setCinError("");
    setLoading(true);
    setError(null);

    try {
      const data = await getCandidatByCin(cin, autoEcoleId);
      
      const hasActiveContract = data.contrats?.some(c => c.etatContrat === 0 || c.etatContrat === "ACTIF");
      if (hasActiveContract) {
        setError("❌ Un contrat actif existe déjà pour ce candidat. Impossible de réinscrire.");
        setLoading(false);
        return;
      }

      setCandidat(data);
      setFormData(prev => ({
        ...prev,
        email: data.compte?.login || "",
        telephone: data.telephone || "",
      }));
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Aucun candidat trouvé avec ce numéro CIN.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dateObtentionCode: date });
  };

  const validateForm = () => {
    if (formData.typeFormation === "" || formData.typeFormation === null) {
      setError("Veuillez sélectionner un type de formation");
      return false;
    }
    if (!formData.moniteurId) {
      setError("Veuillez sélectionner un moniteur référent");
      return false;
    }
    if ((formData.typeFormation === 1 || formData.typeFormation === 2) && !formData.dateObtentionCode) {
      setError("La date d'obtention du code est requise pour cette formation");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Veuillez saisir une adresse email valide");
      return false;
    }
    if (!formData.telephone || !/^\d{8}$/.test(formData.telephone)) {
      setError("Le numéro de téléphone doit contenir 8 chiffres");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: formData.email,
        telephone: formData.telephone,
        autoEcoleId: autoEcoleId,
        typePermisCode: formData.typePermisCode,
        typeFormation: parseInt(formData.typeFormation),
        moniteurId: parseInt(formData.moniteurId),
        dateObtentionCode: formData.dateObtentionCode 
          ? format(new Date(formData.dateObtentionCode), "yyyy-MM-dd'T'HH:mm:ss") 
          : null,
      };

      await reinscrireCandidat(candidat.id, payload);
      onSuccess("✅ Réinscription effectuée avec succès !");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Erreur lors de la réinscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Recherche du candidat", "Informations de réinscription"];

  return (
    <Dialog 
      open={open} 
      onClose={!loading && onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold" color="primary">
            Réinscrire un candidat
          </Typography>
          {!loading && (
            <IconButton onClick={onClose} size="small">
              <CancelIcon />
            </IconButton>
          )}
        </Box>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Veuillez saisir le numéro CIN du candidat pour vérifier son éligibilité à la réinscription.
              </Typography>
              
              <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
                <TextField
                  fullWidth
                  label="Numéro CIN"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  error={!!cinError}
                  helperText={cinError || "Format: 8 chiffres (ex: 12345678)"}
                  placeholder="12345678"
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Paper>
            </Box>
          )}

          {activeStep === 1 && candidat && (
            <Box>
              {/* Carte candidat */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  color: "white",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <PersonIcon sx={{ fontSize: 50, opacity: 0.9 }} />
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {candidat.prenom} {candidat.nom}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      CIN: {candidat.numeroCIN}
                    </Typography>
                    {candidat.dateNaissance && (
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Né(e) le: {format(new Date(candidat.dateNaissance), "dd/MM/yyyy")}
                      </Typography>
                    )}
                  </Box>
                  <Chip 
                    label="Éligible" 
                    icon={<CheckCircleIcon />} 
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                </Box>
              </Paper>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom fontWeight="bold">
                Informations de contact
              </Typography>
              
              {/* Champs en vertical - un par ligne */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Adresse email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  error={touched.email && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                  helperText={touched.email && !formData.email && "L'email est requis"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: "56px",
                    },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Numéro de téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("telephone")}
                  error={touched.telephone && (!formData.telephone || !/^\d{8}$/.test(formData.telephone))}
                  helperText={touched.telephone && !formData.telephone && "Format: 8 chiffres"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: "56px",
                    },
                  }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom fontWeight="bold">
                Détails de la formation
              </Typography>

              {/* Champs en vertical - un par ligne */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Type de permis - READONLY */}
                <TextField
                  fullWidth
                  label="Type de permis"
                  value={typePermisList.find(p => p.code === formData.typePermisCode)?.label || formData.typePermisCode}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DriveEtaIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "#f5f5f5",
                      height: "56px",
                    },
                  }}
                />

                {/* Type de formation */}
                <FormControl 
                  fullWidth 
                  error={touched.typeFormation && (formData.typeFormation === "" || formData.typeFormation === null)}
                >
                  <InputLabel>Type de formation *</InputLabel>
                  <Select
                    name="typeFormation"
                    value={formData.typeFormation}
                    onChange={handleChange}
                    onBlur={() => handleBlur("typeFormation")}
                    label="Type de formation *"
                    sx={{
                      height: "56px",
                    }}
                  >
                    {formationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Moniteur référent */}
                <FormControl fullWidth error={touched.moniteurId && !formData.moniteurId}>
                  <InputLabel>Moniteur référent *</InputLabel>
                  <Select
                    name="moniteurId"
                    value={formData.moniteurId}
                    onChange={handleChange}
                    onBlur={() => handleBlur("moniteurId")}
                    label="Moniteur référent *"
                    sx={{
                      height: "56px",
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Sélectionner un moniteur</em>
                    </MenuItem>
                    {moniteurs.map((moniteur) => (
                      <MenuItem key={moniteur.id} value={moniteur.id}>
                        <Box>
                          <Typography variant="body2">
                            {moniteur.nom} {moniteur.prenom}
                          </Typography>
                          {moniteur.specialite && (
                            <Typography variant="caption" color="text.secondary">
                              Spécialité: {moniteur.specialite}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Date d'obtention du code - conditionnelle */}
                {(formData.typeFormation === 1 || formData.typeFormation === 2) && (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label="Date d'obtention du code"
                      value={formData.dateObtentionCode}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          sx: {
                            '& .MuiInputBase-root': {
                              height: "56px",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              </Box>

              {/* Récapitulatif */}
              {formData.typeFormation !== "" && formData.moniteurId && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    mt: 3, 
                    p: 2.5, 
                    bgcolor: "#e3f2fd", 
                    borderRadius: 2,
                    border: "1px solid #90caf9",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Récapitulatif de la réinscription
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Candidat: {candidat.prenom} {candidat.nom}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Formation: {formationTypes.find(t => t.value === formData.typeFormation)?.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Moniteur: {moniteurs.find(m => m.id === parseInt(formData.moniteurId))?.nom} {moniteurs.find(m => m.id === parseInt(formData.moniteurId))?.prenom}
                  </Typography>
                  {formData.typePermisCode && (
                    <Typography variant="body2">
                      • Type de permis: {typePermisList.find(p => p.code === formData.typePermisCode)?.label}
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Annuler
        </Button>
        
        {activeStep === 0 ? (
          <Button 
            onClick={handleSearch} 
            variant="contained" 
            disabled={loading || !cin}
            sx={{ borderRadius: 2, px: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : "Rechercher"}
          </Button>
        ) : (
          <Box display="flex" gap={2}>
            <Button
              onClick={() => setActiveStep(0)}
              disabled={loading}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Retour
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {loading ? <CircularProgress size={24} /> : "Confirmer la réinscription"}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReinscrireCandidatModal;