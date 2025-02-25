import React, { useEffect, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift } from "../shared/helpers";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { TextBacker, updateTextBackerRefFn } from "./text-backer";
import { ClippingDef, ITextBackerPos } from "../../../../types";

interface IProps {
  percent: number;
  lastPercent: number;
  variableName: string;
  index: number;
  labelFontSize: number;
  varArrayIdx: number;
  numUniqueVariables: number;
  selectedWedge: string | null;
  nextVariable: string;
  isDragging: boolean;
  isLastVariable: boolean;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void
}

const getCoordinatesForVariableLabel = (percent: number, numUnique: number) => {
  const perc = percent + 0.75; // rotate 3/4 to start at top
  const x = kSpinnerX + (Math.cos(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  const y = kSpinnerY + (Math.sin(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  return [x, y];
};

export const TextOverWedge = ({percent, lastPercent, index, variableName, labelFontSize, numUniqueVariables,
  varArrayIdx, selectedWedge, isDragging, deviceId, handleSetSelectedVariable, handleSetEditingVarName, handleAddDefs}: IProps) => {
  const { globalState: { isRunning } } = useGlobalStateContext();
  const [labelPos, setLabelPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [textBackerPos, setTextBackerPos] = useState<ITextBackerPos|undefined>(undefined);

  useEffect(() => {
    const perc2 = lastPercent + percent;
    const varLabelPosition = getCoordinatesForVariableLabel((lastPercent + perc2)/2, numUniqueVariables);

    setLabelPos({x: (kSpinnerX + varLabelPosition[0]) / 2, y: (kSpinnerY + varLabelPosition[1]) / 2});

  }, [percent, lastPercent, index, variableName, selectedWedge, handleAddDefs, deviceId, varArrayIdx, numUniqueVariables]);

  const handleLabelClick = () => {
    if (isRunning) return;
    handleSetEditingVarName(varArrayIdx);
    handleSetSelectedVariable(varArrayIdx);
  };

  const fill = !isDragging && selectedWedge ? (selectedWedge === variableName ? "#000" : "#555") : "#000";

  return (
    <>
      {/* Safari does not support cursor styling or click handling on svg text elements so this invisible element that
          is drawn behind the text acts as the styling and click handler source */}
      <TextBacker pos={textBackerPos} isDragging={isDragging} onClick={handleLabelClick} />
      {/* variable name label */}
      <text
        id={`${deviceId}-wedge-label-${variableName}-${varArrayIdx}`}
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(variableName, variableName.length)}
        fill={fill}
        fontSize={labelFontSize}
        fontWeight={"normal"}
        style={{ pointerEvents: "none"}}
        ref={updateTextBackerRefFn(setTextBackerPos)}
      >
        {variableName}
      </text>
    </>
  );
};
