import React, { useEffect, useState } from "react";
import { IVariables } from "../../../../models/device-model";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getVariableColor } from "../shared/helpers";

interface IWedge {
  percent: number;
  lastPercent: number;
  variableName: string;
  index: number;
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

const Wedge = ({percent, lastPercent, index}: IWedge) => {
  const [wedgePath, setWedgePath] = useState("");
  const [wedgeColor, setWedgeColor] = useState("");


  useEffect(() => {
    const pctToDecimal = percent / 100;
    const lastPctToDecimal = lastPercent / 100;
    const perc1 = lastPctToDecimal;
    const perc2 = lastPctToDecimal + pctToDecimal;
    const p1 = getCoordinatesForPercent(perc1);
    const p2 = getCoordinatesForPercent(perc2);
    const largeArc = perc2 - perc1 > 0.5 ? 1 : 0;

    const path = [
      `M ${p1.join(" ")}`,
      `A ${kSpinnerRadius} ${kSpinnerRadius} 0 ${largeArc} 1 ${p2.join(" ")}`,
      `L ${kSpinnerX} ${kSpinnerY}`,
      `L ${p1.join(" ")}`
    ].join(" ");
    setWedgePath(path);
    setWedgeColor(getVariableColor(index, 2, false));
  }, [percent, lastPercent, index]);

  return (
    <path
      d={wedgePath}
      fill={wedgeColor}
      stroke="#000"
      strokeWidth={1}
      className="wedge"
    />
  );
};

export const Spinner = ({variables}: ISpinner) => {
  return (
    Object.keys(variables).length === 1 ?
      <circle
        cx={kSpinnerX}
        cy={kSpinnerY}
        radius={kSpinnerRadius}
        fill={getVariableColor(0, 0, false)}
      /> :
      <>
        {Object.keys(variables).map((variableName, index) => {
          const lastVariableName = index !== 0 ? Object.keys(variables)[index - 1] : "";
          return (
            <Wedge
              key={`${variableName}-${index}`}
              percent={variables[variableName]}
              lastPercent={index === 0 ? 0 : variables[lastVariableName]}
              variableName={variableName}
              index={index}
            />
          );
        })}
      </>
    );
  };
