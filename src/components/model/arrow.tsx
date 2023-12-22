import React, { useEffect, useState } from "react";

import { IDevice } from "../../models/device-model";
import { IModel } from "../../models/model-model";
import { useResizer } from "../../hooks/use-resizer";

import "./arrow.scss";

interface IPoint {
  x: number
  y: number;
}

interface IProps {
  source: IDevice
  target: IDevice
  model: IModel
  selectedDeviceId?: string
}

type Rect = Omit<DOMRect, "toJSON"> & {midY: number};

const kMarkerWidth = 5;
const kMarkerHeight = 5;

const getRect = (el: HTMLElement): Rect => {
  const {width, height} = el.getBoundingClientRect();

  // correct for the scrolling iframe
  let x = 0;
  let y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent as HTMLElement;
  }
  const midY = y + (height / 2);

  return {width, height, x, y, left: x, right: x + width, top: y, bottom: y + height, midY};
};

export const Arrow = ({source, target, model, selectedDeviceId}: IProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawCount, setDrawCount] = useState(0);
  const redraw = () => setDrawCount(prev => prev + 1);

  // Using data attributes and directly linking to rendered divs isn't the "React way" but in this instance
  // the arrows are rendered in parallel with the device divs that are layed out by the browser using flexbox.
  // Due to this approach of letting the browser do the layout the target div ref can't be passed to the arrow
  // so instead we pass the devices and then look up their rendered divs and then force a redraw if the target
  // div doesn't exist so the arrow is rendered again after the target is rendered.  It is a bit hacky but this
  // lets us leverage the browser flexbox layout.
  const sourceDiv = document.querySelector(`[data-device-id="${source.id}"]`) as HTMLDivElement|null;
  const targetDiv = document.querySelector(`[data-device-id="${target.id}"]`) as HTMLDivElement|null;

  // on the initial render the target div will not exist as it is sibling of this component so force a redraw
  useEffect(() => {
    if (!targetDiv) {
      redraw();
    }
  }, [targetDiv]);

  // when the model changes (devices added or removed) or the selected device changes redraw
  useEffect(() => {
    redraw();
  }, [model, selectedDeviceId]);

  // when the plugin is resized or the scrollbar appears/disappears redraw since the arrow is absolutely positioned
  useResizer(redraw);

  // wait until both the source and target div are drawn
  if (!sourceDiv || !targetDiv) {
    return null;
  }

  const sourceRect = getRect(sourceDiv);
  const targetRect = getRect(targetDiv);

  let top = Math.min(sourceRect.midY, targetRect.midY);
  let bottom = Math.max(sourceRect.midY, targetRect.midY);
  let height = bottom - top;
  const minHeight = Math.max(kMarkerHeight, kMarkerWidth) * 4;
  if (height < minHeight) {
    const halfHeightDiff = (minHeight - height) / 2;
    height = minHeight;
    top -= halfHeightDiff;
    bottom += halfHeightDiff;
  }

  const left = sourceRect.right;
  const width = targetRect.left - sourceRect.right;

  const start: IPoint = {x: 0, y: sourceRect.midY - top};
  const end: IPoint = {x: width, y: targetRect.midY - top};

  const style: React.CSSProperties = {top, left, width, height};

  const markerId = `arrow_${source.id}_${target.id}`;

  return (
    <svg className="arrow" style={style} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker
          id={markerId}
          viewBox={`0 0 ${kMarkerWidth} ${kMarkerHeight}`}
          refX={kMarkerWidth}
          refY={kMarkerHeight / 2}
          markerWidth={kMarkerWidth}
          markerHeight={kMarkerHeight}
          orient="auto"
        >
          <polygon points={`0 0, ${kMarkerWidth} ${kMarkerHeight / 2}, 0 ${kMarkerHeight}`} />
        </marker>
      </defs>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
};
