import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { validateFormula } from "../../utils/utils";
import { IDevice } from "../../types";
import { trackFormula } from "../../utils/formula/FormulaVariableRenaming";

interface IProps {
  source: IDevice;
  target: IDevice;
  columnIndex: number;
  arrowMidPoint: number;
  svgWidth: number;
  horizontalArrow: boolean;
}

const kMaxLabelHeight = 22;

export const FormulaEditor = ({source, target, columnIndex, arrowMidPoint, svgWidth, horizontalArrow}: IProps) => {
  const {globalState: { isRunning }, setGlobalState} = useGlobalStateContext();
  const [editing, setEditing] = useState(false);
  const [formula, setFormula] = useState(source.formulas[target.id]);
  const labelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [formulaValid, setFormulaValid] = useState(validateFormula(source.formulas[target.id]));

  const resetLabelInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = formula;
    }
  }, [formula]);

  const handleToggleEditing = () => {
    setEditing((prev) => {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 1);
      return !prev;
    });
  };

  const handleUpdateLabel = useCallback(() => {
    const trimmedLabel = (inputRef.current?.value ?? "").trim();
    if (trimmedLabel.length > 0) {
      setFormula(trimmedLabel);
      setFormulaValid(validateFormula(trimmedLabel));
      setGlobalState(draft => {
        const sourceIdx = draft.model.columns[columnIndex].devices.findIndex(d => d.id === source.id);
        draft.model.columns[columnIndex].devices[sourceIdx].formulas[target.id] = trimmedLabel;
      });
      
      // Track the formula for variable renaming
      trackFormula(source.id, target.id, trimmedLabel);
      
      handleToggleEditing();
    } else {
      if (inputRef.current) {
        inputRef.current.value = "*";
        setFormula("*");
      }
    }
  }, [source.id, target.id, columnIndex, setFormula, setFormulaValid, setGlobalState]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // clicks outside the label ref commits the edit
      let walker = e.target as HTMLElement|null;
      while (walker !== null) {
        if (walker === labelRef.current) {
          return;
        }
        walker = walker.parentElement;
      }
      handleUpdateLabel();
    };
    if (editing) {
      addEventListener("mouseup", handleMouseUp);
      return () => removeEventListener("mouseup", handleMouseUp);
    }
  }, [editing, handleUpdateLabel]);

  const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpdateLabel();
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch(e.code) {
      case "Escape":
        handleToggleEditing();
        resetLabelInput();
        break;
      case "Enter":
        handleToggleEditing();
        handleUpdateLabel();
        break;
    }
  };

  const labelTop = horizontalArrow ? 0 : arrowMidPoint < 0 ? arrowMidPoint - kMaxLabelHeight/2 : -arrowMidPoint - kMaxLabelHeight;
  const labelStyle: React.CSSProperties = {top: labelTop};

  return (
    <div ref={labelRef} className="arrow-label" style={labelStyle}>
      { editing
        ? <form className="label-form" onSubmit={handleSubmitEdit}>
            <input disabled={isRunning} type="text" ref={inputRef} defaultValue={formula} onKeyDown={handleLabelKeyDown}
                style={{height: kMaxLabelHeight}}/>
          </form>
        : <div
            className={`label-span ${source.id} ${isRunning ? "disabled" : ""} ${!formulaValid ? "invalid" : ""}`}
            tabIndex={0}
            onKeyDown={handleToggleEditing}
            onClick={isRunning ? undefined : handleToggleEditing}
          >
            {formula}
          </div>
      }
    </div>
  );
};
