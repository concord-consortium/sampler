import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getAttribute, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { getNewColumnName } from "../helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { AnimationStep, IAnimationStepSettings, IColumn } from "../../types";
import { getCollectionNames, tryRequest } from "../../helpers/codap-helpers";
import { isCollectorOnlyModel } from "../../utils/collector";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { model, isRunning, collectorContextName } = globalState;
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

    // Renaming the column while CODAP still knows the attribute by its old name is what leaves the
    // stale attribute behind on the next run, so the column keeps its old name unless CODAP renamed
    // the attribute. A request can also reject rather than report failure -- it does so on a timeout
    // and on a closed connection -- which has to mean the same thing here.
    if (globalState.dataContextName) {
      const { dataContextName } = globalState;
      const itemsCollectionName = getCollectionNames().items;
      // deleting a column takes its attrMap entry with it, so this can be gone by the time a pending
      // edit is committed
      const oldAttrName = globalState.attrMap[column.id]?.name;
      // updateAttribute renames by name and ignores the attribute it is handed, so this asks only
      // whether there is still something to rename
      const attrResult = oldAttrName
        ? await tryRequest(() => getAttribute(dataContextName, itemsCollectionName, oldAttrName),
            `could not look up the attribute named ${oldAttrName}`)
        : undefined;
      if (!attrResult?.success) {
        setColumnName(column.name);
        return;
      }
      const renameResult = await tryRequest(
        () => updateAttribute(dataContextName, itemsCollectionName, oldAttrName, attrResult.values, {name: newName}),
        `could not rename the attribute ${oldAttrName}`);
      if (!renameResult?.success) {
        setColumnName(column.name);
        return;
      }
    }

    // formulas that reference the attribute are CODAP's to update -- see the commented-out
    // renameAttributeInFormulas in codap-helpers for why the plugin no longer rewrites them
    setColumnName(newName);
    setGlobalState(draft => {
      draft.model.columns[columnIndex].name = newName;
      draft.attrMap[column.id].name = newName;
    });
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
        value={isCollectorOnlyModel(model) ? collectorContextName : columnName}
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
