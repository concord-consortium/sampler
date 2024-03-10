import React, { useEffect, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import { ClippingDef, ICollectorItem } from "../../../../models/device-model";
import { Ball } from "./ball";
import { Speed } from "../../../../types";

interface IBalls {
  ballsArray: Array<string>;
  deviceId: string;
  isRunning: boolean;
  speed: Speed;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName:  (variableIdx: number) => void;
}

interface IBallPosition {
  x: number;
  y: number;
  transform?: string;
}

export const Balls = ({ballsArray, deviceId, isRunning, speed, handleAddDefs,
  handleSetSelectedVariable, handleSetEditingVarName}: IBalls) => {
  const [ballPositions, setBallPositions] = useState<Array<IBallPosition>>([]);
  const radius = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);

  useEffect(() => {
    if (!isRunning) {
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
            return {x, y, dx, dy, transform: `t${dx},${dy}`};
          });
        });

        if (isRunning) {
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
  }, [ballsArray, radius, isRunning, speed]);

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
