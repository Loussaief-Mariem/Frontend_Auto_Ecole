export const validateRegisterStep = (step, form) => {
  const errors = {};

  // =========================
  // HELPERS REGEX
  // =========================
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{8}$/;
  const codeEcoleRegex = /^\d{2}-\d{3}$/; // 01-300
  const identifiantFiscalRegex = /^\d{7}[A-Z]$/; // 1234567A

  switch (step) {
    // =========================
    // PROPRIETAIRE
    // =========================
    case 0:
      if (!form.NomProp?.trim()) {
        errors.NomProp = "Nom obligatoire";
      }

      if (!form.PrenomProp?.trim()) {
        errors.PrenomProp = "Prénom obligatoire";
      }
      break;

    // =========================
    // ETABLISSEMENT
    // =========================
    case 1:
      if (!form.NomEcole?.trim()) {
        errors.NomEcole = "Nom auto-école obligatoire";
      }

      if (!form.CodeEtablissement?.trim()) {
        errors.CodeEtablissement = "Code établissement obligatoire";
      } else if (!codeEcoleRegex.test(form.CodeEtablissement)) {
        errors.CodeEtablissement = "Format invalide (ex: 01-300)";
      }

      if (!form.IdentifiantFiscal?.trim()) {
        errors.IdentifiantFiscal = "Identifiant fiscal obligatoire";
      } else if (!identifiantFiscalRegex.test(form.IdentifiantFiscal)) {
        errors.IdentifiantFiscal =
          "7 chiffres + 1 lettre majuscule (ex: 1234567A)";
      }
      break;

    // =========================
    // CONTACT
    // =========================
    case 2:
      if (!form.Email?.trim()) {
        errors.Email = "Email obligatoire";
      } else if (!emailRegex.test(form.Email)) {
        errors.Email = "Format email invalide";
      }

      if (!form.Telephone?.trim()) {
        errors.Telephone = "Téléphone obligatoire";
      } else if (!phoneRegex.test(form.Telephone)) {
        errors.Telephone = "Doit contenir exactement 8 chiffres";
      }
      break;

    // =========================
    // ADRESSE
    // =========================
    case 3:
      if (!form.Adresse?.Rue?.trim()) {
        errors.Rue = "Rue obligatoire";
      }

      if (!form.Adresse?.Gouvernorat?.trim()) {
        errors.Gouvernorat = "Gouvernorat obligatoire";
      }

      if (!form.Adresse?.Ville?.trim()) {
        errors.Ville = "Ville obligatoire";
      }
      break;
  }

  return errors;
};
