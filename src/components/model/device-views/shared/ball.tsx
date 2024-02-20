import React, { useEffect } from "react";
import { getTextShift, getVariableColor } from "./helpers";
import { ClippingDef } from "../../../../models/device-model";

export interface IBall {
  x: number;
  y: number;
  radius: number;
  text: string;
  fontSize: number;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
  i: number;
}

export const Ball = ({ x, y, radius, text, fontSize, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName, i, deviceId }: IBall) => {
  useEffect(() => {
    const id = `${deviceId}-text-clip-${x}-${y}`;
    const clipPath = (
      <clipPath id={id} key={id}>
        <circle cx={x} cy={y} r={radius} origin={`${x} ${y}`} />
      </clipPath>
    );
    handleAddDefs({ id, element: clipPath });
  }, [x, y, radius, text, handleAddDefs]);

  return (
    <g onClick={() => handleSetEditingVarName(i)}>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={getVariableColor(0, 0, false)}
        stroke="#000"
        strokeWidth={1}
        origin={`${x} ${y}`}
      />
      <text
        id={`${deviceId}-ball-label-${text}-${i}`}
        style={{ cursor: "pointer" }}
        x={x}
        y={y}
        fontSize={fontSize}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(text, (3.8*(radius/fontSize)))}
        origin={`${x} ${y}`}
        clipPath={`url(#${deviceId}-text-clip-${x}-${y})`}
        onClick={() => handleSetSelectedVariable(i)}
      >
        {text}
      </text>
    </g>
  );
};
