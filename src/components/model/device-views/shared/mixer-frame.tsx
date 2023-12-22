import React from "react";

import "./mixer-frame.scss";

const kContainerX = 10;
const kContainerY = 0;
const kContainerWidth = 130;
const kContainerHeight = 190;
const kCapHeight = 6;
const kCapWidth = 40;
const kBorder = 2;

interface IMixerFrame {
  withReplacement: boolean;
}

export const MixerFrame = ({withReplacement}: IMixerFrame) => {
  const halfb = (kBorder/2);
  const mx = kContainerX + halfb;
  const my = kContainerY + halfb;
  const h = kContainerHeight - kBorder;
  const shoulder = (h - kCapWidth) / 2;
  const cap = kCapHeight - halfb;
  const w = kContainerWidth - kCapHeight - halfb;
  const pathStr = `m${mx},${my} h ${w} v ${shoulder} h ${cap} v ${kCapWidth} h -${cap} v ${shoulder} h -${w} z`;
  const clipping = "none";

return (
  <div className="mixer-frame-container">
    <svg className="mixer-frame" width="100%" height="100%" viewBox={`0 0 ${kContainerWidth + 10} ${kContainerHeight}`} xmlns="http://www.w3.org/2000/svg">
      <path
        className="mixer-frame-path"
        d={pathStr}
        fill="none"
        stroke="#333"
        strokeWidth={kBorder}
        clipPath={clipping}
      />
    </svg>
  </div>
);
};
