import React from "react";

import "./mixer-frame.scss";
import { kBorder, kCapHeight, kCapWidth, kContainerHeight, kContainerWidth, kContainerX, kContainerY } from "./constants";

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
    <path
      className="mixer-frame-path"
      d={pathStr}
      fill="none"
      stroke="#333"
      strokeWidth={kBorder}
      clipPath={clipping}
    />
  );
};
