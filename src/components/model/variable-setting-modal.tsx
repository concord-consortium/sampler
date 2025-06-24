import React, { useState, useRef } from "react";
import { tr } from "../../utils/localeManager";
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
  const dialogBoxTitle = tr("DG.Plugin.Sampler.options.item-labels");
  const dialogBoxPrompt = tr("DG.Plugin.Sampler.sample-list.prompt");
  const placeholder = tr("DG.Plugin.Sampler.sample-list.initial-value");
  const okLabel = tr("DG.Plugin.Sampler.sample-list.ok");
  const cancelLabel = tr("DG.Plugin.Sampler.sample-list.cancel");

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
        <span>{dialogBoxTitle}</span>
      </div>
      <div className="modal-body">
        <label htmlFor="variable_names" className="set-variables-input-label">{dialogBoxPrompt}</label>
        <input
          id="variable_names"
          className="set-variables-input"
          type="text"
          autoFocus={true}
          placeholder={placeholder}
          value={candidateVariable}
          onChange={(e) => handleVariablesChange(e.target.value)}
          onKeyDown={handleVariablesChangeKeyDown}
        />
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>
          {cancelLabel}
        </button>
        <button className="modal-button" onClick={handleSubmitVariableSetting}>
          {okLabel}
        </button>
      </div>
    </div>
  );
};
