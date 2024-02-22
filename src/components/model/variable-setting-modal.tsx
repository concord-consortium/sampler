import React, { useState } from "react";

import "./variable-setting-modal.scss";

interface IProps {
  setShowVariableEditor: (show: boolean) => void;
  handleUpdateVariablesToSeries: (series: string) => void;
}

export const SetVariableSeriesModal = ({setShowVariableEditor, handleUpdateVariablesToSeries}: IProps) => {
  const [candidateVariable, setCandidateVariable] = useState<string>("");
  const handleCloseModal = () => {
    setShowVariableEditor(false);
  };
  const handleSubmitVariableSetting = () => {
    handleUpdateVariablesToSeries(candidateVariable);
    setShowVariableEditor(false);
  };
  const handleVariablesChange = (value: string) => {
    setCandidateVariable(value);
  };
  const handleVariablesChangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitVariableSetting();
    }
  };

  return (
    <div className="set-variables-modal">
      <div className="modal-header">
        Set Variable Names
      </div>
      <div className="modal-body">
        <p className="set-variables-body">
        {`Enter a list (e.g. 'cat, cat, dog') or a range (e.g. '1-50', '-5 to 5', '1.0 to 5.0', 'A-Z')`}
        </p>
        <input className="set-variables-input" type="text" placeholder="a to c"
          onChange={(e) => handleVariablesChange(e.target.value)} onKeyDown={handleVariablesChangeKeyDown}/>
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>Cancel</button>
        <button className="modal-button" onClick={handleSubmitVariableSetting}>OK</button>

      </div>
    </div>
  );
};
