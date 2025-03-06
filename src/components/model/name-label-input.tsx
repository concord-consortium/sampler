import React, { useEffect, useRef, useState, useCallback } from "react";
import { ViewType } from "../../types";
import "./name-label-input.scss";

interface IProps {
  variableIdx: number;
  viewType: ViewType;
  variableName: string;
  deviceId: string;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  onBlur: () => void;
  existingNames?: string[];
}

export const NameLabelInput = ({
  variableIdx,
  variableName,
  handleEditVariable,
  onBlur,
  viewType,
  deviceId,
  existingNames = []
}: IProps) => {
  const [text, setText] = useState<string>(variableName);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate the input against existing names
  const validateInput = (value: string): boolean => {
    const trimmedValue = value.trim();
    
    // Check if empty
    if (trimmedValue === "") {
      setErrorMessage("Name cannot be empty");
      return false;
    }
    
    // Check for duplicates (excluding the current name)
    if (existingNames.includes(trimmedValue) && trimmedValue !== variableName) {
      setErrorMessage("This name already exists");
      return false;
    }
    
    setErrorMessage("");
    return true;
  };

  // Update input width based on content
  const updateInputWidth = useCallback((value: string) => {
    if (measureRef.current && inputRef.current) {
      measureRef.current.textContent = value;
      const width = measureRef.current.offsetWidth;
      
      // Add padding and set min/max constraints
      const paddedWidth = width + 16; // 8px padding on each side
      const constrainedWidth = Math.max(60, Math.min(300, paddedWidth));
      
      inputRef.current.style.width = `${constrainedWidth}px`;
    }
  }, [measureRef, inputRef]);

  // Position the input based on the label element
  const positionInput = useCallback(() => {
    const idStr = viewType === ViewType.Spinner ? "wedge" : "ball";
    const textLabel = document.getElementById(`${deviceId}-${idStr}-label-${variableName}-${variableIdx}`);
    
    if (textLabel && inputRef.current && containerRef.current) {
      const { x, y, height } = textLabel.getBoundingClientRect();
      
      // Position the container
      containerRef.current.style.position = "fixed";
      containerRef.current.style.top = `${y + 4 + (height / 2)}px`;
      containerRef.current.style.left = `${x}px`;
      containerRef.current.style.zIndex = "1000";
    }
  }, [deviceId, variableIdx, variableName, viewType, inputRef, containerRef]);

  // Initialize component
  useEffect(() => {
    positionInput();
    updateInputWidth(text);
    
    // Focus and select all text
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [variableIdx, viewType, deviceId, variableName, positionInput, updateInputWidth, text]);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    updateInputWidth(newValue);
    setIsValid(validateInput(newValue));
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isValid) {
        const trimText = text.trim();
        handleEditVariable(variableIdx, trimText);
        onBlur();
      }
    } else if (e.key === "Escape") {
      // Cancel editing
      onBlur();
    }
  };

  // Handle blur event
  const handleBlur = () => {
    if (isValid) {
      const trimText = text.trim();
      handleEditVariable(variableIdx, trimText);
    }
    onBlur();
  };

  return (
    <div ref={containerRef} className="input-container">
      {!isValid && (
        <div className={`error-tooltip ${!isValid ? 'visible' : ''}`}>
          {errorMessage}
        </div>
      )}
      <input
        ref={inputRef}
        className={`variable-label-input ${!isValid ? 'invalid' : ''}`}
        type="text"
        value={text}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        aria-invalid={!isValid}
        aria-describedby={!isValid ? "error-message" : undefined}
      />
      <span ref={measureRef} className="hidden-text-measure" aria-hidden="true"></span>
    </div>
  );
};
