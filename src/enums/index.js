// src/enums/index.js
// Statut des documents
export const StatutDocument = {
  Manquant: 0,
  Recu: 1,
};

// Type des documents
export const TypeDocument = {
  PhotoIdentite: 0,
  CopieCIN: 1,
  CertificatMedical: 2,
};

// Type de formation
export const TypeFormation = {
  Theorique: 0,
  Pratique: 1,
  Complet: 2,
};

// Etat des candidats
export const Etat = {
  Actif: 0,
  Archive: 1,
};

// Etat des comptes (aligné API : 0 = actif, 1 = inactif, …)
export const EtatCompte = {
  ACTIF: 0,
  INACTIF: 1,
  BLOQUE: 2,
  ARCHIVE: 3,
};

/** Libellé + couleur MUI Chip pour l’affichage */
export const ETAT_COMPTE_DISPLAY = {
  [EtatCompte.ACTIF]: { label: "Actif", chipColor: "success" },
  [EtatCompte.INACTIF]: { label: "Inactif", chipColor: "error" },
  [EtatCompte.BLOQUE]: { label: "Bloqué", chipColor: "warning" },
  [EtatCompte.ARCHIVE]: { label: "Archivé", chipColor: "default" },
};

/**
 * Interprète `compte.etat` / `compte.Etat` (nombre, booléen, chaîne).
 * Si l’API envoie `true` pour un compte actif, on affiche bien « Actif » (vert).
 */
export function getEtatCompteDisplay(compte) {
  if (!compte) {
    return { label: "—", chipColor: "default" };
  }
  const raw = compte.etat ?? compte.Etat;

  if (raw === undefined || raw === null || raw === "") {
    return { label: "—", chipColor: "default" };
  }

  if (typeof raw === "boolean") {
    const key = raw ? EtatCompte.ACTIF : EtatCompte.INACTIF;
    const meta = ETAT_COMPTE_DISPLAY[key];
    return { label: meta.label, chipColor: meta.chipColor };
  }

  if (typeof raw === "string") {
    const t = raw.trim();
    const lower = t.toLowerCase();
    if (lower === "true" || lower === "actif") {
      return { ...ETAT_COMPTE_DISPLAY[EtatCompte.ACTIF] };
    }
    if (lower === "false" || lower === "inactif" || lower === "inactive") {
      return { ...ETAT_COMPTE_DISPLAY[EtatCompte.INACTIF] };
    }
    if (lower === "bloque" || lower === "bloqué") {
      return { ...ETAT_COMPTE_DISPLAY[EtatCompte.BLOQUE] };
    }
    if (lower === "archive" || lower === "archivé") {
      return { ...ETAT_COMPTE_DISPLAY[EtatCompte.ARCHIVE] };
    }
    const num = Number(t);
    if (!Number.isNaN(num)) {
      const meta = ETAT_COMPTE_DISPLAY[num];
      return meta
        ? { label: meta.label, chipColor: meta.chipColor }
        : { label: "—", chipColor: "default" };
    }
    return { label: "—", chipColor: "default" };
  }

  const n = Number(raw);
  if (!Number.isNaN(n)) {
    const meta = ETAT_COMPTE_DISPLAY[n];
    return meta
      ? { label: meta.label, chipColor: meta.chipColor }
      : { label: "—", chipColor: "default" };
  }

  return { label: "—", chipColor: "default" };
}

// Etat des dossiers
export const EtatDossier = {
  Incomplet: 0,
  Complet: 1,
  Annule: 2,
  Cloture: 3,
};

// Sexe
export const Sexe = {
  Homme: 0,
  Femme: 1,
};

// Roles
export const Role = {
  Proprietaire: 0,
  Secretaire: 1,
  Moniteur: 2,
  Candidat: 3,
};

// Type de permis (aligné avec le backend)
export const TypePermis = [
  {
    code: "AA",
    description: "Cyclomoteurs, vélomoteurs, voiturettes...",
    ageMin: 16,
    nombreQuestions: 25,
    seuilReussite: 20,
  },
  {
    code: "A",
    description: "Toutes motos",
    ageMin: 18,
    permisPrealable: "AA",
    nombreQuestions: 30,
    seuilReussite: 24,
  },
  {
    code: "B",
    description: "Voitures (≤ 3500 kg)",
    ageMin: 18,
    nombreQuestions: 30,
    seuilReussite: 24,
  },
  {
    code: "BE",
    description: "Voiture + remorque > 750kg",
    ageMin: 20,
    permisPrealable: "B",
    nombreQuestions: 35,
    seuilReussite: 28,
  },
  {
    code: "C",
    description: "Poids lourd",
    ageMin: 20,
    nombreQuestions: 30,
    seuilReussite: 24,
  },
  {
    code: "CE",
    description: "Poids lourd + remorque",
    ageMin: 20,
    permisPrealable: "C",
    nombreQuestions: 35,
    seuilReussite: 28,
  },
  {
    code: "D",
    description: "Transport en commun",
    ageMin: 21,
    permisPrealable: "G",
    nombreQuestions: 35,
    seuilReussite: 28,
  },
  {
    code: "DE",
    description: "Bus + remorque",
    ageMin: 21,
    permisPrealable: "D",
    nombreQuestions: 35,
    seuilReussite: 28,
  },
  {
    code: "G",
    description: "Taxi / transport rural",
    ageMin: 20,
    nombreQuestions: 30,
    seuilReussite: 24,
  },
  {
    code: "H",
    description: "Permis spécial",
    ageMin: 18,
    nombreQuestions: 30,
    seuilReussite: 24,
  },
];

// Type Examen (corrigé selon backend)
export const TypeExamen = {
  Code: 0,
  Circulation: 1,
  Manœuvre: 2,
};

// TypeConduite (corrigé selon backend C#)
export const TypeConduite = {
  MANOEUVRE: 0,
  PARKING: 1,
};

// Libellés pour TypeConduite
export const TYPE_CONDUITE_LABELS = {
  [TypeConduite.MANOEUVRE]: { label: "Manœuvre", color: "primary" },
  [TypeConduite.PARKING]: { label: "Parking", color: "secondary" },
};

// Theme de Code (corrigé)
export const ThemeCode = {
  Signalisation: 0,
  ConducteurVehicule: 1,
  ArretStationnement: 2,
  CroisementDepassement: 3,
  Priorite: 4,
  Circulation: 5,
  Delits: 6,
  PremiersSecours: 7,
  MaintenanceEnergie: 8,
  TransportMatieresDangereuses: 9,
};

// Libellés pour ThemeCode
export const THEME_CODE_LABELS = {
  [ThemeCode.Signalisation]: { label: "Signalisation", color: "primary" },
  [ThemeCode.ConducteurVehicule]: {
    label: "Conducteur et véhicule",
    color: "secondary",
  },
  [ThemeCode.ArretStationnement]: {
    label: "Arrêt et stationnement",
    color: "info",
  },
  [ThemeCode.CroisementDepassement]: {
    label: "Croisement et dépassement",
    color: "warning",
  },
  [ThemeCode.Priorite]: { label: "Priorité", color: "success" },
  [ThemeCode.Circulation]: { label: "Circulation", color: "error" },
  [ThemeCode.Delits]: { label: "Délits", color: "default" },
  [ThemeCode.PremiersSecours]: { label: "Premiers secours", color: "primary" },
  [ThemeCode.MaintenanceEnergie]: {
    label: "Maintenance et énergie",
    color: "secondary",
  },
  [ThemeCode.TransportMatieresDangereuses]: {
    label: "Transport matières dangereuses",
    color: "error",
  },
};

// Statut Seance
export const StatutSeance = {
  PLANIFIEE: 0,
  ANNULEE: 1,
  TERMINEE: 2,
};

// Libellés pour StatutSeance
export const STATUT_SEANCE_LABELS = {
  [StatutSeance.PLANIFIEE]: { label: "Planifiée", color: "primary" },
  [StatutSeance.ANNULEE]: { label: "Annulée", color: "error" },
  [StatutSeance.TERMINEE]: { label: "Terminée", color: "success" },
};

// StatutExamen
export const StatutExamen = {
  Programmé: 1,
  Satisfait: 2,
  Ajourne: 3,
  Reporté: 4,
  Invalide: 5,
};
