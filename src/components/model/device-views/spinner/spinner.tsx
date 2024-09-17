import React, { useEffect, useState } from "react";
import { ClippingDef, IDevice } from "../../../../models/device-model";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift, getVariableColor } from "../shared/helpers";
import { Wedge } from "./wedge";
import { SeparatorLine } from "./separator-lines";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { ITextBackerPos, TextBacker, updateTextBackerRefFn } from "./text-backer";
import { Needle } from "./needle";

interface ISpinner {
  device: IDevice;
  selectedVariableIdx: number|null;
  isDragging: boolean;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleDeleteWedge: (e: React.MouseEvent, variableName: string) => void;
  handleSetEditingPct: () => void;
  handleSetEditingVarName: (variableIdx: number) => void;
  handleStartDrag: (originPt: {x: number; y: number;}) => void;
}

export const Spinner = ({device, selectedVariableIdx, isDragging, handleSetSelectedVariable, handleDeleteWedge,
  handleSetEditingPct, handleSetEditingVarName, handleAddDefs, handleStartDrag}: ISpinner) => {
  const { globalState: { isRunning } } = useGlobalStateContext();
  const [fontSize, setFontSize] = useState(16);
  const [selectedWedge, setSelectedWedge] = useState<string|null>(null);
  const [numUniqueVariables, setNumUniqueVariables] = useState(0);
  const { variables, id } = device;
  const [textBackerPos, setTextBackerPos] = useState<ITextBackerPos|undefined>(undefined);

  useEffect(() => {
    const numUnique = [...new Set(variables)].length;
    const size = numUnique >= 20 ? 6
      : numUnique >= 10 ? 10
      : 16;
    setFontSize(size);
    setNumUniqueVariables(numUnique);

    if (selectedVariableIdx !== null) {
      setSelectedWedge(variables[selectedVariableIdx]);
    } else {
      setSelectedWedge(null);
    }
  }, [variables, selectedVariableIdx]);

  function getCurrentAndLastPct(variableName: string, index: number): { lastPercent: number, currPercent: number } {
    const counts = variables.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const uniqueVariables = [...new Set(variables)];
    let lastPercent = 0;
    for (let i = 0; i < index; i++) {
      lastPercent += (counts[uniqueVariables[i]] / variables.length);
    }
    const currPercent = (counts[variableName] / variables.length);
    return { lastPercent, currPercent };
  }

  const handleLabelClick = () => {
    if (isRunning) return;
    handleSetEditingVarName(0);
    handleSetSelectedVariable(0);
  };

  return (
    [...new Set(variables)].length === 1 ?
      <>
        <circle
          cx={kSpinnerX}
          cy={kSpinnerY}
          r={kSpinnerRadius}
          stroke="#000"
          strokeWidth={1}
          fill={getVariableColor(0, 0, false)}
        />
        {/* Safari does not support cursor styling or click handling on svg text elements so this invisible element that
            is drawn behind the text acts as the styling and click handler source */}
        <TextBacker pos={textBackerPos} isDragging={isDragging} onClick={handleLabelClick} />
        <text
          id={`${id}-wedge-label-${variables[0]}-0`}
          x={kSpinnerX}
          y={kSpinnerY}
          textAnchor="middle"
          dy=".25em"
          dx={getTextShift(variables[0], variables[0].length)}
          fill="#000"
          fontSize={fontSize}
          style={{ pointerEvents: "none"}}
          ref={updateTextBackerRefFn(setTextBackerPos)}
        >
          {variables[0]}
        </text>
      </> :
      <>
        {[...new Set(variables)].map((variableName, index) => {
          const varArrayIdx = variables.findIndex((v) => v === variableName);
          const {lastPercent, currPercent} = getCurrentAndLastPct(variableName, index);
          return (
            <Wedge
              key={`${variableName}-${index}`}
              deviceId={id}
              percent={currPercent}
              lastPercent={lastPercent}
              variableName={variableName}
              index={index}
              labelFontSize={fontSize}
              varArrayIdx={varArrayIdx}
              selectedWedge={selectedWedge}
              numUniqueVariables={numUniqueVariables}
              nextVariable={[...new Set(variables)][index + 1]}
              isLastVariable={index === [...new Set(variables)].length - 1}
              isDragging={isDragging}
              handleAddDefs={handleAddDefs}
              handleSetSelectedVariable={handleSetSelectedVariable}
              handleSetEditingVarName={handleSetEditingVarName}
              handleSetEditingPct={handleSetEditingPct}
              handleDeleteWedge={handleDeleteWedge}
            />
          );
        })}
        {isDragging && <circle cx={kSpinnerX} cy={kSpinnerY} r={5} fill="#fff" />}
        {[...new Set(variables)].map((variableName, index) => {
          const varArrayIdx = variables.findIndex((v) => v === variableName);
          const {lastPercent, currPercent} = getCurrentAndLastPct(variableName, index);
          const isLastVariable = index === [...new Set(variables)].length - 1;
          return (
            <SeparatorLine
              key={`${id}-separator-line-${variableName}-${index}`}
              percent={currPercent}
              lastPercent={lastPercent}
              varArrayIdx={varArrayIdx}
              isDragging={isDragging}
              handleSetSelectedVariable={isLastVariable ? undefined : handleSetSelectedVariable}
              handleStartDrag={isLastVariable ? undefined : handleStartDrag}
            />
          );
        })}
        <Needle deviceId={id} />
      </>
    );
  };
