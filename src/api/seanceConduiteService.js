// src/api/seanceConduiteService.js
import api from "./axios";

/**
 * Message d'erreur lisible (ASP.NET) : BadRequest(string), { message }, ProblemDetails, errors.
 */
export function getSeanceConduiteApiErrorMessage(error) {
  const data = error?.response?.data;

  if (data == null || data === "") {
    const m = error?.message;
    if (m && !/^Request failed with status code \d+$/.test(m)) {
      return m;
    }
    return "Une erreur est survenue.";
  }

  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed || "Une erreur est survenue.";
  }

  if (typeof data === "object") {
    const msg =
      data.message ||
      data.Message ||
      data.detail ||
      data.Detail ||
      data.title ||
      data.Title;
    if (typeof msg === "string" && msg.trim()) {
      return msg.trim();
    }

    const errors = data.errors || data.Errors;
    if (errors && typeof errors === "object") {
      const parts = [];
      for (const key of Object.keys(errors)) {
        const val = errors[key];
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (typeof v === "string" && v.trim()) parts.push(v.trim());
          });
        } else if (typeof val === "string" && val.trim()) {
          parts.push(val.trim());
        }
      }
      if (parts.length) return parts.join(" ");
    }
  }

  return error?.message || "Une erreur est survenue.";
}

// Planifier séance conduite
export const planifierSeanceConduite = async (data) => {
  // CORRECTION: Utiliser contratId au lieu de candidatId
  const formattedData = {
    date: data.date,
    heureDebut: data.heureDebut,
    dureeMinutes: parseInt(data.dureeMinutes),
    typeConduite: parseInt(data.typeConduite),
    contratId: parseInt(data.contratId), // Changé: candidatId -> contratId
    moniteurId: parseInt(data.moniteurId),
  };
  const res = await api.post("/seance-conduite", formattedData);
  return res.data;
};

// Planifier plusieurs séances
export const planifierSeancesBatch = async (seances) => {
  const formattedSeances = seances.map((seance) => ({
    date: seance.date,
    heureDebut: seance.heureDebut,
    dureeMinutes: parseInt(seance.dureeMinutes),
    typeConduite: parseInt(seance.typeConduite),
    contratId: parseInt(seance.contratId), // Changé: candidatId -> contratId
    moniteurId: parseInt(seance.moniteurId),
  }));
  const res = await api.post("/seance-conduite/batch", formattedSeances);
  return res.data;
};

// Alias conservé pour compatibilité avec les hooks existants
export const planifierSeancesConduiteBatch = planifierSeancesBatch;

// Modifier séance conduite
export const modifierSeanceConduite = async (id, data) => {
  const formattedData = {
    date: data.date,
    heureDebut: data.heureDebut,
    dureeMinutes: parseInt(data.dureeMinutes),
    typeConduite: parseInt(data.typeConduite),
    contratId: parseInt(data.contratId),
    moniteurId: parseInt(data.moniteurId),
  };
  const res = await api.put(`/seance-conduite/${id}`, formattedData);
  return res.data;
};

// Get planning moniteur
export const getPlanningMoniteur = async (id) => {
  const res = await api.get(`/seance-conduite/moniteur/${id}`);
  return res.data;
};

// Marquer présence
export const marquerPresence = async (id, present) => {
  const res = await api.put(
    `/seance-conduite/${id}/presence?present=${present}`,
  );
  return res.data;
};

// Ajouter remarque + note
export const ajouterRemarque = async (id, remarque, note) => {
  const res = await api.put(
    `/seance-conduite/${id}/remarque?remarque=${encodeURIComponent(remarque)}&note=${note}`,
  );
  return res.data;
};

// Annuler séance
export const annulerSeanceConduite = async (id) => {
  const res = await api.put(`/seance-conduite/${id}/annuler`);
  return res.data;
};

// Désannuler séance
export const desannulerSeance = async (id) => {
  const res = await api.put(`/seance-conduite/${id}/desannuler`);
  return res.data;
};

// Planning moniteur par date
export const getPlanningMoniteurByDate = async (id, date) => {
  const formattedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : date;
  const res = await api.get(
    `/seance-conduite/moniteur/${id}/date?date=${formattedDate}`,
  );
  return res.data;
};

export const getAllSeancesConduite = async (autoEcoleId) => {
  const res = await api.get(`/seance-conduite/auto-ecole/${autoEcoleId}`);
  return res.data;
};

export const getSeancesByContrat = async (contratId) => {
  const res = await api.get(`/seance-conduite/contrat/${contratId}`);
  return res.data;
};

export default {
  getSeanceConduiteApiErrorMessage,
  planifierSeanceConduite,
  modifierSeanceConduite,
  getPlanningMoniteur,
  marquerPresence,
  ajouterRemarque,
  annulerSeanceConduite,
  desannulerSeance,
  getPlanningMoniteurByDate,
  planifierSeancesBatch,
  planifierSeancesConduiteBatch,
  getAllSeancesConduite,
  getSeancesByContrat,
};
