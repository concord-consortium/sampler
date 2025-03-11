import React, { useState } from "react";

import "./variable-setting-modal.scss";

interface IProps {
  setShowVariableEditor: (show: boolean) => void;
  handleUpdateVariablesToSeries: (series: string) => void;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const SetVariableSeriesModal = ({
  setShowVariableEditor, 
  handleUpdateVariablesToSeries,
  className,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby
}: IProps) => {
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
    <div 
      className={`set-variables-modal ${className || ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby || "variable-editor-title"}
      aria-describedby={ariaDescribedby}
    >
      <div className="modal-header">
        <h2 id="variable-editor-title">Set Variables</h2>
        <button 
          className="close-button" 
          onClick={handleCloseModal}
          aria-label="Close variable editor"
        >
          ×
        </button>
      </div>
      <div className="modal-content">
        <label htmlFor="variable-input" className="variable-label">Enter comma-separated variable names:</label>
        <input
          id="variable-input"
          type="text"
          className="variable-input"
          value={candidateVariable}
          onChange={(e) => handleVariablesChange(e.target.value)}
          onKeyDown={handleVariablesChangeKeyDown}
          aria-describedby="variable-input-help"
        />
        <p id="variable-input-help" className="help-text">
          Separate multiple variables with commas (e.g., &quot;var1, var2, var3&quot;)
        </p>
      </div>
      <div className="modal-footer">
        <button 
          className="cancel-button" 
          onClick={handleCloseModal}
          aria-label="Cancel variable changes"
        >
          Cancel
        </button>
        <button 
          className="submit-button" 
          onClick={handleSubmitVariableSetting}
          aria-label="Apply variable changes"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
