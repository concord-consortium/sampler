import React, { useEffect, useState } from "react";
import { ClippingDef, IVariables } from "../../../../models/device-model";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift, getVariableColor } from "../shared/helpers";
import { Wedge } from "./wedge";
import { SeparatorLine } from "./separator-lines";

interface ISpinner {
  variables: IVariables;
  selectedVariableIdx: number|null;
  isDragging: boolean;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleDeleteWedge: (e: React.MouseEvent) => void;
  handleSetEditingPct: () => void;
  handleSetEditingVarName: (variableIdx: number) => void;
  handleStartDrag: (originPt: {x: number; y: number;}) => void;
}

export const Spinner = ({variables, selectedVariableIdx, isDragging, handleSetSelectedVariable, handleDeleteWedge,
  handleSetEditingPct, handleSetEditingVarName, handleAddDefs, handleStartDrag}: ISpinner) => {
  const [fontSize, setFontSize] = useState(16);
  const [selectedWedge, setSelectedWedge] = useState<string|null>(null);

  useEffect(() => {
    const numUnique = [...new Set(variables)].length;
    const size = numUnique >= 20 ? 6
      : numUnique >= 10 ? 10
      : 16;
    setFontSize(size);

    if (selectedVariableIdx !== null) {
      setSelectedWedge(variables[selectedVariableIdx]);
    } else {
      setSelectedWedge(null);
    }
  }, [variables, selectedVariableIdx]);

  const getCurrentAndLastPct = (variableName: string, index: number) => {
    const varArrayIdx = variables.findIndex((v) => v === variableName);
    const prevVariables = variables.filter((v, i) => i < varArrayIdx && v !== variableName);
    const numPrevVariables =  index === 0 ? 0 : prevVariables.length;
    const numCurrVariable = variables.filter((v) => v === variableName).length;
    const lastPercent = numPrevVariables / variables.length;
    const currPercent = numCurrVariable / variables.length;
    return {lastPercent, currPercent};
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
        <text
          id={`wedge-label-${variables[0]}-0`}
          x={kSpinnerX}
          y={kSpinnerY}
          textAnchor="middle"
          dy=".25em"
          dx={getTextShift(variables[0], variables[0].length)}
          fill="#000"
          fontSize={fontSize}
          onClick={() => handleSetSelectedVariable(0)}
          style={{ cursor: "pointer" }}
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
              percent={currPercent}
              lastPercent={lastPercent}
              variableName={variableName}
              index={index}
              labelFontSize={fontSize}
              varArrayIdx={varArrayIdx}
              selectedWedge={selectedWedge}
              nextVariable={[...new Set(variables)][index + 1]}
              isLastVariable={index === [...new Set(variables)].length - 1}
              isDragging={isDragging}
              handleAddDefs={handleAddDefs}
              handleSetSelectedVariable={handleSetSelectedVariable}
              handleSetEditingVarName={handleSetEditingVarName}
              handleSetEditingPct={handleSetEditingPct}
              handleDeleteWedge={handleDeleteWedge}
              handleStartDrag={handleStartDrag}
            />
          );
        })}
        {[...new Set(variables)].map((variableName, index) => {
          const {lastPercent, currPercent} = getCurrentAndLastPct(variableName, index);
          return (
            <SeparatorLine
              key={`separator-line-${variableName}-${index}`}
              percent={currPercent}
              lastPercent={lastPercent}
            />
          );
        })}
      </>
    );
  };
