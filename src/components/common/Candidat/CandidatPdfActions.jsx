import React, { useState } from "react";
import { Button, Stack } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import { getCandidatFichePdf } from "../../../api/candidatService";
import { getContratPdf } from "../../../api/contratService";

function triggerBlobDownload(blob, filename) {
  const data = blob instanceof Blob ? blob : new Blob([blob], { type: "application/pdf" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * @param {string|number} candidatId — GET /Candidats/:id/fiche-pdf
 * @param {string|number} [contratId] — GET /Contrats/:id/pdf (premier contrat du profil)
 * @param {boolean} [forHeader] — style lisible sur bandeau foncé
 */
const CandidatPdfActions = ({ candidatId, contratId, forHeader = false }) => {
  const [loadingFiche, setLoadingFiche] = useState(false);
  const [loadingContrat, setLoadingContrat] = useState(false);

  const headerBtnSx = forHeader
    ? {
        color: "white",
        borderColor: "rgba(255,255,255,0.85)",
        "&:hover": {
          borderColor: "white",
          bgcolor: "rgba(255,255,255,0.12)",
        },
        "&.Mui-disabled": {
          color: "rgba(255,255,255,0.4)",
          borderColor: "rgba(255,255,255,0.3)",
        },
      }
    : {};

  const handleFiche = async () => {
    if (candidatId == null || candidatId === "") return;
    setLoadingFiche(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const autoEcoleId = storedUser.autoEcoleId;
      const blob = await getCandidatFichePdf(candidatId, autoEcoleId);
      triggerBlobDownload(blob, `fiche_candidat_${candidatId}.pdf`);
    } catch (error) {
      console.error("Erreur téléchargement fiche PDF", error);
      window.alert(
        error.response?.data?.message ||
          "Impossible de générer la fiche candidat (PDF).",
      );
    } finally {
      setLoadingFiche(false);
    }
  };

  const handleContrat = async () => {
    if (contratId == null || contratId === "") return;
    setLoadingContrat(true);
    try {
      const blob = await getContratPdf(contratId);
      triggerBlobDownload(blob, `contrat_${contratId}.pdf`);
    } catch (error) {
      console.error("Erreur téléchargement contrat PDF", error);
      window.alert(
        error.response?.data?.message ||
          "Impossible de générer le contrat (PDF).",
      );
    } finally {
      setLoadingContrat(false);
    }
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
      <Button
        variant="outlined"
        color={forHeader ? "inherit" : "primary"}
        size="small"
        startIcon={<DescriptionIcon />}
        onClick={handleFiche}
        disabled={loadingFiche}
        sx={{ textTransform: "none", fontWeight: 600, ...headerBtnSx }}
      >
        {loadingFiche ? "…" : "Fiche candidat (PDF)"}
      </Button>
      <Button
        variant="outlined"
        color={forHeader ? "inherit" : "primary"}
        size="small"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleContrat}
        disabled={
          loadingContrat ||
          contratId === undefined ||
          contratId === null ||
          contratId === ""
        }
        sx={{ textTransform: "none", fontWeight: 600, ...headerBtnSx }}
        title={
          contratId === undefined || contratId === null || contratId === ""
            ? "Aucun contrat associé à ce candidat"
            : ""
        }
      >
        {loadingContrat ? "…" : "Contrat (PDF)"}
      </Button>
    </Stack>
  );
};

export default CandidatPdfActions;
