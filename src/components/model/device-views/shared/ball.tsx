import React, { useEffect } from "react";
import { getTextShift, getVariableColor } from "./helpers";
import { ClippingDef } from "../../../../models/device-model";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { isAnimationRunningOrPaused } from "../../../../utils/animation-mode-helpers";

export interface IBall {
  x: number;
  y: number;
  transform: string;
  radius: number;
  text: string;
  fontSize: number;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
  i: number;
  visibility: "visible" | "hidden";
}

export const Ball = ({ x, y, transform, radius, text, fontSize,
  handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName, i, deviceId, visibility }: IBall) => {
  const { globalState: { animationMode } } = useGlobalStateContext();
  const isRunningOrPaused = isAnimationRunningOrPaused(animationMode);

  useEffect(() => {
    const id = `${deviceId}-text-clip-${x}-${y}`;
    const clipPath = (
      <clipPath id={id} key={id}>
        <circle cx={x} cy={y} r={radius} origin={`${x} ${y}`} />
      </clipPath>
    );
    handleAddDefs({ id, element: clipPath });
  }, [x, y, radius, text, handleAddDefs, deviceId]);

  const handleGroupClick = () => {
    if (isRunningOrPaused) return;
    handleSetEditingVarName(i);
  };

  const handleTextClick = () => {
    if (isRunningOrPaused) return;
    handleSetSelectedVariable(i);
  };

  return (
    <g onClick={handleGroupClick}>
      <circle
        cx={x}
        cy={y}
        transform={transform}
        r={radius}
        fill={getVariableColor(0, 0, false)}
        stroke="#000"
        strokeWidth={1}
        origin={`${x} ${y}`}
        visibility={visibility}
      />
      <text
        id={`${deviceId}-ball-label-${text}-${i}`}
        style={{ cursor: isRunningOrPaused ? "default"  : "pointer" }}
        x={x}
        y={y}
        transform={transform}
        fontSize={fontSize}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(text, (3.8*(radius/fontSize)))}
        origin={`${x} ${y}`}
        clipPath={`url(#${deviceId}-text-clip-${x}-${y})`}
        onClick={handleTextClick}
        visibility={visibility}
      >
        {text}
      </text>
    </g>
  );
};
