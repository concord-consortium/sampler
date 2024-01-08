import React, { useEffect, useState } from "react";
import { kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent } from "../shared/helpers";

interface IWedge {
  percent: number;
  lastPercent: number;
}

export const SeparatorLine = ({percent, lastPercent}: IWedge) => {
  const [edgePath, setEdgePath] = useState("");

  useEffect(() => {
    const perc2 = lastPercent + percent;
    const p2 = getCoordinatesForPercent(perc2);
    setEdgePath(`M ${kSpinnerX} ${kSpinnerY} L ${p2[0]} ${p2[1]}`);
  }, [percent, lastPercent]);

  return (
    <path
      d={edgePath}
      stroke={"#FFF"}
      strokeWidth={1}
    />
  );
};
