import React, { useEffect, useRef, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY, kContainerCollisionBottom, kContainerCollisionLeft, kContainerCollisionRight, kContainerCollisionTop } from "./constants";
import { Ball } from "./ball";
import { useAnimationContext } from "../../../../hooks/useAnimation";
import { IAnimationStepSettings, AnimationStep, ClippingDef, ICollectorItem, IBallPosition, IFinalPosition, IFinalPositionInput } from "../../../../types";

interface IProps {
  ballsArray: Array<string>;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName:  (variableIdx: number) => void;
}

const animateToExitT = 0.5;
const animateOutOfExitT = 0.9;

const getInitialPositions = (numBalls: number, radius: number) : IBallPosition[] => {
  const w = kMixerContainerWidth - kCapHeight - (kBorder * 2);
  const maxHeight = kMixerContainerHeight * 0.75;
  const maxInRow = Math.floor(w / (radius * 2));
  const numRows = Math.ceil(numBalls / maxInRow);
  const rowHeight = Math.min(radius * 2, maxHeight / numRows);
  const ballPositions: IBallPosition[] = [];

  for (let i = 0; i < numBalls; i++) {
    const rowNumber = Math.floor(i / maxInRow);
    const rowIndex = i % maxInRow;
    const x = (rowNumber % 2 === 0) ? kContainerX + kBorder + radius + (rowIndex * radius * 2) : kContainerX + kMixerContainerWidth - kBorder - kCapHeight - radius - (rowIndex * radius * 2);
    const y = kContainerY + kMixerContainerHeight - kBorder - radius - (rowHeight * rowNumber);
    const randomSpeed = 5 + (Math.random() * 7);
    const direction = Math.PI + (Math.random() * Math.PI);
    const vx = Math.cos(direction) * randomSpeed;
    const vy = Math.sin(direction) * randomSpeed;
    ballPositions.push({x, y, vx, vy, transform: "", visibility: "visible"});
  }
  return ballPositions;
};

const getFinalPosition = ({x, y, dx, dy, vx, vy, radius}: IFinalPositionInput): IFinalPosition => {
  let newX = x + dx;
  let newY = y + dy;
  let newVx = vx;
  let newVy = vy;

  const leftX = newX - radius;
  const rightX = newX + radius;
  const topY = newY - radius;
  const bottomY = newY + radius;

  if ((leftX < kContainerCollisionLeft) || (rightX > kContainerCollisionRight)) {
    newVx = -vx;
    newX = x;
  }
  if ((topY < kContainerCollisionTop) || (bottomY > kContainerCollisionBottom)) {
    newVy = -vy;
    newY = y;
  }

  return {x: newX, y: newY, vx: newVx, vy: newVy, radius};
};

const animatePositions = (positions: IBallPosition[], speed: number, t: number, radius: number, selectedVariableIdx: number, reduceMotion: boolean) => {
  return positions.map((position, index) => {
    let final: IFinalPosition;
    const { vx, vy, x, y } = position;
    const animationSpeed = speed + 1;

    // If reduced motion is enabled and this is the selected ball, skip directly to the exit
    if (reduceMotion && index === selectedVariableIdx) {
      const targetX = kContainerX + kMixerContainerWidth / 2;
      const targetY = kContainerY + radius;
      
      // If we're past the animation threshold for exiting, move the ball out
      if (t >= animateOutOfExitT) {
        return { 
          ...position, 
          x: targetX, 
          y: targetY - radius, 
          vx: 0, 
          vy: 0, 
          transform: "" 
        };
      } else {
        return { 
          ...position, 
          x: targetX, 
          y: targetY, 
          vx: 0, 
          vy: 0, 
          transform: "" 
        };
      }
    }
    
    // For non-reduced motion or non-selected balls, use the regular animation
    // calculate velocity and next position of all balls or the selected ball until we start animating to the exit
    if (index !== selectedVariableIdx || t < animateToExitT) {
      const dx = vx * animationSpeed;
      const dy = vy * animationSpeed;

      final = getFinalPosition({x, y, dx, dy, vx, vy, radius});
    } else {
      const targetX = kContainerX + kMixerContainerWidth / 2;
      const targetY = kContainerY + radius;
      const angleToTarget = Math.atan2(targetY - y, targetX - x);
      const distanceToTarget = Math.hypot(targetX - x, targetY - y);
      const speedToTarget = distanceToTarget * Math.min(1, (animateToExitT + (t - animateToExitT)));

      const dx = Math.cos(angleToTarget) * speedToTarget;
      const dy = Math.sin(angleToTarget) * speedToTarget;

      final = getFinalPosition({x, y, dx, dy, vx, vy, radius});

      // float it out of the exit
      if (t >= animateOutOfExitT) {
        final.y -= radius;
      }
    }

    return { ...position, x: final.x, y: final.y, vx: final.vx, vy: final.vy, transform: ""};
  });
};

const getRandomPositions = (positions: IBallPosition[], radius: number) => {
  return positions.map((position, i) => {
    const {x, y} = position;
    const randomX = kContainerCollisionLeft + (Math.random() * (kContainerCollisionRight - kContainerCollisionLeft));
    const randomY = kContainerCollisionTop + (Math.random() * (kContainerCollisionBottom - kContainerCollisionTop));
    const dx = randomX - x;
    const dy = randomY - y;
    const randomSpeed = 5 + (Math.random() * 7);
    const direction = Math.PI + (Math.random() * Math.PI);
    const vx = Math.cos(direction) * randomSpeed;
    const vy = Math.sin(direction) * randomSpeed;
    const final = getFinalPosition({x, y, dx, dy, vx, vy, radius});
    return { ...position, x: final.x, y: final.y, vx: final.vx, vy: final.vy, transform: "", visibility: "visible"} as IBallPosition;
  });
};

const getCycledPositions = (positions: IBallPosition[], selectedVariableIdx: number) => {
  const skipEveryNthBall = Math.max(75 - Math.floor(positions.length / 2), 2);
  return positions.map((position, i) => {
    const isVisible = i === selectedVariableIdx || (i + 1) % skipEveryNthBall === 0;
    return { ...position, visibility: isVisible ? "visible" : "hidden" } as IBallPosition;
  });
};

export const Balls = ({ballsArray, deviceId, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  const { registerAnimationCallback } = useAnimationContext();
  const [ballPositions, setBallPositions] = useState<Array<IBallPosition>>([]);
  const [hiddenBallIndexes, setHiddenBallIndexes] = useState<number[]>([]);

  // keep these are refs so the values aren't closed over in the animation function
  const ballsArrayRef = useRef(ballsArray);
  const numBallsRef = useRef(0);
  const radiusRef = useRef(0);
  const selectedVariableIndexRef = useRef(-1);
  const initialPositionsRef = useRef<IBallPosition[]>([]);
  const currentPositionsRef = useRef<IBallPosition[]>([]);

  // these are kept up to date on each render - they don't change during the animation as the inputs to change them are disabled
  ballsArrayRef.current = ballsArray;
  numBallsRef.current = ballsArray.length;
  radiusRef.current = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);

  const animate = (step: AnimationStep, settings?: IAnimationStepSettings) => {
    const { kind } = step;
    const {speed, t, reduceMotion = false} = settings ?? {speed: 0, t: 0, reduceMotion: false};

    const updateBallPositions = (newPositions: IBallPosition[]) => {
      currentPositionsRef.current = newPositions;
      setBallPositions(newPositions);
    };

    if (kind === "modelChanged" || kind === "startExperiment" || (kind === "endExperiment")) {
      initialPositionsRef.current = getInitialPositions(ballsArrayRef.current.length, radiusRef.current);
      updateBallPositions(initialPositionsRef.current);
      setHiddenBallIndexes([]);
      selectedVariableIndexRef.current = -1;
    } else if ((kind === "startSample") || (kind === "endSample")) {
      setHiddenBallIndexes([]);
    } else if ((kind === "startSelectItem") || (kind === "endSelectItem")) {
      selectedVariableIndexRef.current = -1;
      updateBallPositions(initialPositionsRef.current);
    } else if ((kind === "animateDevice") && (step.deviceId === deviceId)) {
      // pick the ball to animate to the exit
      if (selectedVariableIndexRef.current === -1) {
        selectedVariableIndexRef.current = step.selectedVariableIndex;
      }

      if (t === 1) {
        if (step.hideAfter) {
          setHiddenBallIndexes(prev => [...prev, step.selectedVariableIndex]);
        }
        updateBallPositions(initialPositionsRef.current);
      } else if (reduceMotion) {
        // If reduced motion is enabled, use the special animation that skips directly to the target
        updateBallPositions(animatePositions(
          currentPositionsRef.current, 
          speed, 
          t, 
          radiusRef.current, 
          selectedVariableIndexRef.current,
          true
        ));
      } else if (numBallsRef.current < 100) {
        // For normal animation with a reasonable number of balls
        updateBallPositions(animatePositions(
          currentPositionsRef.current, 
          speed, 
          t, 
          radiusRef.current, 
          selectedVariableIndexRef.current,
          false
        ));
      } else if (numBallsRef.current < 400) {
        // For larger numbers of balls, use simpler animations
        updateBallPositions(getRandomPositions(currentPositionsRef.current, radiusRef.current));
      } else {
        // For very large numbers of balls, just cycle positions
        updateBallPositions(getCycledPositions(currentPositionsRef.current, selectedVariableIndexRef.current));
      }
    }
  };

  useEffect(() => {
    return registerAnimationCallback(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLabelForVariable = (ball: string | ICollectorItem) => {
    if (typeof ball === "object"){
      const firstKey = Object.keys(ball)[0];
      return ball[firstKey];
    } else {
      return ball;
    }
  };

  const maxVariableLength = ballsArray.reduce(function(max, ball) {
    const length = getLabelForVariable(ball).toString().length;
    return Math.max(max, length);
  }, 0);

  const fontScaling = 1 - Math.min(Math.max((maxVariableLength - 5) * 0.1, 0), 0.4);
  const fontSize = radiusRef.current * fontScaling;

  return (
    <g data-testid="balls-container">
      { ballPositions.map((position, i) => {
        const {x, y, transform} = position;

        let {visibility} = position;
        if (hiddenBallIndexes.indexOf(i) !== -1) {
          visibility = "hidden";
        }

        const text = getLabelForVariable(ballsArray[i]);
        return (
          <Ball
            key={`${deviceId}-ball-${text}-${i}`}
            x={x}
            y={y}
            transform={transform ? transform : ""}
            i={i}
            visibility={visibility}
            radius={radiusRef.current}
            deviceId={deviceId}
            text={`${text}`}
            fontSize={fontSize}
            handleAddDefs={handleAddDefs}
            handleSetEditingVarName={handleSetEditingVarName}
            handleSetSelectedVariable={handleSetSelectedVariable}
          />
        );
      })}
    </g>
  );
};
