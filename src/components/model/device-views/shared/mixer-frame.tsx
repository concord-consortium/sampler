import React from "react";
import { kBorder, kCapHeight, kCapWidth, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import "./mixer-frame.scss";

interface IMixerFrame {
  withReplacement: boolean;
}

export const MixerFrame = ({withReplacement}: IMixerFrame) => {
  const halfb = (kBorder/2);
  const mx = kContainerX + halfb;
  const my = kContainerY + halfb;
  const h = kMixerContainerHeight - kBorder;
  const shoulder = (h - kCapWidth) / 2;
  const cap = kCapHeight - halfb;
  const w = kMixerContainerWidth - kCapHeight - halfb;
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
