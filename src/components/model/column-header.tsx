import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getAttribute, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../contants";
import { getNewColumnName } from "../helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { AnimationStep, IAnimationStepSettings, IColumn, ViewType } from "../../types";

import "./device-column-header.scss";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { model, isRunning, collectorContext } = globalState;
  const [columnName, setColumnName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [opacity, setOpacity] = useState(0);
  
  // Check if this column contains a collector device
  const hasCollectorDevice = column.devices.some(device => device.viewType === ViewType.Collector);
  
  // Use dataset name for collector device
  const isEditable = !hasCollectorDevice || !collectorContext;
  const displayName = hasCollectorDevice && collectorContext ? collectorContext.title : columnName;

  const animate = (step: AnimationStep, settings?: IAnimationStepSettings) => {
    const { kind } = step;
    if (kind === "showLabel") {
      if (step.columnIndex === columnIndex) {
        setOpacity(settings?.t ?? 1);
        setLabel(step.selectedVariable);
      }
    } else if ((kind === "startSelectItem") || (kind === "endSelectItem") || (kind === "endExperiment")) {
      setOpacity(0);
      setLabel("");
    }
  };

  useEffect(() => {
    return registerAnimationCallback(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setColumnName(column.name);
  }, [column.name]);

  const handleNameChange = async () => {
    // Don't allow name changes for collector devices
    if (!isEditable) return;
    
    const newName = getNewColumnName(columnName.trim(), model.columns, column.id);
    if (globalState.samplerContext) {
      const oldAttrName = globalState.attrMap[column.id].name;
      const attr = (await getAttribute(kDataContextName, "items", oldAttrName)).values;
      await updateAttribute(kDataContextName, "items", oldAttrName, attr, {name: newName});
      setColumnName(newName);
      setGlobalState(draft => {
        draft.model.columns[columnIndex].name = newName;
        draft.attrMap[column.id].name = newName;
      });
    } else {
      setColumnName(newName);
      setGlobalState(draft => {
        draft.model.columns[columnIndex].name = newName;
        draft.attrMap[column.id].name = newName;
      });
    }
  };

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = columnName;
    }
  }, [columnName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't process key events for collector devices
    if (!isEditable) return;
    
    switch(e.code) {
      case "Escape":
        inputRef.current?.blur();
        resetInput();
        break;
      case "Enter":
        inputRef.current?.blur();
        handleNameChange();
        break;
    }
  };

  return (
    <div className="device-column-header">
      {isEditable ? (
        <input
          ref={inputRef}
          disabled={isRunning}
          className="attr-name"
          value={columnName}
          onChange={(e) => setColumnName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          onBlur={handleNameChange}
        />
      ) : (
        <div className="attr-name dataset-name">
          {displayName}
        </div>
      )}
      <div className="device-column-header-label" style={{opacity}}>
        {label}
      </div>
    </div>
  );
};
