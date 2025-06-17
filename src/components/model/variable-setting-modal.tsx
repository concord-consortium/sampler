import React, { useState, useRef } from "react";
import { useDragModal } from "../../hooks/use-drag-modal";

import "./variable-setting-modal.scss";

interface IProps {
  defaultValue: string;
  setShowVariableEditor: (show: boolean) => void;
  handleUpdateVariablesToSeries: (series: string) => void;
}

export const SetVariableSeriesModal = ({
  defaultValue,
  setShowVariableEditor,
  handleUpdateVariablesToSeries,
}: IProps) => {
  const [candidateVariable, setCandidateVariable] = useState<string>(defaultValue);

  const modalRef = useRef<HTMLDivElement>(null);
  const {style, handleMouseDown, handleTouchStart} = useDragModal({modalRef, startPosition: { x: 0, y: 0 }});

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
      className="set-variables-modal"
      ref={modalRef}
      style={style}
    >
      <div
        className="modal-header"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span>Set item labels</span>
      </div>
      <div className="modal-body">
        <label htmlFor="variable_names" className="set-variables-input-label">
          {`Enter a list (e.g. 'cat, cat, dog') or a range (e.g. '1-50', '-5 to 5', '1.0 to 5.0', 'A-Z')`}
        </label>
        <input
          id="variable_names"
          className="set-variables-input"
          type="text"
          autoFocus={true}
          placeholder="a to c"
          value={candidateVariable}
          onChange={(e) => handleVariablesChange(e.target.value)}
          onKeyDown={handleVariablesChangeKeyDown}
        />
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>
          Cancel
        </button>
        <button className="modal-button" onClick={handleSubmitVariableSetting}>
          OK
        </button>
      </div>
    </div>
  );
};
