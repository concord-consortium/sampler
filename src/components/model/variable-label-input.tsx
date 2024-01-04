import React, { useEffect, useRef } from "react";

interface IVariableLabelInput {
  variableIdx: number;
  variableName: string;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  handleBlur: () => void;
}

export const VariableLabelInput = ({variableIdx, variableName,
  handleEditVariable, handleBlur}: IVariableLabelInput) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textLabel = document.getElementById(`ball-text-${variableName}-${variableIdx}`);
    if (textLabel && ref.current) {
      ref.current.focus();
      const {x, y, height} = textLabel.getBoundingClientRect();
      const width = Math.min(30, Math.max(10, variableName.length * 3)) + "vh";
      ref.current.style.top = `${y + 4 + (height / 2)}px`;
      ref.current.style.left = `${x}px`;
      ref.current.style.width = `${width}`;
    }
  }, [variableIdx, variableName]);

  return (
    <input
      ref={ref}
      style={{position: "fixed"}}
      className="variable-label-input"
      type="text"
      value={variableName}
      onBlur={handleBlur}
      onChange={(e) => handleEditVariable(variableIdx, e.target.value)}
    />
  );
};
