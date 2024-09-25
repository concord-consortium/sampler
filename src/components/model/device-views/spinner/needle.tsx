import React, { useEffect, useRef, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent } from "../shared/helpers";
import { useAnimationContext } from "../../../../hooks/useAnimation";
import { AnimationStep, IAnimationStepSettings, IVariableLocation } from "../../../../types";

const needleNorthLength = kSpinnerRadius * 2/3;
const needleSouthLength = kSpinnerRadius / 5;
const needleWidth = kSpinnerRadius / 15;
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
  const { registerAnimationCallback } = useAnimationContext();
  const [ show, setShow ] = useState(false);
  const [ rotation, setRotation ] = useState(0);

  // parallel refs are used so that we don't bind over the state values in the animation function
  const startRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const endRotationRef = useRef(0);
  const variableLocationsRef = useRef<Record<string, IVariableLocation>>({});

  variableLocationsRef.current = variableLocations;

  const animate = (step: AnimationStep, settings?: IAnimationStepSettings) => {
    const { kind } = step;

    if (kind === "startExperiment") {
      setShow(true);
      currentRotationRef.current = 0;
      setRotation(0);
    } else if (kind === "startSelectItem") {
      startRotationRef.current = currentRotationRef.current;
      endRotationRef.current = -1; // set to -1 to recalculate the end rotation when animating
    } else if ((kind === "animateDevice") && (step.deviceId === deviceId)) {
      const t = settings?.t ?? 1;
      const {lastPercent, currPercent} = variableLocationsRef.current[step.selectedVariable];

      if (endRotationRef.current === -1) {
        // randomly pick a rotation inside the wedge
        endRotationRef.current = 360 * (lastPercent + (Math.random() * currPercent));
      }

      const r1 = startRotationRef.current % 360;
      const r2 = endRotationRef.current % 360;
      let angleDifference = r2 - r1;
      if (angleDifference <= 0) {
        angleDifference += 360;
      }
      currentRotationRef.current = (r1 + angleDifference + 720) * t;
      setRotation(currentRotationRef.current);

    } else if (kind === "endExperiment") {
      setShow(false);
    }
  };

  useEffect(() => {
    return registerAnimationCallback(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) {
    return null;
  }

  return (
    <>
      <path d={path} fill="#000" transform={`rotate(${rotation}, ${kSpinnerX}, ${kSpinnerY})`} />
      <circle cx={kSpinnerX} cy={kSpinnerY} r={needleWidth/2} fill="#fff" />
    </>
  );
};
