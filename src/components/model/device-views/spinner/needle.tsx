import React, { useEffect, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent } from "../shared/helpers";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { useAnimationContext } from "../../../../hooks/useAnimation";
import { Speed } from "../../../../types";

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
}

export const Needle = ({deviceId}: IProps) => {
  const { globalState: { speed } } = useGlobalStateContext();
  const { deviceAnimationStep } = useAnimationContext();
  const [ show, setShow ] = useState(true);
  const [ rotation, setRotation ] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const deviceSelected = deviceAnimationStep?.id === deviceId;

    if ((speed === Speed.Fastest) || !deviceSelected) {
      setShow(false);
      return;
    }

    setShow(true);

    const animate = () => {
      // this is just a sample animation - once the animation loop is updated then this will be refactored to land
      // on the selected variable within the time
      setRotation(prev => prev + 20);
    };

    if (deviceAnimationStep?.id === deviceId) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

  }, [deviceAnimationStep, speed, deviceId, setShow, rotation, setRotation]);

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
