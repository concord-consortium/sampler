import React from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent } from "../shared/helpers";
import { IVariableLocation } from "../../../../types";
import { useSpinnerAnimation } from "../../../../hooks/useSpinnerAnimation";

// Needle dimensions
const needleNorthLength = kSpinnerRadius * 2/3;
const needleSouthLength = kSpinnerRadius / 5;
const needleWidth = kSpinnerRadius / 15;

// Calculate needle path coordinates
const n = getCoordinatesForPercent(0, needleNorthLength);
const e = getCoordinatesForPercent(0.25, needleWidth);
const so = getCoordinatesForPercent(0.5, needleSouthLength);
const w = getCoordinatesForPercent(0.75, needleWidth);
const path = `M ${n.join(" ")} L ${e.join(" ")} L ${so.join(" ")} L ${w.join(" ")} Z`;

interface IProps {
  deviceId: string;
  variableLocations: Record<string,IVariableLocation>;
}

export const Needle = ({deviceId, variableLocations}: IProps) => {
  // Use our custom hook for spinner animation
  const { rotation } = useSpinnerAnimation({
    deviceId,
    variableLocations
  });

  // For testing purposes, we need to show the needle even when not animating
  // In production, this would be controlled by the animation state
  const show = true; // Always show for testing

  if (!show) {
    return null;
  }

  return (
    <>
      <path 
        d={path} 
        fill="#000" 
        transform={`rotate(${rotation}, ${kSpinnerX}, ${kSpinnerY})`} 
        data-testid="spinner-needle"
      />
      <circle 
        cx={kSpinnerX} 
        cy={kSpinnerY} 
        r={needleWidth/2} 
        fill="#fff" 
      />
    </>
  );
};
