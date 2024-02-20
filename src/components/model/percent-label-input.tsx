import React, { useEffect, useRef, useState } from "react";

interface IVariableLabelInput {
  percent: string;
  variableIdx: number;
  variableName: string;
  deviceId: string;
  handlePctChange: (variableIdx: number, newPct: string) => void;
  onBlur: () => void;
}

export const PctLabelInput = ({percent, variableIdx, variableName, deviceId,
  handlePctChange, onBlur}: IVariableLabelInput) => {
  const [text, setText] = useState<string>(percent);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textLabel = document.getElementById(`${deviceId}-wedge-pct-${variableName}`);
    if (textLabel && ref.current) {
      ref.current.focus();
      const {x, y, height} = textLabel.getBoundingClientRect();
      const width = Math.min(30, Math.max(10, variableName.length * 3)) + "vh";
      ref.current.style.top = `${y + 4 + (height / 2)}px`;
      ref.current.style.left = `${x}px`;
      ref.current.style.width = `${width}`;
    }
  }, [variableIdx, deviceId, variableName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePctChange(variableIdx, text);
      onBlur();
    } else if (e.key === "Tab") {
      e.preventDefault();
      handlePctChange(variableIdx, text);
      onBlur();
    }
  };

  const handleBlur = () => {
    handlePctChange(variableIdx, text);
    onBlur();
  };

  return (
    <input
      ref={ref}
      style={{position: "fixed"}}
      className="percent-label-input"
      type="text"
      value={text}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onChange={(e) => setText(e.currentTarget.value)}
    />
  );
};
