import React, { useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { useAnimationContext } from "../../hooks/useAnimation";
import { IAnimationStepSettings, IColumn, ViewType } from "../../types";
import { renameAttribute, kDataContextName } from "../../helpers/codap-helpers";
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
    if ((settings as any)?.animateColumnHeader) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  };
  
  useEffect(() => {
    const unregister = registerAnimationCallback(animate);
    return () => {
      unregister();
    };
  }, [registerAnimationCallback]);
  
  const handleNameChange = (newColumnName: string) => {
    console.log("handleNameChange called with columnName:", newColumnName, "current column.name:", column.name);
    
    if (newColumnName === column.name) {
      return;
    }
    
    console.log("Updating column name from", column.name, "to", newColumnName);
    
    // Update the column name in the global state
    setGlobalState(draft => {
      const colIndex = draft.model.columns.findIndex(c => c.id === column.id);
      if (colIndex !== -1) {
        draft.model.columns[colIndex].name = newColumnName;
      }
    });
    console.log("Updated column name in global state");
    
    // If we have a CODAP data context, rename the attribute
    console.log("Checking if data context exists");
    getDataContext(kDataContextName).then((dataContextResult: any) => {
      console.log("dataContextResult:", dataContextResult);
      
      if (dataContextResult.success) {
        console.log("Data context exists, attempting to rename attribute from", column.name, "to", newColumnName);
        renameAttribute(kDataContextName, "items", column.name, newColumnName)
          .then(() => {
            console.log("Successfully renamed attribute from", column.name, "to", newColumnName);
            console.log("Formulas that reference the renamed variable will be updated automatically by CODAP");
          })
          .catch(error => {
            console.error("Error renaming attribute:", error);
          });
      }
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameChange(columnName);
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
          onBlur={(e) => handleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
        />
      ) : (
        <div
          className="column-name"
          onClick={() => !isRunning && setIsEditing(true)}
        >
          {column.name}
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
