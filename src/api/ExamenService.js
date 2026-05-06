import api from "../api/axios";

const ExamenService = {
  // Programmer examen (code ou conduite)
  programmer: async (data) => {
    const res = await api.post("/examens", data);
    return res.data;
  },

  // Générer convocation (backend peut retourner PDF ou données)
  genererConvocation: async (examenId) => {
    const res = await api.get(`/examens/${examenId}/convocation`);
    return res.data;
  },

  // Télécharger PDF convocation
  downloadPdf: async (examenId) => {
    const res = await api.get(`/examens/download/pdf/${examenId}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `convocation_${examenId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Reporter examen
  reporter: async (data) => {
    const res = await api.post("/examens/report", data);
    return res.data;
  },

  // Enregistrer résultat examen
  enregistrerResultat: async (data) => {
    const res = await api.post("/examens/resultat", data);
    return res.data;
  },

  // Liste examens candidat
  getByCandidat: async (candidatId) => {
    const res = await api.get(`/examens/candidat/${candidatId}`);
    return res.data;
  },

  getExamensAVenir: async (contratId) => {
    const res = await api.get(`/examens/avenir/contrat/${contratId}`);
    return res.data;
  },

  //  NOUVELLE MÉTHODE: Récupérer l'historique des examens par contrat
  getHistorique: async (contratId) => {
    const res = await api.get(`/examens/historique/contrat/${contratId}`);
    return res.data;
  },
};
export default ExamenService;
