import React, { useCallback, useEffect, useRef, useState } from "react";

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

const kMaxLabelHeight = 20;
const kMaxLabelWidth = 100;

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

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState("*");
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Using data attributes and directly linking to rendered divs isn't the "React way" but in this instance
  // the arrows are rendered in parallel with the device divs that are layed out by the browser using flexbox.
  // Due to this approach of letting the browser do the layout the target div ref can't be passed to the arrow
  // so instead we pass the devices and then look up their rendered divs and then force a redraw if the target
  // div doesn't exist so the arrow is rendered again after the target is rendered.  It is a bit hacky but this
  // lets us leverage the browser flexbox layout.
  const sourceDiv = document.querySelector(`[data-device-id="${source.id}"]`) as HTMLDivElement|null;
  const targetDiv = document.querySelector(`[data-device-id="${target.id}"]`) as HTMLDivElement|null;

  const resetLabelInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = label;
    }
  }, [label]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // clicks outside the label ref cancel editing
      let walker = e.target as HTMLElement|null;
      while (walker !== null) {
        if (walker === labelRef.current) {
          return;
        }
        walker = walker.parentElement;
      }
      handleToggleEditing();
      resetLabelInput();
    };
    if (editing) {
      addEventListener("mouseup", handleMouseUp);
      return () => removeEventListener("mouseup", handleMouseUp);
    }
  }, [editing, resetLabelInput]);

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

  let svgTop = Math.min(sourceRect.midY, targetRect.midY);
  let svgBottom = Math.max(sourceRect.midY, targetRect.midY);
  let svgHeight = svgBottom - svgTop;
  const horizontalArrow = svgHeight === 0;
  const minSvgHeight = Math.max(kMarkerHeight, kMarkerWidth) * 4;
  if (svgHeight < minSvgHeight) {
    const halfHeightDiff = (minSvgHeight - svgHeight) / 2;
    svgHeight = minSvgHeight;
    svgTop -= halfHeightDiff;
    svgBottom += halfHeightDiff;
  }

  const svgLeft = sourceRect.right;
  const svgWidth = targetRect.left - sourceRect.right;

  const labelTop = horizontalArrow ? svgBottom + 10 : svgTop + (svgHeight / 2) - (kMaxLabelHeight / 2);
  const labelLeft = svgLeft + (svgWidth / 2) - (kMaxLabelWidth / 2);

  const start: IPoint = {x: 0, y: sourceRect.midY - svgTop};
  const end: IPoint = {x: svgWidth, y: targetRect.midY - svgTop};

  const svgStyle: React.CSSProperties = {top: svgTop, left: svgLeft, width: svgWidth, height: svgHeight};
  const labelStyle: React.CSSProperties = {top: labelTop, left: labelLeft, width: kMaxLabelWidth};
  const labelFormStyle: React.CSSProperties = {display: editing ? "block" : "none"};
  const labelSpanStyle: React.CSSProperties = {display: editing ? "none" : "inline-block"};

  const markerId = `arrow_${source.id}_${target.id}`;

  const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedLabel = (inputRef.current?.value ?? "").trim();
    if (trimmedLabel.length > 0) {
      // TODO LATER: update source device in model with trimmedLabel

      setLabel(trimmedLabel);
      handleToggleEditing();
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Escape") {
      handleToggleEditing();
      resetLabelInput();
    }
  };

  const handleToggleEditing = () => {
    setEditing(prev => {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 1);
      return !prev;
    });
  };

  return (
    <>
      <svg className="arrow" style={svgStyle} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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
      <div ref={labelRef} className="arrow-label" style={labelStyle}>
        <form onSubmit={handleSubmitEdit} style={labelFormStyle}>
          <input type="text" ref={inputRef} defaultValue={label} onKeyDown={handleLabelKeyDown} style={{height: kMaxLabelHeight}} />
        </form>
        <div onClick={handleToggleEditing} style={labelSpanStyle}>{label}</div>
      </div>
    </>
  );
};
