import { useState } from "react";
import { registerCandidat } from "../api/candidatService";
import { validateCandidat } from "../validation/addCandidatValidation";

const DOCUMENT_TYPE = {
  photoIdentite: 0,
  copieCIN: 1,
  certificatMedical: 2,
};

const getAutoEcoleIdFromStorage = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return 0;

    const parsedUser = JSON.parse(rawUser);
    const autoEcoleId =
      parsedUser?.autoEcoleId ??
      parsedUser?.idAutoEcole ??
      parsedUser?.user?.autoEcoleId ??
      parsedUser?.user?.idAutoEcole ??
      0;
    if (autoEcoleId === undefined || autoEcoleId === null) return 0;

    return autoEcoleId;
  } catch (error) {
    console.error(
      "Impossible de lire autoEcoleId depuis le localStorage:",
      error,
    );
    return 0;
  }
};
const getBackendErrorMessage = (err) => {
  const backendData = err?.response?.data;
  if (!backendData) {
    return "Erreur lors de la création du candidat.";
  }

  if (typeof backendData === "string") {
    return backendData;
  }

  const message = backendData.message;
  const detail = backendData.detail;
  if (message && detail) return `${message} - ${detail}`;
  if (message) return message;
  if (detail) return detail;

  return "Erreur lors de la création du candidat.";
};

const useCandidatForm = ({ setErrMessage } = {}) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nomEpoux: "",
    numeroCIN: "",
    dateNaissance: null,
    dateDelivranceCIN: null,
    lieuDeNaissance: "",
    sexe: "", // 0 = M, 1 = F
    adresse: {
      rue: "",
      ville: "",
      gouvernorat: "",
      pays: "Tunisie",
    },
    compte: {
      login: "",
      telephone: "",
      role: 3,
    },
    dossier: {
      candidatId: 0,
      documents: [],
    },
    autoEcoleId: getAutoEcoleIdFromStorage(),
    typePermisCode: "B",
    typeFormation: "", // 0 = Theorique, 1 = Pratique, 2 = Complet
    centreExamen: "",
  });
  const [documentsState, setDocumentsState] = useState({
    photoIdentite: false,
    copieCIN: false,
    certificatMedical: false,
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (fieldKey) => {
    if (!fieldKey) return;
    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const setAdresse = (adresse) => {
    setFormData((prev) => ({ ...prev, adresse }));
  };

  const setCompte = (compte) => {
    setFormData((prev) => ({ ...prev, compte }));
  };

  const setDocumentChecked = (name, checked) => {
    setDocumentsState((prev) => {
      const updatedState = { ...prev, [name]: checked };
      const updatedDocuments = Object.entries(DOCUMENT_TYPE).map(
        ([key, typeDocument]) => ({
          typeDocument,
          etat: updatedState[key] ? 1 : 0,
        }),
      );

      setFormData((prevFormData) => ({
        ...prevFormData,
        dossier: {
          ...(prevFormData.dossier || { candidatId: 0 }),
          candidatId: prevFormData?.dossier?.candidatId ?? 0,
          documents: updatedDocuments,
        },
      }));

      return updatedState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (typeof setErrMessage === "function") {
      setErrMessage("");
    }
    setFieldErrors({});

    const validationErrors = validateCandidat(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    const parsedSexe =
      formData.sexe === "" ? null : Number.parseInt(formData.sexe, 10);
    const parsedTypeFormation =
      formData.typeFormation === ""
        ? null
        : Number.parseInt(formData.typeFormation, 10);

    const payload = {
      ...formData,
      dateNaissance: formData.dateNaissance
        ? new Date(formData.dateNaissance).toISOString()
        : null,
      dateDelivranceCIN: formData.dateDelivranceCIN
        ? new Date(formData.dateDelivranceCIN).toISOString()
        : null,
      sexe: Number.isNaN(parsedSexe) ? null : parsedSexe,
      typeFormation: Number.isNaN(parsedTypeFormation)
        ? null
        : parsedTypeFormation,
      dossier: {
        candidatId: formData?.dossier?.candidatId ?? 0,
        documents: (formData?.dossier?.documents || []).length
          ? formData.dossier.documents
          : Object.entries(DOCUMENT_TYPE).map(([key, typeDocument]) => ({
              typeDocument,
              etat: documentsState[key] ? 1 : 0,
            })),
      },
    };

    try {
      await registerCandidat(payload);
      setFieldErrors({});
      alert("Candidat créé avec succès !");
    } catch (err) {
      console.error(err);
      if (typeof setErrMessage === "function") {
        setErrMessage(getBackendErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };
  return {
    formData,
    handleChange,
    setAdresse,
    setCompte,
    documentsState,
    setDocumentChecked,
    handleSubmit,
    loading,
    fieldErrors,
    clearFieldError,
  };
};

export default useCandidatForm;
