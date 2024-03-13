import React, { useEffect, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import { ClippingDef, ICollectorItem } from "../../../../models/device-model";
import { Ball } from "./ball";
import { useAnimationContext } from "../../../../hooks/useAnimation";

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
  targetX?: number;
  targetY?: number;
  transform?: string;
}

export const Balls = ({ballsArray, deviceId, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IBalls) => {
  const { deviceAnimationStep } = useAnimationContext();
  const [ballPositions, setBallPositions] = useState<Array<IBallPosition>>([]);
  const [selectedVariableIdx, setSelectedVariableIdx] = useState<number | undefined>(undefined);
  const radius = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);

  useEffect(() => {
    if (deviceAnimationStep?.selectedVariable && deviceAnimationStep?.id === deviceId) {
      const {selectedVariable} = deviceAnimationStep;
      const matchingIndices: number[] = ballsArray.map((ball, index) => ball === selectedVariable ? index : -1).filter(index => index !== -1);
      const randomIndex = Math.floor(Math.random() * matchingIndices.length);
      setSelectedVariableIdx(matchingIndices[randomIndex]);
    }
  }, [deviceAnimationStep, ballsArray, deviceId]);

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
        return {x, y};
      }));
    } else {
      let animationFrameId: number;

      const positionBallsRandomly = () => {
        const duration = deviceAnimationStep?.duration || 1000; // Default duration if not specified
        const speed = (kMixerContainerWidth / duration) * 16.666; // Example calculation, assuming 60 FPS (1000ms/60frames = 16.666ms per frame)
        const minX = kContainerX + kBorder + radius;
        const maxY = kContainerY + kMixerContainerHeight - kBorder - radius;
        const width = kMixerContainerWidth - kBorder - kCapHeight - (radius * 2);
        const height = kMixerContainerHeight - kBorder - (radius * 2);

        setBallPositions((prevState: IBallPosition[]) => {
          return prevState.map((position, i) => {
            if (selectedVariableIdx !== i) {
              // Check if the ball has a target, otherwise assign a new one
              if (position.targetX === undefined || position.targetY === undefined || (position.x === position.targetX && position.y === position.targetY)) {
                position.targetX = minX + Math.random() * width;
                position.targetY = maxY - Math.random() * height;
              }

              // Calculate the direction and distance to move this frame
              const dx = position.targetX - position.x;
              const dy = position.targetY - position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > speed) {
                const ratio = speed / distance;
                const moveX = dx * ratio;
                const moveY = dy * ratio;
                position.x += moveX;
                position.y += moveY;
              } else {
                // Snap to the target position if very close, and assign a new target in the next frame
                position.x = position.targetX;
                position.y = position.targetY;
                delete position.targetX;
                delete position.targetY;
              }

              return { ...position };
            } else {
              return position;
            }
          });
        });

        if (deviceAnimationStep?.id === deviceId) {
          animationFrameId = requestAnimationFrame(positionBallsRandomly);
        }
      };

      animationFrameId = requestAnimationFrame(positionBallsRandomly);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [ballsArray, radius, deviceAnimationStep, selectedVariableIdx, deviceId]);

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
        const {x, y, transform} = position;
        const text = getLabelForVariable(ballsArray[i]);
        return (
          <Ball
            key={`${deviceId}-ball-${text}-${i}`}
            x={x}
            y={y}
            transform={transform ? transform : ""}
            i={i}
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
