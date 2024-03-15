import React, { useCallback, useEffect, useRef, useState } from "react";
import { IDevice } from "../../models/device-model";
import { useGlobalStateContext } from "../../hooks/useGlobalState";

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
  const [label, setLabel] = useState(source.formulas[target.id]);
  const labelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelDivWidth = labelRef.current?.getBoundingClientRect().width || 22;

  const resetLabelInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = label;
    }
  }, [label]);

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
      setLabel(trimmedLabel);
      setGlobalState(draft => {
        const sourceIdx = draft.model.columns[columnIndex].devices.findIndex(d => d.id === source.id);
        draft.model.columns[columnIndex].devices[sourceIdx].formulas[target.id] = trimmedLabel;
      });
      handleToggleEditing();
    } else {
      if (inputRef.current) {
        inputRef.current.value = "*";
        setLabel("*");
      }
    }
  }, [source.id, target.id, columnIndex, setLabel, setGlobalState]);

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
  const labelLeft = (svgWidth / 2) - (labelDivWidth / 2);
  const labelStyle: React.CSSProperties = {top: labelTop, left: labelLeft};


  return (
    <div ref={labelRef} className="arrow-label" style={labelStyle}>
      { editing
        ? <form className="label-form" onSubmit={handleSubmitEdit}>
            <input disabled={isRunning} type="text" ref={inputRef} defaultValue={label} onKeyDown={handleLabelKeyDown}
                style={{height: kMaxLabelHeight}} />
          </form>
        : <div
            className={`label-span ${source.id} ${isRunning ? "disabled" : ""}`}
            tabIndex={0}
            onKeyDown={handleToggleEditing}
            onClick={isRunning ? undefined : handleToggleEditing}
          >
            {label}
          </div>
      }
    </div>
  );
};
