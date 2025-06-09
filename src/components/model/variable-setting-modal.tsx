import React, { useState, useRef, useMemo, CSSProperties } from "react";

import "./variable-setting-modal.scss";

interface IProps {
  defaultValue: string;
  setShowVariableEditor: (show: boolean) => void;
  handleUpdateVariablesToSeries: (series: string) => void;
}

type ClientPosition = { clientX: number; clientY: number };

export const SetVariableSeriesModal = ({
  defaultValue,
  setShowVariableEditor,
  handleUpdateVariablesToSeries,
}: IProps) => {
  const [candidateVariable, setCandidateVariable] = useState<string>(defaultValue);

  // Drag state
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [dragged, setDragged] = useState(false);
  const [position, _setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const style = useMemo(() => {
    if (!dragged) {
      return undefined;
    }

    const { x, y } = position;

    return {
      position: "fixed",
      left: x + delta.x,
      top: y + delta.y,
      zIndex: 1000,
      cursor: dragging ? "grabbing" : "default",
      touchAction: "none",
    } as CSSProperties;
  }, [dragged, position, delta, dragging]);

  const setPosition = ({clientX, clientY}: ClientPosition) => {
    _setPosition(() => ({x: clientX, y: clientY}));
  };

  const startDrag = ({clientX, clientY}: ClientPosition) => {
    setDragged(true);
    setDragging(true);

    setDelta({
      x: (modalRef.current?.getBoundingClientRect().left || 0) - clientX,
      y: (modalRef.current?.getBoundingClientRect().top || 0) - clientY,
    });
    setPosition({ clientX, clientY });
  };

  // Mouse events
  const handleMouseDown = (downE: React.MouseEvent<HTMLDivElement>) => {
    startDrag(downE);

    const handleMouseMove = (moveE: MouseEvent) => {
      setPosition(moveE);
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchStart = (eStart: React.TouchEvent<HTMLDivElement>) => {
    startDrag(eStart.touches[0]);

    const handleTouchMove = (eMove: TouchEvent) => {
      setPosition(eMove.touches[0]);
    };

    const handleTouchEnd = () => {
      setDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

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
