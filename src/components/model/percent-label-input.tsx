import React, { useCallback, useEffect, useRef, useState } from "react";

interface IProps {
  percent: string;
  variableIdx: number;
  variableName: string;
  deviceId: string;
  handlePctChange: (variableIdx: number, newPct: string) => void;
  onBlur: () => void;
}

export const PctLabelInput = ({percent, variableIdx, variableName, deviceId,
  handlePctChange, onBlur}: IProps) => {
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

  const acceptInputIfValid = useCallback((showAlert: boolean) => {
    const value = parseFloat(text);
    if (isNaN(value) || value < 0 || value > 100) {
      if (showAlert) {
        alert("Percentages must be between 0 and 100.");
      }
      return;
    }
    handlePctChange(variableIdx, text);
    onBlur();
  }, [handlePctChange, onBlur, text, variableIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      acceptInputIfValid(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      acceptInputIfValid(true);
    } else if (e.key === "-" || e.key === ".") {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    acceptInputIfValid(false);
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
