import React, { useEffect, useState } from "react";
import { kBorder, kCapHeight, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import { ClippingDef, ICollectorItem } from "../../../../models/device-model";
import { Ball, IBall } from "./ball";

interface IBalls {
  ballsArray: Array<string>;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
}

export const Balls = ({ballsArray, handleAddDefs, handleSetSelectedVariable}: IBalls) => {
  const [ballProps, setBallProps] = useState<Array<IBall>>([]);

  useEffect(() => {
    const w = kMixerContainerWidth - kCapHeight - (kBorder * 2);
    const maxHeight = kMixerContainerHeight * 0.75;
    const radius = ballsArray.length < 15 ? 14 : Math.max(14 - (10 * (ballsArray.length - 15)/200), 4);
    const maxInRow = Math.floor(w / (radius * 2));
    const numRows = Math.ceil(ballsArray.length / maxInRow);
    const rowHeight = Math.min(radius * 2, maxHeight / numRows);

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

    const props = [];

    for (let i = 0; i < ballsArray.length; i++) {
      const rowNumber = Math.floor(i / maxInRow);
      const rowIndex = i % maxInRow;
      const x = (rowNumber % 2 === 0) ? kContainerX + kBorder + radius + (rowIndex * radius * 2) : kContainerX + kMixerContainerWidth - kBorder - kCapHeight - radius - (rowIndex * radius * 2);
      const y = kContainerY + kMixerContainerHeight - kBorder - radius - (rowHeight * rowNumber);
      const text = ballsArray[i];
      props.push({x, y, radius, text, fontSize, handleAddDefs, handleSetSelectedVariable, i});
    }
    setBallProps(props);
  }, [ballsArray, handleAddDefs, handleSetSelectedVariable]);

  return (
    <>
      {ballProps.map((props, i) => <Ball key={i} {...props} />)}
    </>
  );
};
