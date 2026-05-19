
import CompteService from "./compteService";
import userStateService from "./userStateService";
import { getPagedCandidatsByAutoEcole } from "./candidatService";
import { getPagedMoniteursByAutoEcole } from "./moniteurService";
import { getPagedSecretairesByAutoEcole } from "./secretaireService";

// Fonction utilitaire pour obtenir le label du statut
const getStatutLabel = (etat) => {
  switch (etat) {
    case 0:
      return "ACTIF";
    case 1:
      return "INACTIF";
    case 2:
      return "BLOQUÉ";
    case 3:
      return "ARCHIVÉ";
    default:
      return "ACTIF";
  }
};

// Service unifié pour la gestion des utilisateurs
const userManagementService = {
  // Récupérer tous les utilisateurs avec pagination
  getAllUsersPaginated: async (
    autoEcoleId,
    page = 1,
    pageSize = 10,
    filters = {},
  ) => {
    try {
      const [moniteursRes, secretairesRes, candidatsRes] = await Promise.all([
        getPagedMoniteursByAutoEcole(autoEcoleId, page, pageSize),
        getPagedSecretairesByAutoEcole(autoEcoleId, page, pageSize),
        getPagedCandidatsByAutoEcole(autoEcoleId, page, pageSize),
      ]);

      // Formater les moniteurs
      const formattedMoniteurs = (moniteursRes.data || []).map((moniteur) => ({
        id: moniteur.id,
        nom: moniteur.nom,
        prenom: moniteur.prenom,
        email: moniteur.compte?.login,
        telephone: moniteur.telephone || moniteur.compte?.telephone,
        role: "Moniteur",
        roleId: 2,
        statut: getStatutLabel(moniteur.compte?.etat),
        etat: moniteur.compte?.etat ?? 0,
        archive: moniteur.etat === 1,
        compteId: moniteur.compte?.id,
        typesPermisCodes: moniteur.typesPermisCodes || [],
        dateCreation: moniteur.compte?.dateCreation,
      }));

      // Formater les secrétaires
      const formattedSecretaires = (secretairesRes.data || []).map(
        (secretaire) => ({
          id: secretaire.id,
          nom: secretaire.nom,
          prenom: secretaire.prenom,
          email: secretaire.compte?.login,
          telephone: secretaire.telephone || secretaire.compte?.telephone,
          role: "Secretaire",
          roleId: 1,
          statut: getStatutLabel(secretaire.compte?.etat),
          etat: secretaire.compte?.etat ?? 0,
          archive: secretaire.etat === 1,
          compteId: secretaire.compte?.id,
          typesPermisCodes: secretaire.typesPermisCodes || [],
          dateCreation: secretaire.compte?.dateCreation,
        }),
      );

      // Formater les candidats
      const formattedCandidats = (candidatsRes.data || []).map((candidat) => ({
        id: candidat.id,
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.compte?.login,
        telephone: candidat.telephone || candidat.compte?.telephone,
        role: "Candidat",
        roleId: 3,
        statut: getStatutLabel(candidat.compte?.etat),
        etat: candidat.compte?.etat ?? 0,
        archive: candidat.etat === 1,
        compteId: candidat.compte?.id,
        typesPermisCodes: [],
        dateCreation: candidat.compte?.dateCreation,
        cin: candidat.numeroCIN,
        dateInscription: candidat.dateInscription,
      }));

      const allUsers = [
        ...formattedMoniteurs,
        ...formattedSecretaires,
        ...formattedCandidats,
      ];

      // Appliquer les filtres
      const filteredUsers = userManagementService.filtrerUtilisateurs(
        allUsers,
        filters,
      );

      return {
        data: filteredUsers,
        pagination: {
          total: filteredUsers.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredUsers.length / pageSize),
        },
        totals: {
          moniteurs: moniteursRes.totalCount || formattedMoniteurs.length,
          secretaires: secretairesRes.totalCount || formattedSecretaires.length,
          candidats: candidatsRes.totalCount || formattedCandidats.length,
          all: filteredUsers.length,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  },

  // Récupérer les moniteurs paginés
  getMoniteursPaginated: async (
    autoEcoleId,
    page = 1,
    pageSize = 10,
    filters = {},
  ) => {
    try {
      const response = await getPagedMoniteursByAutoEcole(
        autoEcoleId,
        page,
        pageSize,
      );
      const formattedData = (response.data || []).map((moniteur) => ({
        id: moniteur.id,
        nom: moniteur.nom,
        prenom: moniteur.prenom,
        email: moniteur.compte?.login,
        telephone: moniteur.telephone || moniteur.compte?.telephone,
        role: "Moniteur",
        statut: getStatutLabel(moniteur.compte?.etat),
        archive: moniteur.etat === 1,
        compteId: moniteur.compte?.id,
        typesPermisCodes: moniteur.typesPermisCodes || [],
        dateCreation: moniteur.compte?.dateCreation,
      }));

      // Appliquer les filtres
      const filteredData = userManagementService.filtrerUtilisateurs(
        formattedData,
        filters,
      );

      return {
        data: filteredData,
        pagination: {
          total: response.totalCount || filteredData.length,
          page,
          pageSize,
          totalPages: Math.ceil(
            (response.totalCount || filteredData.length) / pageSize,
          ),
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des moniteurs:", error);
      throw error;
    }
  },

  // Récupérer les secrétaires paginés
  getSecretairesPaginated: async (
    autoEcoleId,
    page = 1,
    pageSize = 10,
    filters = {},
  ) => {
    try {
      const response = await getPagedSecretairesByAutoEcole(
        autoEcoleId,
        page,
        pageSize,
      );
      const formattedData = (response.data || []).map((secretaire) => ({
        id: secretaire.id,
        nom: secretaire.nom,
        prenom: secretaire.prenom,
        email: secretaire.compte?.login,
        telephone: secretaire.telephone || secretaire.compte?.telephone,
        role: "Secretaire",
        statut: getStatutLabel(secretaire.compte?.etat),
        archive: secretaire.etat === 1,
        compteId: secretaire.compte?.id,
        dateCreation: secretaire.compte?.dateCreation,
      }));

      const filteredData = userManagementService.filtrerUtilisateurs(
        formattedData,
        filters,
      );

      return {
        data: filteredData,
        pagination: {
          total: response.totalCount || filteredData.length,
          page,
          pageSize,
          totalPages: Math.ceil(
            (response.totalCount || filteredData.length) / pageSize,
          ),
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des secrétaires:", error);
      throw error;
    }
  },

  // Récupérer les candidats paginés
  getCandidatsPaginated: async (
    autoEcoleId,
    page = 1,
    pageSize = 10,
    filters = {},
  ) => {
    try {
      const response = await getPagedCandidatsByAutoEcole(
        autoEcoleId,
        page,
        pageSize,
      );
      const formattedData = (response.data || []).map((candidat) => ({
        id: candidat.id,
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.compte?.login,
        telephone: candidat.telephone || candidat.compte?.telephone,
        role: "Candidat",
        statut: getStatutLabel(candidat.compte?.etat),
        archive: candidat.etat === 1,
        compteId: candidat.compte?.id,
        cin: candidat.numeroCIN,
        dateInscription: candidat.dateInscription,
        dateCreation: candidat.compte?.dateCreation,
      }));

      const filteredData = userManagementService.filtrerUtilisateurs(
        formattedData,
        filters,
      );

      return {
        data: filteredData,
        pagination: {
          total: response.totalCount || filteredData.length,
          page,
          pageSize,
          totalPages: Math.ceil(
            (response.totalCount || filteredData.length) / pageSize,
          ),
        },
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
      throw error;
    }
  },

  // Récupérer les totaux pour les statistiques
  getTotals: async (autoEcoleId) => {
    try {
      const [moniteursRes, secretairesRes, candidatsRes] = await Promise.all([
        getPagedMoniteursByAutoEcole(autoEcoleId, 1, 1),
        getPagedSecretairesByAutoEcole(autoEcoleId, 1, 1),
        getPagedCandidatsByAutoEcole(autoEcoleId, 1, 1),
      ]);

      return {
        total:
          (moniteursRes.totalCount || 0) +
          (secretairesRes.totalCount || 0) +
          (candidatsRes.totalCount || 0),
        candidats: candidatsRes.totalCount || 0,
        moniteurs: moniteursRes.totalCount || 0,
        secretaires: secretairesRes.totalCount || 0,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des totaux:", error);
      throw error;
    }
  },
  // Bloquer un utilisateur (état du compte = 2)
  bloquerUtilisateur: async (utilisateur, motif) => {
    try {
      const response = await CompteService.bloquerCompte(utilisateur.compteId);
      console.log(
        `Utilisateur ${utilisateur.nom} ${utilisateur.prenom} bloqué. Motif: ${motif}`,
      );
      return {
        success: true,
        message: `Compte ${utilisateur.nom} ${utilisateur.prenom} bloqué avec succès`,
        data: response,
      };
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
      throw error;
    }
  },

  // Débloquer un utilisateur (état du compte = 0)
  debloquerUtilisateur: async (utilisateur) => {
    try {
      const response = await CompteService.debloquerCompte(
        utilisateur.compteId,
      );
      return {
        success: true,
        message: `Compte ${utilisateur.nom} ${utilisateur.prenom} débloqué avec succès`,
        data: response,
      };
    } catch (error) {
      console.error("Erreur lors du déblocage:", error);
      throw error;
    }
  },

  // Archiver un utilisateur (état de l'entité = 1)
  archiverUtilisateur: async (utilisateur) => {
    try {
      let type;
      if (utilisateur.role === "Moniteur") {
        type = "Moniteur";
      } else if (utilisateur.role === "Secretaire") {
        type = "Secretaire";
      } else if (utilisateur.role === "Candidat") {
        type = "Candidat";
      } else {
        throw new Error(`Type d'utilisateur non reconnu: ${utilisateur.role}`);
      }

      const response = await userStateService.archiver(type, utilisateur.id);

      return {
        success: true,
        message: `Utilisateur ${utilisateur.nom} ${utilisateur.prenom} archivé avec succès`,
        data: response,
      };
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
      throw error;
    }
  },

  // Désarchiver un utilisateur (état de l'entité = 0)
  desarchiverUtilisateur: async (utilisateur) => {
    try {
      let type;
      if (utilisateur.role === "Moniteur") {
        type = "Moniteur";
      } else if (utilisateur.role === "Secretaire") {
        type = "Secretaire";
      } else if (utilisateur.role === "Candidat") {
        type = "Candidat";
      } else {
        throw new Error(`Type d'utilisateur non reconnu: ${utilisateur.role}`);
      }

      const response = await userStateService.desarchiver(type, utilisateur.id);

      return {
        success: true,
        message: `Utilisateur ${utilisateur.nom} ${utilisateur.prenom} désarchivé avec succès`,
        data: response,
      };
    } catch (error) {
      console.error("Erreur lors du désarchivage:", error);
      throw error;
    }
  },

  // Filtrer les utilisateurs
  filtrerUtilisateurs: (utilisateurs, filtres) => {
    let result = [...utilisateurs];

    // Filtre par statut
    if (filtres.statut && filtres.statut !== "TOUS") {
      result = result.filter((user) => user.statut === filtres.statut);
    }

    // Filtre par archive
    if (filtres.archive && filtres.archive !== "TOUS") {
      const showArchived = filtres.archive === "ARCHIVÉ";
      result = result.filter((user) => user.archive === showArchived);
    }

    // Filtre par recherche
    if (filtres.recherche) {
      const searchTerm = filtres.recherche.toLowerCase();
      result = result.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchTerm) ||
          user.prenom?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm),
      );
    }

    return result;
  },
};

export default userManagementService;
