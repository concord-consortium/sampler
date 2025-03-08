import React, { useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { useAnimationContext } from "../../hooks/useAnimation";
import { IAnimationStepSettings, IColumn, ViewType } from "../../types";
import { renameAttribute } from "../../helpers/codap-helpers";
import { kDataContextName } from "../../contants";
import { getDataContext } from "@concord-consortium/codap-plugin-api";

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
    console.log("handleNameChange called with columnName:", columnName, "current column.name:", column.name);
    
    if (columnName === column.name) {
      console.log("No change in name, exiting");
      setIsEditing(false);
      return;
    }
    
    const oldName = column.name;
    console.log("Updating column name from", oldName, "to", columnName);
    
    // Update the column name in the global state
    setGlobalState(draft => {
      const columnToUpdate = draft.model.columns[columnIndex];
      if (columnToUpdate) {
        columnToUpdate.name = columnName;
        console.log("Updated column name in global state");
      } else {
        console.log("Column not found in global state");
      }
    });
    
    // Check if the data context exists directly
    console.log("Checking if data context exists");
    const dataContextResult = await getDataContext(kDataContextName);
    console.log("dataContextResult:", dataContextResult);
    
    if (dataContextResult.success) {
      try {
        console.log("Data context exists, attempting to rename attribute from", oldName, "to", columnName);
        await renameAttribute(kDataContextName, "items", oldName, columnName);
        console.log(`Successfully renamed attribute from ${oldName} to ${columnName}`);
      } catch (error) {
        console.error("Error renaming attribute:", error);
      }
    } else {
      console.log("Data context does not exist, skipping attribute rename");
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
