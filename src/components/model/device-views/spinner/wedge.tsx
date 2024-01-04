import React, { useEffect, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift, getVariableColor } from "../shared/helpers";

interface IWedge {
  percent: number;
  lastPercent: number;
  variableName: string;
  index: number;
  labelFontSize: number;
  varArrayIdx: number;
  handleSetSelectedVariable: (variableIdx: number) => void;
  selectedWedge: string | null;
  handleSetSelectedWedge: (wedgeName: string) => void;
}

const kDarkTeal = "#008cba";

const getCoordinatesForPercent = (percent: number) => {
  const perc = percent + 0.75; // rotate 3/4 to start at top
  const x = kSpinnerX + (Math.cos(2 * Math.PI * perc) * kSpinnerRadius);
  const y = kSpinnerY + (Math.sin(2 * Math.PI * perc) * kSpinnerRadius);
  return [x, y];
};

const getCoordinatesForVariableLabel = (percent: number, numUnique: number) => {
  const perc = percent + 0.75; // rotate 3/4 to start at top
  const x = kSpinnerX + (Math.cos(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  const y = kSpinnerY + (Math.sin(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  return [x, y];
};


export const Wedge = ({percent, lastPercent, index, variableName, labelFontSize,
  varArrayIdx, selectedWedge, handleSetSelectedVariable, handleSetSelectedWedge}: IWedge) => {
  const [wedgePath, setWedgePath] = useState("");
  const [wedgeColor, setWedgeColor] = useState(selectedWedge === variableName ? kDarkTeal : "");
  const [labelPos, setLabelPos] = useState<{x: number, y: number}>({x: 0, y: 0});

  useEffect(() => {
    const perc2 = lastPercent + percent;
    const p1 = getCoordinatesForPercent(lastPercent);
    const p2 = getCoordinatesForPercent(perc2);
    const largeArc = perc2 - lastPercent > 0.5 ? 1 : 0;
    const varLabelPosition = getCoordinatesForVariableLabel((lastPercent + perc2)/2, 2);

    const path = [
      `M ${p1.join(" ")}`,
      `A ${kSpinnerRadius} ${kSpinnerRadius} 0 ${largeArc} 1 ${p2.join(" ")}`,
      `L ${kSpinnerX} ${kSpinnerY}`,
      `L ${p1.join(" ")}`
    ].join(" ");

    setWedgePath(path);
    const color = selectedWedge === variableName ? kDarkTeal : getVariableColor(index, 2, false);
    setWedgeColor(color);
    setLabelPos({x: (kSpinnerX + varLabelPosition[0]) / 2, y: (kSpinnerY + varLabelPosition[1]) / 2});
  }, [percent, lastPercent, index, variableName, selectedWedge]);

  const handleLabelClick = (e: React.MouseEvent) => {
    handleSetSelectedVariable(varArrayIdx);
    handleSetSelectedWedge(variableName);
  };

  const handleWedgeClick = (e: React.MouseEvent) => {
    handleSetSelectedWedge(variableName);
  };

  return (
    <>
      <path
        d={wedgePath}
        fill={wedgeColor}
        stroke="#000"
        strokeWidth={1}
        className="wedge"
        onClick={handleWedgeClick}
        style={{ cursor: "pointer" }}
      />
      <text
        id={`wedge-label-${variableName}-${varArrayIdx}`}
        style={{ cursor: "pointer" }}
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(variableName, variableName.length)}
        fill={selectedWedge === variableName ? "#FFF" : "#000"}
        fontSize={labelFontSize}
        fontWeight={selectedWedge === variableName ? "bold" : "normal"}
        clipPath={wedgePath}
        onClick={handleLabelClick}
      >
        {variableName}
      </text>
    </>
  );
};
