export const validateCandidat = (form) => {
  const errors = {};
  const TypePermisList = [
    { Code: "AA", AgeMin: 16 },
    { Code: "A", AgeMin: 18 },
    { Code: "B", AgeMin: 18 },
    { Code: "BE", AgeMin: 20 },
    { Code: "C", AgeMin: 20 },
    { Code: "CE", AgeMin: 20 },
    { Code: "D", AgeMin: 21 },
    { Code: "DE", AgeMin: 21 },
    { Code: "G", AgeMin: 20 },
    { Code: "H", AgeMin: 18 },
  ];

  // =========================
  // REGEX
  // =========================
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{8}$/;
  const cinRegex = /^\d{8}$/;

  // =========================
  // INFOS PERSONNELLES
  // =========================
  if (!form.nom?.trim()) {
    errors.nom = "Nom obligatoire";
  }

  if (!form.prenom?.trim()) {
    errors.prenom = "Prénom obligatoire";
  }

  if (!form.numeroCIN?.trim()) {
    errors.numeroCIN = "CIN obligatoire";
  } else if (!cinRegex.test(form.numeroCIN)) {
    errors.numeroCIN = "CIN doit contenir 8 chiffres";
  }

  if (!form.sexe && form.sexe !== 0) {
    errors.sexe = "Sexe obligatoire";
  }

  if (!form.dateNaissance) {
    errors.dateNaissance = "Date de naissance obligatoire";
  }

  if (!form.lieuDeNaissance?.trim()) {
    errors.lieuDeNaissance = "Lieu de naissance obligatoire";
  }

  if (!form.dateDelivranceCIN) {
    errors.dateDelivranceCIN = "Date délivrance CIN obligatoire";
  }

  // =========================
  // CONTRAINTE LOGIQUE (IMPORTANT)
  // =========================
  if (form.dateNaissance && form.dateDelivranceCIN) {
    const naissance = new Date(form.dateNaissance);
    const cin = new Date(form.dateDelivranceCIN);

    const minDate = new Date(naissance);
    minDate.setFullYear(minDate.getFullYear() + 17);

    if (cin < minDate) {
      errors.dateDelivranceCIN = "La date doit être après 17 ans minimum";
    }

    if (cin > new Date()) {
      errors.dateDelivranceCIN = "La date ne peut pas être dans le futur";
    }
  }

  // =========================
  // COMPTE
  // =========================
  if (!form.compte?.login?.trim()) {
    errors.login = "Email obligatoire";
  } else if (!emailRegex.test(form.compte.login)) {
    errors.login = "Email invalide";
  }

  if (!form.compte?.telephone?.trim()) {
    errors.telephone = "Téléphone obligatoire";
  } else if (!phoneRegex.test(form.compte.telephone)) {
    errors.telephone = "Téléphone doit contenir 8 chiffres";
  }

  // =========================
  // ADRESSE
  // =========================
  if (!form.adresse?.pays?.trim()) {
    errors.pays = "Pays obligatoire";
  }

  if (!form.adresse?.gouvernorat?.trim()) {
    errors.gouvernorat = "Gouvernorat obligatoire";
  }

  if (!form.adresse?.ville?.trim()) {
    errors.ville = "Ville obligatoire";
  }

  if (!form.adresse?.rue?.trim()) {
    errors.rue = "Rue obligatoire";
  }

  // =========================
  // FORMATION
  // =========================
  if (!form.typePermisCode) {
    errors.typePermisCode = "Type permis obligatoire";
  }

  if (form.typeFormation === "") {
    errors.typeFormation = "Type formation obligatoire";
  }

  if (!form.typePermisCode) {
    errors.typePermisCode = "Type permis obligatoire";
  } else if (form.dateNaissance) {
    const naissance = new Date(form.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - naissance.getFullYear();
    // Ajuster si l'anniversaire n'est pas encore passé cette année
    const m = today.getMonth() - naissance.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < naissance.getDate())) {
      age--;
    }

    const permis = TypePermisList.find((p) => p.Code === form.typePermisCode);
    if (permis && age < permis.AgeMin) {
      errors.typePermisCode = `Le candidat doit avoir au moins ${permis.AgeMin} ans pour ce type de permis`;
    }
  }

  if (form.typeFormation === "")
    errors.typeFormation = "Type formation obligatoire";

  return errors;
};
