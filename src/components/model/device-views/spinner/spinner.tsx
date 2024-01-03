import React, { useEffect, useState } from "react";
import { IVariables } from "../../../../models/device-model";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift, getVariableColor } from "../shared/helpers";

interface IWedge {
  percent: number;
  lastPercent: number;
  variableName: string;
  index: number;
  labelFontSize: number;
}

interface ISpinner {
  variables: IVariables;
}

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

const Wedge = ({percent, lastPercent, index, variableName, labelFontSize}: IWedge) => {
  const [wedgePath, setWedgePath] = useState("");
  const [wedgeColor, setWedgeColor] = useState("");
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
    setWedgeColor(getVariableColor(index, 2, false));
    setLabelPos({x: (kSpinnerX + varLabelPosition[0]) / 2, y: (kSpinnerY + varLabelPosition[1]) / 2});
  }, [percent, lastPercent, index]);

  return (
    <>
      <path
        d={wedgePath}
        fill={wedgeColor}
        stroke="#000"
        strokeWidth={1}
        className="wedge"
      />
      <text
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(variableName, variableName.length)}
        fill="#000"
        fontSize={labelFontSize}
        clipPath={wedgePath}
      >
        {variableName}
      </text>
    </>
  );
};

export const Spinner = ({variables}: ISpinner) => {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const numUnique = [...new Set(variables)].length;
    const size = numUnique >= 20 ? 6
      : numUnique >= 10 ? 10
      : 16;
    setFontSize(size);
  }, [variables]);

  return (
    variables.length === 1 ?
      <circle
        cx={kSpinnerX}
        cy={kSpinnerY}
        radius={kSpinnerRadius}
        fill={getVariableColor(0, 0, false)}
      /> :
      <>
        {[...new Set(variables)].map((variableName, index) => {
          const varArrayIdx = variables.findIndex((v) => v === variableName);
          const prevVariables = variables.filter((v, i) => i < varArrayIdx && v !== variableName);
          const numPrevVariables =  index === 0 ? 0 : prevVariables.length;
          const numCurrVariable = variables.filter((v) => v === variableName).length;
          const lastPercent = numPrevVariables / variables.length;
          const currPercent = numCurrVariable / variables.length;
          return (
            <Wedge
              key={`${variableName}-${index}`}
              percent={currPercent}
              lastPercent={lastPercent}
              variableName={variableName}
              index={index}
              labelFontSize={fontSize}
            />
          );
        })}
      </>
    );
  };
