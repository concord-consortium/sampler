import React from "react";
import { kBorder, kCapHeight, kCapWidth, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import "./mixer-frame.scss";

export const MixerFrame = () => {
  const halfb = kBorder / 2;
  const mx = kContainerX + halfb;
  const my = kContainerY + halfb;
  const w = kMixerContainerWidth - kBorder;
  const shoulder = (w - kCapWidth) / 2;
  const cap = kCapHeight - halfb;
  const h = kMixerContainerHeight - halfb;
  const pathStr = `m${mx},${my + h} v -${h} h ${shoulder} v -${cap} h ${kCapWidth} v ${cap} h ${shoulder} v ${h} z`;
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
