import React, { useEffect, useRef, useState } from "react";

interface IVariableLabelInput {
  variableIdx: number;
  viewType: "mixer" | "spinner" | "collector";
  variableName: string;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  onBlur: () => void;
}

export const NameLabelInput = ({variableIdx, variableName,
  handleEditVariable, onBlur, viewType}: IVariableLabelInput) => {
  const [text, setText] = useState<string>(variableName);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const idStr = viewType === "spinner" ? "wedge" : "ball";
    const textLabel = document.getElementById(`${idStr}-label-${variableName}-${variableIdx}`);
    if (textLabel && ref.current) {
      ref.current.focus();
      const {x, y, height} = textLabel.getBoundingClientRect();
      const width = Math.min(30, Math.max(10, variableName.length * 3)) + "vh";
      ref.current.style.top = `${y + 4 + (height / 2)}px`;
      ref.current.style.left = `${x}px`;
      ref.current.style.width = `${width}`;
    }
  }, [variableIdx, viewType, variableName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEditVariable(variableIdx, text);
      onBlur();
    }
  };

  const handleBlur = () => {
    handleEditVariable(variableIdx, text);
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
