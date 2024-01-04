import React, { useEffect } from "react";
import { getTextShift, getVariableColor } from "./helpers";
import { ClippingDef } from "../../../../models/device-model";

export interface IBall {
  x: number;
  y: number;
  radius: number;
  text: string;
  fontSize: number;
  handleAddDefs: (defs: ClippingDef[]) => void;
}

export const Ball = ({ x, y, radius, text, fontSize, handleAddDefs }: IBall) => {

  useEffect(() => {
    const id = `text-clip-${x}-${y}`;
    const clipPath = (
      <clipPath id={id}>
        <circle cx={x} cy={y} r={radius} origin={`${x} ${y}`} />
      </clipPath>
    );
    handleAddDefs([{ id, element: clipPath }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y, radius, text]);

  return (
    <g>
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
        x={x}
        y={y}
        fontSize={fontSize}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(text, (3.8*(radius/fontSize)))}
        origin={`${x} ${y}`}
        clipPath={`url(#text-clip-${x}-${y})`}
      >
        {text}
      </text>
    </g>
  );
};
