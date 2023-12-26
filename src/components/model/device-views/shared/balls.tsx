import React, { useEffect, useState } from "react";
import { kBorder, kCapHeight, kContainerHeight, kContainerWidth, kContainerX, kContainerY } from "./constants";
import { ICollectorItem } from "../../../../models/device-model";
import { getTextShift, getVariableColor } from "./helpers";

interface IBall {
  x: number;
  y: number;
  radius: number;
  text: string;
  fontSize: number;
}

interface IBalls {
  ballsArray: Array<string>;
}

const Ball = ({ x, y, radius, text, fontSize }: IBall) => {
//   ball.click(this.showVariableNameInput(i));
//   ball.hover((function(circ, lab, size) {
//     return function() {
//       if (_this.isRunning() || device === "collector") return;
//       circ.attr({ fill: getVariableColor(0, 0) });
//       lab.attr({ fontSize: size + 2, dy: ".26em", });
//     };
//   })(circle, label, fontSize), (function(circ, lab, size) {
//     return function() {
//       circ.attr({ fill: getVariableColor(0, 0, true) });
//       lab.attr({ fontSize: size, dy: ".25em", });
//     };
//   })(circle, label, fontSize));
//   ball.orig = {x: x, y: y};
// }

  // const [hover, setHover] = useState(false);

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={getVariableColor(0, 0, false)}
        stroke="#000"
        strokeWidth={1}
        origin={`${x} ${y}`}
      />
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        textAnchor="middle"
        dy=".25em"
        dx={getTextShift(text, (3.8*(radius/fontSize)))}
        clipPath="labelClipping"
      >
        {text}
      </text>
    </g>
  );
};

export const Balls = ({ballsArray}: IBalls) => {
  const [ballProps, setBallProps] = useState<Array<IBall>>([]);

  useEffect(() => {
    const w = kContainerWidth - kCapHeight - (kBorder * 2);
    const maxHeight = kContainerHeight * 0.75;
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
      const x = (rowNumber % 2 === 0) ? kContainerX + kBorder + radius + (rowIndex * radius * 2) : kContainerX + kContainerWidth - kBorder - kCapHeight - radius - (rowIndex * radius * 2);
      const y = kContainerY + kContainerHeight - kBorder - radius - (rowHeight * rowNumber);
      const text = ballsArray[i];
      props.push({x, y, radius, text, fontSize});
    }
    setBallProps(props);
  }, [ballsArray]);

  return (
    <>
      {ballProps.map((props, i) => <Ball key={i} {...props} />)}
    </>
  );
};
