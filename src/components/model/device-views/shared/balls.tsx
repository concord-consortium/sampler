import React, { useCallback, useEffect, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY, kContainerCollisionBottom, kContainerCollisionLeft, kContainerCollisionRight, kContainerCollisionTop } from "./constants";
import { ClippingDef, ICollectorItem } from "../../../../models/device-model";
import { Ball } from "./ball";
import { useAnimationContext } from "../../../../hooks/useAnimation";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";

interface IBalls {
  ballsArray: Array<string>;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName:  (variableIdx: number) => void;
}

interface IBallPosition {
  x: number;
  y: number;
  vy: number;
  vx: number;
  transform: string;
  visibility: "visible" | "hidden";
}

interface IFinalPosition {
  x: number;
  y: number;
  vy: number;
  vx: number;
}
interface IFinalPositionInput extends IFinalPosition {
  dx: number;
  dy: number;
}

export const Balls = ({ballsArray, deviceId, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IBalls) => {
  const { globalState: { speed } } = useGlobalStateContext();
  const { deviceAnimationStep } = useAnimationContext();
  const [ballPositions, setBallPositions] = useState<Array<IBallPosition>>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const radius = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);

  const getStaticPositions = useCallback(() : IBallPosition[] => {
    const w = kMixerContainerWidth - kCapHeight - (kBorder * 2);
      const maxHeight = kMixerContainerHeight * 0.75;
      const maxInRow = Math.floor(w / (radius * 2));
      const numRows = Math.ceil(ballsArray.length / maxInRow);
      const rowHeight = Math.min(radius * 2, maxHeight / numRows);
      return ballsArray.map((ball, i) => {
        const rowNumber = Math.floor(i / maxInRow);
        const rowIndex = i % maxInRow;
        const x = (rowNumber % 2 === 0) ? kContainerX + kBorder + radius + (rowIndex * radius * 2) : kContainerX + kMixerContainerWidth - kBorder - kCapHeight - radius - (rowIndex * radius * 2);
        const y = kContainerY + kMixerContainerHeight - kBorder - radius - (rowHeight * rowNumber);
        const randomSpeed = 5 + (Math.random() * 7);
        const direction = Math.PI + (Math.random() * Math.PI);
        const vx = Math.cos(direction) * randomSpeed;
        const vy = Math.sin(direction) * randomSpeed;
        return {x, y, vx, vy, transform: "", visibility: "visible"};
      });
  }, [ballsArray, radius]);


  useEffect(() => {
    if (deviceAnimationStep?.id !== deviceId) {
      const defaultPositions = getStaticPositions();
      setBallPositions(defaultPositions);
    } else {
      setStartTime(Date.now());
      const {selectedVariable} = deviceAnimationStep;
      const matchingIndices: number[] = ballsArray.map((ball, index) => ball === selectedVariable ? index : -1).filter(index => index !== -1);
      const randomIndex = Math.floor(Math.random() * matchingIndices.length);
      const selectedVariableIdx = matchingIndices[randomIndex];

      const timeFrame = 1200 / (speed + 1);
      const timeout = Math.min(Math.max(30, ballsArray.length * 1.5), 200);
      const animationSpeed = timeout / 30;
      const skipEveryNthBall = Math.max(75 - Math.floor(ballsArray.length / 2), 2);

      let reachedTarget = false;
      let animationFrameId: number;
      let stepOffset = 0;
      let timeoutId: number;
      let scrambledInitialSetup = false;
      let skipOffset = stepOffset % ballsArray.length;


      const animateMixer = () => {
        const timeElapsed = Date.now() - startTime;
        if (deviceAnimationStep?.id === deviceId) {
          stepOffset += 1;
          if (deviceAnimationStep?.id === deviceId) {
            timeoutId = setTimeout(() => {
              animationFrameId = requestAnimationFrame(animateMixer);
            }, timeout);
          }

          if (deviceAnimationStep?.id === deviceId) {
            if (reachedTarget) {
              moveBackToInitialPositions(timeElapsed);
            } else if (ballsArray.length < 100) {
              mixerAnimationStep(timeElapsed);
            } else if (ballsArray.length < 400) {
              positionBallsRandomly();
            } else {
              fakeMixerAnimationStep();
            }
          }
        }
      };

      const getFinalPosition = ({x, y, dx, dy, vx, vy}: IFinalPositionInput): IFinalPosition => {
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

        return {x: newX, y: newY, vx: newVx, vy: newVy};
      };

      const moveBackToInitialPositions = (timeElapsed: number) => {
        const defaultPositions = getStaticPositions();
        setBallPositions((prevState) => {
          return prevState.map((position, i) => {
            const {x, y, vx, vy} = position;
            const targetX = defaultPositions[i].x;
            const targetY = defaultPositions[i].y;

            const angleToTarget = Math.atan2(targetY - y, targetX - x);
            const distanceToTarget = Math.hypot(targetX - x, targetY - y);

            const timeRemaining = timeFrame - timeElapsed;
            const framesRemaining = timeRemaining / timeout;
            const speedToTarget = distanceToTarget / framesRemaining;

            const dx = Math.cos(angleToTarget) * speedToTarget;
            const dy = Math.sin(angleToTarget) * speedToTarget;

            const final = getFinalPosition({x, y, dx, dy, vx, vy});

            const transform = "";
            // TODO: after animation loop is updated so we know when the final sample is taken add a transform
            // to css animate to the final position, like this: `translate(${final.x - x},${final.y - y})`;
            return { ...position, x: final.x, y: final.y, transform };
          });
        });
      };

      const mixerAnimationStep = (timeElapsed: number) => {
        const animationSpeedBoost = Math.min((speed + 1) / animationSpeed, 4);
        const randomMovementDuration = timeFrame * 0.5;
        const threeQuartersPoint = timeFrame * 0.75;

        setBallPositions((prevState) => {
          return prevState.map((position, index) => {
            if (scrambledInitialSetup && (index + skipOffset + 1) % skipEveryNthBall === 0) return position;
            let final: IFinalPosition;
            const { vx, vy, x, y } = position;

            if (index !== selectedVariableIdx || timeElapsed < randomMovementDuration) {
              // calculate velocity and next position
              const dx = vx * animationSpeedBoost;
              const dy = vy * animationSpeedBoost;

              final = getFinalPosition({x, y, dx, dy, vx, vy});
            } else {
              const targetX = kContainerX + kMixerContainerWidth / 2;
              const targetY = kContainerY + radius;
              const angleToTarget = Math.atan2(targetY - y, targetX - x);
              const distanceToTarget = Math.hypot(targetX - x, targetY - y);

              const timeRemaining = threeQuartersPoint - timeElapsed;
              const framesRemaining = timeRemaining / timeout;
              const speedToTarget = distanceToTarget / framesRemaining;

              const dx = Math.cos(angleToTarget) * speedToTarget;
              const dy = Math.sin(angleToTarget) * speedToTarget;

              final = getFinalPosition({x, y, dx, dy, vx, vy});

              const remainingDistanceAfterMove = Math.hypot(targetX - final.x, targetY - final.y);

              if (remainingDistanceAfterMove <= speedToTarget) {
                reachedTarget = true;
              }
            }

            return { ...position, x: final.x, y: final.y, vx: final.vx, vy: final.vy, transform: ""};
          });
        });
      };

      const positionBallsRandomly = () => {
        setBallPositions((prevState: IBallPosition[]) => {
          return prevState.map((position, i) => {
            const {x, y} = position;
            const randomX = kContainerCollisionLeft + (Math.random() * (kContainerCollisionRight - kContainerCollisionLeft));
            const randomY = kContainerCollisionTop + (Math.random() * (kContainerCollisionBottom - kContainerCollisionTop));
            const dx = randomX - x;
            const dy = randomY - y;
            const randomSpeed = 5 + (Math.random() * 7);
            const direction = Math.PI + (Math.random() * Math.PI);
            const vx = Math.cos(direction) * randomSpeed;
            const vy = Math.sin(direction) * randomSpeed;
            const final = getFinalPosition({x, y, dx, dy, vx, vy});
            return {x: final.x, y: final.y, vx: final.vx, vy: final.vy, transform: "", visibility: "visible"};
          });
        });
      };

      const fakeMixerAnimationStep = () => {
        setBallPositions((prevState: IBallPosition[]) => {
          return prevState.map((position, i) => {
            const isVisible = i === selectedVariableIdx || (i + stepOffset + 1) % skipEveryNthBall === 0;
            return { ...position, visibility: isVisible ? "visible" : "hidden" };
          });
        });
      };

      if (deviceAnimationStep?.id === deviceId) {
        animationFrameId = requestAnimationFrame(animateMixer);
      }

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [ballsArray, speed, deviceAnimationStep, deviceId, radius, startTime, getStaticPositions]);

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
  const fontSize = radius * fontScaling;

  return (
    <>
      { ballPositions.map((position, i) => {
        const {x, y, transform, visibility} = position;
        const text = getLabelForVariable(ballsArray[i]);
        return (
          <Ball
            key={`${deviceId}-ball-${text}-${i}`}
            x={x}
            y={y}
            transform={transform ? transform : ""}
            i={i}
            visibility={visibility}
            radius={radius}
            deviceId={deviceId}
            text={`${text}`}
            fontSize={fontSize}
            handleAddDefs={handleAddDefs}
            handleSetEditingVarName={handleSetEditingVarName}
            handleSetSelectedVariable={handleSetSelectedVariable}
          />
        );
      })}
    </>
  );
};
