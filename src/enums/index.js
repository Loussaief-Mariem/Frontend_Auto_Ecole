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
  },
  {
    code: "A",
    description: "Toutes motos",
    ageMin: 18,
    permisPrealable: "AA",
  },
  {
    code: "B",
    description: "Voitures (≤ 3500 kg)",
    ageMin: 18,
  },
  {
    code: "BE",
    description: "Voiture + remorque > 750kg",
    ageMin: 20,
    permisPrealable: "B",
  },
  {
    code: "C",
    description: "Poids lourd",
    ageMin: 20,
  },
  {
    code: "CE",
    description: "Poids lourd + remorque",
    ageMin: 20,
    permisPrealable: "C",
  },
  {
    code: "D",
    description: "Transport en commun",
    ageMin: 21,
    permisPrealable: "G",
  },
  {
    code: "DE",
    description: "Bus + remorque",
    ageMin: 21,
    permisPrealable: "D",
  },
  {
    code: "G",
    description: "Taxi / transport rural",
    ageMin: 20,
  },
  {
    code: "H",
    description: "Permis spécial",
    ageMin: 18,
  },
];

// Type Examen (corrigé selon backend)
export const TypeExamen = {
  CODE: 0,
  CIRCULATION: 1,
  MANOEUVRE: 2,
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
  SIGNALISATION: 0,
  CONDUCTEUR_VEHICULE: 1,
  ARRET_STATIONNEMENT: 2,
  CROISEMENT_DEPASSEMENT: 3,
  PRIORITE: 4,
  CIRCULATION: 5,
  DELITS: 6,
  PREMIERS_SECOURS: 7,
  MAINTENANCE_ENERGIE: 8,
  TRANSPORT_MATIERES_DANGEREUSES: 9,
};

// Libellés pour ThemeCode
export const THEME_CODE_LABELS = {
  [ThemeCode.SIGNALISATION]: { label: "Signalisation", color: "primary" },
  [ThemeCode.CONDUCTEUR_VEHICULE]: {
    label: "Conducteur et véhicule",
    color: "secondary",
  },
  [ThemeCode.ARRET_STATIONNEMENT]: {
    label: "Arrêt et stationnement",
    color: "info",
  },
  [ThemeCode.CROISEMENT_DEPASSEMENT]: {
    label: "Croisement et dépassement",
    color: "warning",
  },
  [ThemeCode.PRIORITE]: { label: "Priorité", color: "success" },
  [ThemeCode.CIRCULATION]: { label: "Circulation", color: "error" },
  [ThemeCode.DELITS]: { label: "Délits", color: "default" },
  [ThemeCode.PREMIERS_SECOURS]: { label: "Premiers secours", color: "primary" },
  [ThemeCode.MAINTENANCE_ENERGIE]: {
    label: "Maintenance et énergie",
    color: "secondary",
  },
  [ThemeCode.TRANSPORT_MATIERES_DANGEREUSES]: {
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
  PROGRAMME: 1,
  SATISFAIT: 2,
  AJOURNE: 3,
  REPORTE: 4,
  ANNULE: 5,
};
