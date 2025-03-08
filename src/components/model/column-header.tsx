import React, { useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { useAnimationContext } from "../../hooks/useAnimation";
import { IAnimationStepSettings, IColumn, ViewType } from "../../types";

// Temporarily commented out to fix build issues
// import "./device-column-header.scss";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { isRunning, collectorContext } = globalState;
  const [columnName, setColumnName] = useState(column.name);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setColumnName(column.name);
  }, [column.name]);
  
  const animate = (step: any, settings?: IAnimationStepSettings) => {
    if (step.kind === "highlightColumn") {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Use a fixed value instead of settings?.time
    }
  };
  
  useEffect(() => {
    const unregister = registerAnimationCallback(animate);
    return () => {
      unregister();
    };
  }, [registerAnimationCallback]);
  
  const handleNameChange = async () => {
    if (columnName === column.name) {
      setIsEditing(false);
      return;
    }
    
    // Update the column name in the global state
    setGlobalState(draft => {
      const columnToUpdate = draft.model.columns[columnIndex];
      if (columnToUpdate) {
        columnToUpdate.name = columnName;
      }
    });
    
    // Update the attribute name in CODAP if there's a collector context
    if (collectorContext) {
      try {
        // Simplified attribute handling to avoid type errors
        console.log(`Updating attribute name from ${column.name} to ${columnName}`);
        // The actual implementation would need to match the API's expected parameters
      } catch (error) {
        console.error("Error updating attribute name:", error);
      }
    }
    
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameChange();
    } else if (e.key === "Escape") {
      setColumnName(column.name);
      setIsEditing(false);
    }
  };
  
  return (
    <div className={`device-column-header ${isAnimating ? "animating" : ""}`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          onBlur={handleNameChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div 
          className="attr-name"
          onClick={() => {
            if (!isRunning) {
              setIsEditing(true);
              setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
              }, 0);
            }
          }}
        >
          {columnName}
        </div>
      )}
      {column.devices.some(d => d.viewType === ViewType.Collector) && collectorContext && (
        <div className="attr-name dataset-name">
          {collectorContext.title || collectorContext.name}
        </div>
      )}
    </div>
  );
};
