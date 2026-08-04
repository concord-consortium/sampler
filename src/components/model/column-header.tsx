import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getAttribute, getAttributeList, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { getNewColumnName } from "../helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { AnimationStep, IAnimationStepSettings, IColumn } from "../../types";
import { getCollectionNames, tryRequest } from "../../helpers/codap-helpers";
import { isCollectorOnlyModel } from "../../utils/collector";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

// Asks CODAP which name it holds, for when a rename stopped answering rather than reported an
// outcome. Reads as not renamed when the question itself cannot be answered.
const codapHoldsName = async (dataContextName: string, collectionName: string, name: string) => {
  const attrList = await tryRequest(() => getAttributeList(dataContextName, collectionName),
    `could not read the attributes of ${collectionName}`);
  return !!attrList?.success && attrList.values.some((attr: {name: string}) => attr.name === name);
};

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { model, isRunning, collectorContextName } = globalState;
  const [columnName, setColumnName] = useState(column.name);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cancelEditRef = useRef(false);
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
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
    // Escape restores the name and then blurs, and blurring is what commits, so the commit has to
    // know to stand down.
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }

    const newName = getNewColumnName(columnName.trim(), model.columns, column.id);

    // do not allow the user to clear the input and leave it empty
    if (newName.length === 0) {
      setColumnName(column.name);
      return;
    }

    const keepOldName = () => {
      setColumnName(column.name);
      setMessage(`Could not rename ${column.name}.`);
    };

    // Renaming the column while CODAP still knows the attribute by its old name is what leaves the
    // stale attribute behind on the next run, so the column keeps its old name unless CODAP renamed
    // the attribute.
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
        keepOldName();
        return;
      }
      const renameResult = await tryRequest(
        () => updateAttribute(dataContextName, itemsCollectionName, oldAttrName, attrResult.values, {name: newName}),
        `could not rename the attribute ${oldAttrName}`);
      // No answer means only that we stopped waiting -- CODAP may have renamed the attribute anyway.
      // Keeping the old name and taking the new one both risk the column and the attribute
      // disagreeing, so ask CODAP which name it holds rather than picking one.
      const renamed = renameResult
        ? renameResult.success
        : await codapHoldsName(dataContextName, itemsCollectionName, newName);
      if (!renamed) {
        keepOldName();
        return;
      }
    }

    // CODAP keeps formulas that reference the attribute correct on its own -- it stores them against
    // attribute ids and regenerates the displayed text -- so renaming it is all there is to do here
    setMessage("");
    setColumnName(newName);
    setGlobalState(draft => {
      // a column can be deleted while the requests above are in flight, taking its attrMap entry
      // with it, and columnIndex addresses a different column once one to its left is gone
      const draftColumn = draft.model.columns.find(c => c.id === column.id);
      if (draftColumn) {
        draftColumn.name = newName;
      }
      if (draft.attrMap[column.id]) {
        draft.attrMap[column.id].name = newName;
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch(e.code) {
      case "Escape":
        cancelEditRef.current = true;
        setColumnName(column.name);
        inputRef.current?.blur();
        break;
      case "Enter":
        // blurring commits, so committing here as well would run the whole exchange twice
        inputRef.current?.blur();
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
        aria-label="Column name"
        value={isCollectorOnlyModel(model) ? collectorContextName : columnName}
        onChange={(e) => setColumnName(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        onBlur={handleNameChange}
      >
      </textarea>
      <div className="device-column-header-label" style={{opacity}}>
        {label}
      </div>
      <div className="device-column-header-message" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
};
