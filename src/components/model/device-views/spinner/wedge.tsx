import React, { useEffect, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent, getTextShift, getVariableColor } from "../shared/helpers";
import { ClippingDef } from "../../../../models/device-model";

interface IWedge {
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
  handleDeleteWedge: (e: React.MouseEvent, variableName: string) => void;
  handleSetEditingPct: () => void;
  handleSetEditingVarName: (variableIdx: number) => void
  handleStartDrag: (originPt: {x: number; y: number;}) => void;
}

const kDarkTeal = "#008cba";
const kLightBlue = "#dbf6ff";

const getCoordinatesForVariableLabel = (percent: number, numUnique: number) => {
  const perc = percent + 0.75; // rotate 3/4 to start at top
  const x = kSpinnerX + (Math.cos(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  const y = kSpinnerY + (Math.sin(2 * Math.PI * perc) * kSpinnerRadius * (1 + (Math.min(.70, numUnique * 0.1))));
  return [x, y];
};

const getEllipseCoords = (percent: number) => {
  const majorRadius = kSpinnerRadius * 1.3;
  const minorRadius = kSpinnerRadius * 1.25;
  const perc = percent + 0.75;    // rotate 3/4 to start at top
  const angleRadians = 2 * Math.PI * perc;
  const x = kSpinnerX + (Math.cos(angleRadians) * majorRadius);
  const y = kSpinnerY + (Math.sin(angleRadians) * minorRadius);
  return [x, y];
};


export const Wedge = ({percent, lastPercent, index, variableName, labelFontSize, numUniqueVariables,
  varArrayIdx, selectedWedge, isLastVariable, isDragging, deviceId, handleSetSelectedVariable, handleDeleteWedge,
  handleSetEditingPct, handleSetEditingVarName, handleAddDefs, handleStartDrag}: IWedge) => {
  const [wedgePath, setWedgePath] = useState("");
  const [wedgeColor, setWedgeColor] = useState(selectedWedge === variableName ? kDarkTeal : "");
  const [labelPos, setLabelPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [labelLinePath, setLabelLinePath] = useState("");
  const [pctPos, setPctPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [delBtnPos, setDelBtnPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [edgePath, setEdgePath] = useState("");
  const [point1, setPoint1] = useState<{x: number, y: number}>({x: 0, y: 0});

  useEffect(() => {
    const perc2 = lastPercent + percent;
    const p1 = getCoordinatesForPercent(lastPercent);
    const p2 = getCoordinatesForPercent(perc2);
    const largeArc = perc2 - lastPercent > 0.5 ? 1 : 0;
    const varLabelPosition = getCoordinatesForVariableLabel((lastPercent + perc2)/2, numUniqueVariables);
    const labelPerc2 = lastPercent + (perc2 - lastPercent) / 2;
    const pctLabelLoc = getEllipseCoords(labelPerc2);
    const labelLineP1 = getCoordinatesForPercent(labelPerc2);
    const labelLineP2 = getCoordinatesForPercent(labelPerc2, (kSpinnerRadius * 1.1));
    let deleteBtnLocY;

    const path = [
      `M ${p1.join(" ")}`,
      `A ${kSpinnerRadius} ${kSpinnerRadius} 0 ${largeArc} 1 ${p2.join(" ")}`,
      `L ${kSpinnerX} ${kSpinnerY}`,
      `L ${p1.join(" ")}`
    ].join(" ");

    // check in which direction label line is pointing and position delete button accordingly
    if (pctLabelLoc[1] >= labelLineP2[1]) {
      deleteBtnLocY = pctLabelLoc[1] + 17;
    } else {
      deleteBtnLocY = pctLabelLoc[1] - 17;
    }

    setWedgePath(path);
    setLabelPos({x: (kSpinnerX + varLabelPosition[0]) / 2, y: (kSpinnerY + varLabelPosition[1]) / 2});
    setPctPos({x: pctLabelLoc[0], y: pctLabelLoc[1]});
    setLabelLinePath(`M ${labelLineP1.join(" ")} L ${labelLineP2.join(" ")}`);
    setDelBtnPos({x: pctLabelLoc[0], y: deleteBtnLocY});
    setEdgePath(`M ${kSpinnerX} ${kSpinnerY} L ${p2[0]} ${p2[1]}`);
    setPoint1({x: p1[0], y: p1[1]});
    const color = selectedWedge === variableName ? kDarkTeal : getVariableColor(index, 2, false);
    setWedgeColor(color);

    const clipPathId = `${deviceId}-wedge-clip-${variableName}`;
    const clipPath = (
      <clipPath id={clipPathId} key={clipPathId}>
        <path d={path} />
      </clipPath>
    );
    handleAddDefs({ id: clipPathId, element: clipPath });
  }, [percent, lastPercent, index, variableName, selectedWedge, handleAddDefs, varArrayIdx, numUniqueVariables]);

  const handleLabelClick = (e: React.MouseEvent) => {
    handleSetEditingVarName(varArrayIdx);
    handleSetSelectedVariable(varArrayIdx);
  };

  const handleWedgeClick = (e: React.MouseEvent) => {
    handleSetSelectedVariable(varArrayIdx);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleSetSelectedVariable(varArrayIdx);
    handleStartDrag({x: point1.x, y: point1.y});
  };

  const buttonSize = 15;
  const offset = 3;
  const delButtonInnerShapePath = [
    `M ${delBtnPos.x - offset} ${delBtnPos.y - offset}`,
    `L ${delBtnPos.x + offset} ${delBtnPos.y + offset}`,
    `M ${delBtnPos.x + offset} ${delBtnPos.y - offset}`,
    `L ${delBtnPos.x - offset} ${delBtnPos.y + offset}`
  ].join(" ");

  return (
    <>
      {/* wedge */}
      <path
        d={wedgePath}
        id={`${deviceId}-wedge-${variableName}`}
        fill={wedgeColor}
        className="wedge"
        onClick={handleWedgeClick}
        style={{ cursor: isDragging? "grabbing" : "pointer" }}
      >
        <title>{Math.round(percent * 100)}%</title>
      </path>
      {/* variable name label */}
      <text
        id={`${deviceId}-wedge-label-${variableName}-${varArrayIdx}`}
        style={{ cursor: isDragging? "grabbing" : "pointer" }}
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(variableName, variableName.length)}
        fill={selectedWedge === variableName ? "#FFF" : "#000"}
        fontSize={labelFontSize}
        fontWeight={selectedWedge === variableName ? "bold" : "normal"}
        onClick={handleLabelClick}
        clipPath={`url(#${deviceId}-wedge-clip-${variableName}`}
      >
        {variableName}
      </text>
      {/* draggable edge */}
      { !isLastVariable &&
        <path
          id={`${deviceId}-wedge-edge-${variableName}`}
          d={edgePath}
          stroke={wedgeColor}
          strokeWidth={10}
          style={{cursor: isDragging ? "grabbing" : "grab"}}
          onMouseDown={handleMouseDown}
          clipPath={`url(#${deviceId}-wedge-clip-${variableName}`}
        />
      }
      { selectedWedge === variableName &&
        <>
          {/* percentage label */}
          <path
            d={labelLinePath}
            strokeWidth={2}
            stroke={"#000"}
          />
          <text
            id={`${deviceId}-wedge-pct-${variableName}`}
            x={pctPos.x}
            y={pctPos.y + 4}
            fontSize={12}
            textAnchor="middle"
            style={{cursor: "pointer"}}
            onClick={handleSetEditingPct}
          >
            {Math.round(percent * 100)}%
          </text>
          {/* delete wedge button */}
          <g style={{cursor: "pointer"}} onClick={(e) => handleDeleteWedge(e, variableName)}>
            <rect
              x={delBtnPos.x - (buttonSize / 2)}
              y={delBtnPos.y - (buttonSize / 2)}
              width={buttonSize}
              height={buttonSize}
              rx={3}
              stroke={kDarkTeal}
              strokeWidth={1}
              fill={kLightBlue}
            />
            <path
              d={delButtonInnerShapePath}
              stroke={"#000"}
              strokeWidth={1}
            />
          </g>
        </>
      }
    </>
  );
};
