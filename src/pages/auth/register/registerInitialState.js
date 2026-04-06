/**
 * État formulaire — aligné sur RegisterProprietaireDto sans login/motDePasse saisis :
 * login est dérivé de l’email à l’envoi (voir registerPayload.js).
 */
export const initialRegisterForm = {
  NomProp: "",
  PrenomProp: "",
  NomEcole: "",
  CodeEtablissement: "",
  IdentifiantFiscal: "",
  Email: "",
  Telephone: "",
  TypePermisCode: [],
  Adresse: {
    Rue: "",
    Ville: "",
    Gouvernorat: "",
    Pays: "",
  },
};

/** Libellés des étapes du stepper (ordre = index 0 → n-1). */
export const REGISTER_STEPS = [
  "Propriétaire",
  "Établissement",
  "Contact",
  "Adresse",
  "Permis",
];

/** Nombre d’étapes (utile pour validations ou boucles). */
export const REGISTER_STEP_COUNT = REGISTER_STEPS.length;

/** Index des étapes (alignés sur REGISTER_STEPS et RegisterStepFields). */
export const REGISTER_STEP_INDEX = {
  PROPRIETAIRE: 0,
  ETABLISSEMENT: 1,
  CONTACT: 2,
  PERMIS: 3, 
  ADRESSE: 4,
};
