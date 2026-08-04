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

// Asks whether the attribute a column stands for is the one now called newName, for when a rename
// stopped answering rather than reported an outcome. The name alone would not settle it: deleting a
// column leaves an attribute that holds data behind, so an attribute can outlive the column that
// named it and a later column can ask for the same name. Reads as not renamed whenever the question
// cannot be answered, which includes not knowing the attribute's id.
const codapRenamedAttribute =
  async (dataContextName: string, collectionName: string, codapID: string | null, newName: string) => {
    if (!codapID) {
      return false;
    }
    const attrList = await tryRequest(() => getAttributeList(dataContextName, collectionName),
      `could not read the attributes of ${collectionName}`);
    if (!attrList?.success || !Array.isArray(attrList.values)) {
      return false;
    }
    return attrList.values.some((attr: {id: string | number, name: string}) =>
      attr.name === newName && String(attr.id) === String(codapID));
  };

export const ColumnHeader = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { registerAnimationCallback } = useAnimationContext();
  const { model, isRunning, collectorContextName } = globalState;
  const [columnName, setColumnName] = useState(column.name);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cancelEditRef = useRef(false);
  const committingRef = useRef(false);
  const typedNameRef = useRef(column.name);
  const committingNameRef = useRef(column.name);
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
    typedNameRef.current = column.name;
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

  // The strings this writes, and the field's label below, are English rather than tr() keys, for the
  // reason given at the TODO in components/measures/measures.tsx: tr() renders the key itself when a
  // string is missing, so the POEditor entries have to exist before the keys can be used.
  const handleNameChange = async () => {
    // Escape restores the name and then blurs, and blurring is what commits, so the commit has to
    // know to stand down.
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }

    // Leaving the field, returning to it and leaving again commits twice over, and the second commit
    // would ask CODAP for a name the first has already renamed away and read that as a refusal. The
    // field goes back to the name actually on its way to CODAP, so that it says what is happening
    // rather than showing an edit that is not being made.
    if (committingRef.current) {
      typedNameRef.current = committingNameRef.current;
      setColumnName(committingNameRef.current);
      setMessage(`Still renaming to ${committingNameRef.current}.`);
      return;
    }

    const typedName = typedNameRef.current.trim();
    const newName = getNewColumnName(typedName, model.columns, column.id);

    // do not allow the user to clear the input and leave it empty
    if (newName.length === 0) {
      setColumnName(column.name);
      setMessage("A column needs a name.");
      return;
    }

    if (newName === column.name) {
      // nothing to rename. Saying so anyway would write to the document, and put an entry on CODAP's
      // undo stack, every time the field is tabbed through
      return;
    }

    if (newName !== typedName) {
      setMessage(`Another column is called ${typedName}, so this one is ${newName}.`);
    }

    const keepOldName = (reason: string) => {
      console.warn(`Sampler: ${reason}`);
      setColumnName(column.name);
      setMessage(`Could not rename ${column.name}.`);
    };

    committingNameRef.current = newName;
    committingRef.current = true;
    try {
      await commitNameChange(newName, keepOldName);
    } finally {
      committingRef.current = false;
    }
  };

  const commitNameChange = async (newName: string, keepOldName: (reason: string) => void) => {
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
        keepOldName(`there is no attribute named ${oldAttrName} to rename`);
        return;
      }
      const renameResult = await tryRequest(
        () => updateAttribute(dataContextName, itemsCollectionName, oldAttrName, attrResult.values, {name: newName}),
        `could not rename the attribute ${oldAttrName}`);
      // No answer means only that we stopped waiting -- CODAP may have renamed the attribute anyway.
      // Keeping the old name and taking the new one both risk the column and the attribute
      // disagreeing, so ask CODAP what became of this attribute rather than picking one.
      const renamed = renameResult
        ? renameResult.success
        : await codapRenamedAttribute(
            dataContextName, itemsCollectionName, globalState.attrMap[column.id]?.codapID ?? null, newName);
      if (!renamed) {
        keepOldName(`CODAP did not rename ${oldAttrName} to ${newName}`);
        return;
      }
    }

    // CODAP keeps formulas that reference the attribute correct on its own -- it stores them against
    // attribute ids and regenerates the displayed text -- so renaming it is all there is to do here
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    typedNameRef.current = e.target.value;
    setColumnName(e.target.value);
    // the message described a name the field no longer holds, and clearing it means the next failure
    // moves the region from empty to filled, which is what a screen reader announces
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch(e.code) {
      case "Escape":
        cancelEditRef.current = true;
        typedNameRef.current = column.name;
        setColumnName(column.name);
        setMessage("");
        // blur runs the commit synchronously, which clears the latch, so it cannot be left standing
        inputRef.current?.blur();
        cancelEditRef.current = false;
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
        onChange={handleChange}
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
