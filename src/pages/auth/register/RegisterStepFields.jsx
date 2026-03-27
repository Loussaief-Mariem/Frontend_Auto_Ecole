import { Stack, TextField, InputAdornment } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessIcon from "@mui/icons-material/Business";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import { REGISTER_STEP_INDEX as S } from "./registerInitialState";
import RegisterAddressSelector from "./RegisterAddressSelector";

const RegisterStepFields = ({
  step,
  form,
  setForm,
  errors,
  gouvernoratsList,
}) => {
  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  switch (step) {
    case S.PROPRIETAIRE:
      return (
        <Stack spacing={2.5}>
          <TextField
            label="Nom"
            fullWidth
            value={form.NomProp}
            onChange={setField("NomProp")}
            error={!!errors.NomProp}
            helperText={errors.NomProp}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Prénom"
            fullWidth
            value={form.PrenomProp}
            onChange={setField("PrenomProp")}
            error={!!errors.PrenomProp}
            helperText={errors.PrenomProp}
          />
        </Stack>
      );
    case S.ETABLISSEMENT:
      return (
        <Stack spacing={2.5}>
          <TextField
            label="Nom Auto-École"
            fullWidth
            value={form.NomEcole}
            onChange={setField("NomEcole")}
            error={!!errors.NomEcole}
            helperText={errors.NomEcole}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Code établissement"
            fullWidth
            value={form.CodeEtablissement}
            onChange={setField("CodeEtablissement")}
            error={!!errors.CodeEtablissement}
            helperText={errors.CodeEtablissement}
          />
          <TextField
            label="Identifiant fiscal"
            fullWidth
            value={form.IdentifiantFiscal}
            onChange={setField("IdentifiantFiscal")}
            error={!!errors.IdentifiantFiscal}
            helperText={errors.IdentifiantFiscal}
          />
        </Stack>
      );
    case S.CONTACT:
      return (
        <Stack spacing={2.5}>
          <TextField
            label="Email (identifiant de connexion)"
            type="email"
            fullWidth
            autoComplete="email"
            value={form.Email}
            onChange={setField("Email")}
            error={!!errors.Email}
            helperText={errors.Email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Téléphone"
            fullWidth
            autoComplete="tel"
            value={form.Telephone}
            onChange={setField("Telephone")}
            error={!!errors.Telephone}
            helperText={errors.Telephone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      );
    case S.ADRESSE:
      return (
        <RegisterAddressSelector
          form={form}
          setForm={setForm}
          errors={errors}
          gouvernoratsList={gouvernoratsList}
        />
      );
    default:
      return null;
  }
};

export default RegisterStepFields;
