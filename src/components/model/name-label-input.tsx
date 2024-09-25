import React, { useEffect, useRef, useState } from "react";
import { ViewType } from "../../types";

interface IProps {
  variableIdx: number;
  viewType: ViewType;
  variableName: string;
  deviceId: string;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  onBlur: () => void;
}

export const NameLabelInput = ({variableIdx, variableName,
  handleEditVariable, onBlur, viewType, deviceId}: IProps) => {
  const [text, setText] = useState<string>(variableName);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const idStr = viewType === ViewType.Spinner ? "wedge" : "ball";
    const textLabel = document.getElementById(`${deviceId}-${idStr}-label-${variableName}-${variableIdx}`);
    if (textLabel && ref.current) {
      ref.current.focus();
      const {x, y, height} = textLabel.getBoundingClientRect();
      const width = Math.min(30, Math.max(10, variableName.length * 3)) + "vh";
      ref.current.style.top = `${y + 4 + (height / 2)}px`;
      ref.current.style.left = `${x}px`;
      ref.current.style.width = `${width}`;
    }
  }, [variableIdx, viewType, deviceId, variableName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimText = text.trim();
      handleEditVariable(variableIdx, trimText);
      onBlur();
    }
  };

  const handleBlur = () => {
    const trimText = text.trim();
    handleEditVariable(variableIdx, trimText);
    onBlur();
  };

  return (
    <input
      ref={ref}
      style={{position: "fixed"}}
      className="variable-label-input"
      type="text"
      value={text}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onChange={(e) => setText(e.currentTarget.value)}
    />
  );
};
