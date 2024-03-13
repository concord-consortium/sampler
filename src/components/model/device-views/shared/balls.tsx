import React, { useEffect, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
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

export const Balls = ({ballsArray, deviceId, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IBalls) => {
  const { globalState: { speed } } = useGlobalStateContext();
  const { deviceAnimationStep } = useAnimationContext();
  const [ballPositions, setBallPositions] = useState<Array<IBallPosition>>([]);
  const radius = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);


  useEffect(() => {
    if (deviceAnimationStep?.id !== deviceId) {
      const w = kMixerContainerWidth - kCapHeight - (kBorder * 2);
      const maxHeight = kMixerContainerHeight * 0.75;
      const maxInRow = Math.floor(w / (radius * 2));
      const numRows = Math.ceil(ballsArray.length / maxInRow);
      const rowHeight = Math.min(radius * 2, maxHeight / numRows);
      setBallPositions(ballsArray.map((ball, i) => {
        const rowNumber = Math.floor(i / maxInRow);
        const rowIndex = i % maxInRow;
        const x = (rowNumber % 2 === 0) ? kContainerX + kBorder + radius + (rowIndex * radius * 2) : kContainerX + kMixerContainerWidth - kBorder - kCapHeight - radius - (rowIndex * radius * 2);
        const y = kContainerY + kMixerContainerHeight - kBorder - radius - (rowHeight * rowNumber);
        const randomSpeed = 5 + (Math.random() * 7);
        const direction = Math.PI + (Math.random() * Math.PI);
        const vx = Math.cos(direction) * randomSpeed;
        const vy = Math.sin(direction) * randomSpeed;
        return {x, y, vx, vy, transform: "", visibility: "visible"};
      }));
    } else {
      const {selectedVariable} = deviceAnimationStep;
      const matchingIndices: number[] = ballsArray.map((ball, index) => ball === selectedVariable ? index : -1).filter(index => index !== -1);
      const randomIndex = Math.floor(Math.random() * matchingIndices.length);
      const selectedVariableIdx = matchingIndices[randomIndex];

      let animationFrameId: number;
      let stepOffset = 0;
      let animationSpeed: number;
      let timeoutId: number;

      const animateMixer = () => {
        if (deviceAnimationStep?.id === deviceId) {
          stepOffset += 1;
          const timeout = Math.min(Math.max(30, ballsArray.length * 1.5), 200);
          animationSpeed = timeout / 30;

          if (deviceAnimationStep?.id === deviceId) {
            timeoutId = setTimeout(() => {
              animationFrameId = requestAnimationFrame(animateMixer);
            }, timeout);
          }

          if (deviceAnimationStep?.id === deviceId) {
            if (ballsArray.length < 100) {
              mixerAnimationStep();
            } else if (ballsArray.length < 400) {
              positionBallsRandomly();
            } else {
              fakeMixerAnimationStep();
            }
          }
        }
      };

      const mixerAnimationStep = () => {
        const animationSpeedBoost = Math.min((speed + 1) / animationSpeed, 4);

        setBallPositions((prevState) => {
          return prevState.map((position, index) => {
            if (index !== selectedVariableIdx) {
              // calculate velocity and next position
              let { vx, vy, x, y } = position;
              const dx = vx * animationSpeedBoost;
              const dy = vy * animationSpeedBoost;
              let newX = x + dx;
              let newY = y + dy;

              // check for wall collisions and adjust velocity
              if (newX - radius < kContainerX + kBorder || newX + radius > kContainerX + kMixerContainerWidth - kCapHeight - kBorder) {
                vx = -vx;
                newX = x; // reset the position since collision occurred
              }
              if (newY - radius < kContainerY + kBorder || newY + radius > kContainerY + kMixerContainerHeight - kBorder) {
                vy = -vy;
                newY = y; // reset the position since collision occurred
              }

              const transform = `translate(${dx},${dy})`;
              return { ...position, x: newX, y: newY, vx, vy, transform};
            } else {
              return position;
            }
          });
        });
      };

      const positionBallsRandomly = () => {
        const minX = kContainerX + kBorder + radius;
        const maxY = kContainerY + kMixerContainerHeight - kBorder - radius;
        const width = kMixerContainerWidth - kBorder - kCapHeight - (radius * 2);
        const height = kMixerContainerWidth - kBorder - (radius * 2);
        setBallPositions((prevState: IBallPosition[]) => {
          return prevState.map((position, i) => {
            const prevX = position.x;
            const prevY = position.y;
            const x = minX + Math.random() * width;
            const y = maxY - Math.random() * height;
            const dx = x - prevX;
            const dy = y - prevY;
            const randomSpeed = 5 + (Math.random() * 7);
            const direction = Math.PI + (Math.random() * Math.PI);
            const vx = Math.cos(direction) * randomSpeed;
            const vy = Math.sin(direction) * randomSpeed;
            return {x, y, vx, vy, transform: `t${dx},${dy}`, visibility: "visible"};
          });
        });
      };

      const fakeMixerAnimationStep = () => {
        const numBalls = ballsArray.length;
        const skipEveryNthBall = Math.max(75 - Math.floor(numBalls / 2), 2);
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
  }, [ballsArray, speed, deviceAnimationStep, deviceId, radius]);

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
