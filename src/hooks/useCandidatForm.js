import { useState } from "react";
import { createCandidat } from "../api/candidatService";

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
const useCandidatForm = () => {
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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    setError("");

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
      await createCandidat(payload);
      alert("Candidat créé avec succès !");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du candidat.");
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
    error,
  };
};

export default useCandidatForm;
