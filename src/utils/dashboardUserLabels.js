const ROLE_LABELS = {
  Proprietaire: "Propriétaire",
  Secretaire: "Secrétaire",
  Moniteur: "Moniteur",
  Candidat: "Candidat",
};

/** Libellé français du rôle stocké dans le contexte auth */
export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "";
}

/**
 * Nom affichable à partir du state AuthContext { user, role, login, user: nestedApiUser, ... }
 */
export function getAuthDisplayName(authUser) {
  if (!authUser) return "";
  const nested = authUser.user;
  if (!nested) return authUser.login || "";

  const nomProp = nested.nomProp ?? nested.NomProp;
  const prenomProp = nested.prenomProp ?? nested.PrenomProp;
  if (nomProp != null || prenomProp != null) {
    return [prenomProp, nomProp].filter(Boolean).join(" ").trim();
  }

  const nom = nested.nom ?? nested.Nom;
  const prenom = nested.prenom ?? nested.Prenom;
  return [prenom, nom].filter(Boolean).join(" ").trim() || authUser.login || "";
}

/** Nom de l'auto-école : racine du contexte ou objet utilisateur API */
export function getAutoEcoleNom(authUser) {
  if (!authUser) return "";
  return (
    authUser.autoEcoleNom ||
    authUser.nomAutoEcole ||
    authUser.user?.autoEcoleNom ||
    authUser.user?.nomAutoEcole ||
    ""
  );
}
