import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CandidatForm from "./CandidatForm";

const AddCandidatModal = ({ open, onClose, onSuccess }) => {
  const [errMessage, setErrMessage] = useState("");

  const handleClose = () => {
    setErrMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Ajouter un candidat
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <CandidatForm errMessage={errMessage} setErrMessage={setErrMessage} onSuccess={() => {
            if (onSuccess) onSuccess();
            handleClose();
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidatModal;
