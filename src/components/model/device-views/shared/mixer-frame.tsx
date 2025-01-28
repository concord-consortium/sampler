import React from "react";
import { kBorder, kCapHeight, kCapWidth, kMixerContainerHeight, kMixerContainerWidth, kContainerX, kContainerY } from "./constants";
import "./mixer-frame.scss";

interface Props {
  hidden: boolean;
}

export const MixerFrame = ({ hidden }: Props) => {
  const halfb = kBorder / 2;
  const mx = kContainerX + halfb;
  const my = kContainerY + halfb;
  const w = kMixerContainerWidth - kBorder;
  const shoulder = (w - kCapWidth) / 2;
  const cap = kCapHeight - halfb;
  const h = kMixerContainerHeight - halfb;
  const pathStr = `m${mx},${my + h} v -${h} h ${shoulder} v -${cap} h ${kCapWidth} v ${cap} h ${shoulder} v ${h} z`;
  const clipping = "none";
  const fill = hidden ? "#e8e8e8" : "none";
  const textX = mx + (kMixerContainerWidth / 2);
  const textY = my + (kMixerContainerHeight / 2);

  return (
    <>
      <path
        id="mixerPath"
        className="mixer-frame-path"
        d={pathStr}
        fill={fill}
        stroke="#333"
        strokeWidth={kBorder}
        clipPath={clipping}
      />
      {hidden &&
        <text
          x={textX}
          y={textY + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="100px"
          fontWeight="bold"
          fill="white">
          ?
        </text>
      }
    </>
  );
};
