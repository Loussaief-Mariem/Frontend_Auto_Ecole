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
    if (
      lower === "false" ||
      lower === "inactif" ||
      lower === "inactive"
    ) {
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
