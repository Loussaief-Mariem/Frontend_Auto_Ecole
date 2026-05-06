import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCandidat } from "../api/candidatService";
import { validateCandidat } from "../validation/addCandidatValidation";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
const DOCUMENT_TYPE = {
  photoIdentite: 0,
  copieCIN: 1,
  certificatMedical: 2,
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
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log("User from AuthContext in useCandidatForm:", user);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    nomEpoux: "",
    numeroCIN: "",
    dateNaissance: null,
    dateDelivranceCIN: null,
    lieuDeNaissance: "",
    sexe: "", // 0 = M, 1 = F
    adresse_rue: "",
    adresse_ville: "",
    moniteurId: "",
    compte: {
      login: "",
      telephone: "",
      role: 3,
      autoEcoleId: user.user?.autoEcoleId || user?.autoEcoleId || null,
    },
    dossier: {
      candidatId: 0,
      documents: [],
    },
    typePermisCode: "B",
    typeFormation: "", // 0 = Theorique, 1 = Pratique, 2 = Complet
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

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // Si on choisit Masculin (0), on vide le nom d'époux
      if (name === "sexe" && value === 0) {
        next.nomEpoux = "";
      }
      
      return next;
    });

    clearFieldError(name);
  };

  const setAdresse = (adresse) => {
    setFormData((prev) => ({ ...prev, adresse }));
  };

  const setCompte = (compte) => {
    setFormData((prev) => ({
      ...prev,
      compte: { ...prev.compte, ...compte },
    }));
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
      nom: formData.nom,
      prenom: formData.prenom,
      nomEpoux: formData.nomEpoux,
      numeroCIN: formData.numeroCIN,
      dateNaissance: formData.dateNaissance
        ? format(new Date(formData.dateNaissance), "yyyy-MM-dd'T'HH:mm:ss")
        : null,
      lieuDeNaissance: formData.lieuDeNaissance,
      telephone: formData.compte.telephone,
      moniteurId: formData.moniteurId
        ? Number.parseInt(formData.moniteurId, 10)
        : null,
      dateDelivranceCIN: formData.dateDelivranceCIN
        ? format(new Date(formData.dateDelivranceCIN), "yyyy-MM-dd'T'HH:mm:ss")
        : null,
      sexe: Number.isNaN(parsedSexe) ? null : parsedSexe,
      adresse: `${formData.adresse_rue}, ${formData.adresse_ville}`,
      dossier: {
        candidatId: formData?.dossier?.candidatId ?? 0,
        documents: (formData?.dossier?.documents || []).length
          ? formData.dossier.documents
          : Object.entries(DOCUMENT_TYPE).map(([key, typeDocument]) => ({
              typeDocument,
              etat: documentsState[key] ? 1 : 0,
            })),
      },
      compte: {
        login: formData.compte.login,
        role: formData.compte.role,
        autoEcoleId: formData.compte.autoEcoleId,
      },
      typePermisCode: formData.typePermisCode,
      typeFormation: Number.isNaN(parsedTypeFormation)
        ? null
        : parsedTypeFormation,
    };

    try {
      await registerCandidat(payload);
      setFieldErrors({});
      alert("Candidat créé avec succès !");
      navigate("/dashboard/candidats");
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
