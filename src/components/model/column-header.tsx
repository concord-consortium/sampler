import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getAttribute, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { getNewColumnName } from "../helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { AnimationStep, IAnimationStepSettings, IColumn } from "../../types";
import { renameAttributeInFormulas } from "../../helpers/codap-helpers";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { model, isRunning } = globalState;
  const [columnName, setColumnName] = useState(column.name);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [label, setLabel] = useState("");
  const [opacity, setOpacity] = useState(0);

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

  useEffect(() => {
    if (inputRef.current) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      inputRef.current.style.height = "0px";
      const scrollHeight = inputRef.current.scrollHeight;

      // We then set the height directly, outside of the render loop, subtracting 2 to account for the border.
      inputRef.current.style.height = (scrollHeight - 2) + "px";
    }
  }, [inputRef, columnName]);

  const isCollector = useMemo(() => {
    return model.columns[columnIndex].devices[0].viewType === "collector";
  }, [model, columnIndex]);

  const handleNameChange = async () => {
    const newName = getNewColumnName(columnName.trim(), model.columns, column.id);

    // do not allow the user to clear the input and leave it empty
    if (newName.length === 0) {
      setColumnName(column.name);
      return;
    }

    if (globalState.samplerContext) {
      const dataContextName = globalState.samplerContext.name;
      const oldAttrName = globalState.attrMap[column.id].name;
      const attr = (await getAttribute(dataContextName, "items", oldAttrName)).values;
      await updateAttribute(dataContextName, "items", oldAttrName, attr, {name: newName});
      await renameAttributeInFormulas(dataContextName, oldAttrName, newName);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      <textarea
        rows={1}
        ref={inputRef}
        disabled={isRunning || isCollector}
        className="attr-name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        onBlur={handleNameChange}
      >
      </textarea>
      <div className="device-column-header-label" style={{opacity}}>
        {label}
      </div>
    </div>
  );
};
