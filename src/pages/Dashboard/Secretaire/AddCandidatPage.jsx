import React, { useState } from "react";
import CandidatForm from "../../../components/common/Candidat/CandidatForm";

const AddCandidatPage = () => {
  const [errMessage, setErrMessage] = useState("");

  return (
    <div>
      <h2>Inscription Candidat</h2>
      <CandidatForm errMessage={errMessage} setErrMessage={setErrMessage} />
    </div>
  );
};

export default AddCandidatPage;
