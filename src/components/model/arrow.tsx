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
  modelIsRunning: boolean
  numSamples: string //temporary so we don't run forever
}

type Rect = Omit<DOMRect, "toJSON"> & {midY: number};

const kMarkerWidth = 5;
const kMarkerHeight = 5;
const kArrowLineBuffer = 3; //end line under arrowhead instead of the entire width of gap

const kMaxLabelHeight = 22;
const kWidthBetweenDevices = 40;

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

export const Arrow = ({source, target, model, selectedDeviceId, modelIsRunning, numSamples}: IProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawCount, setDrawCount] = useState(0);
  const redraw = () => setDrawCount(prev => prev + 1);

  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState("*");
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const animationLineRef = useRef<SVGLineElement>(null);
  const [flashArrow, setFlashArrow] = useState(false);
  const [runAnimation, setRunAnimation] = useState(false);
  const numAnimationCycles = useRef(0);

  // Using data attributes and directly linking to rendered divs isn't the "React way" but in this instance
  // the arrows are rendered in parallel with the device divs that are layed out by the browser using flexbox.
  // Due to this approach of letting the browser do the layout the target div ref can't be passed to the arrow
  // so instead we pass the devices and then look up their rendered divs and then force a redraw if the target
  // div doesn't exist so the arrow is rendered again after the target is rendered.  It is a bit hacky but this
  // lets us leverage the browser flexbox layout.
  const sourceDiv = document.querySelector(`[data-device-id="${source.id}"]`) as HTMLDivElement|null;
  const targetDiv = document.querySelector(`[data-device-id="${target.id}"]`) as HTMLDivElement|null;
  const labelDivWidth = labelRef.current?.getBoundingClientRect().width || 22;
  const markerId = `arrow_${source.id}_${target.id}`;
  let arrowLength = 0;

  const resetLabelInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = label;
    }
  }, [label]);

  const handleToggleEditing = () => {
    setEditing(prev => {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 1);
      return !prev;
    });
  };

  const handleUpdateLabel = useCallback(() => {
    const trimmedLabel = (inputRef.current?.value ?? "").trim();

    if (trimmedLabel.length > 0) {
      // TODO LATER: update source device in model with trimmedLabel
      setLabel(trimmedLabel);
      handleToggleEditing();
    } else {
      if (inputRef.current) {
        inputRef.current.value = "*";
        setLabel("*");
      }
    }
  }, [setLabel]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // clicks outside the label ref commits the edit
      let walker = e.target as HTMLElement|null;
      while (walker !== null) {
        if (walker === labelRef.current) {
          return;
        }
        walker = walker.parentElement;
      }
      handleUpdateLabel();
    };
    if (editing) {
      addEventListener("mouseup", handleMouseUp);
      return () => removeEventListener("mouseup", handleMouseUp);
    }
  }, [editing, handleUpdateLabel]);

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

  useEffect(() => {setRunAnimation(modelIsRunning);}, [modelIsRunning]);

  // when the plugin is resized or the scrollbar appears/disappears redraw since the arrow is absolutely positioned
  useResizer(redraw);

  useEffect(() => {
    if (runAnimation) {
      let startTime: number | null = null;
      const duration = 3000; // Duration in milliseconds for the whole animation cycle

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsedTime = time - startTime;
        const progress = elapsedTime / duration;

        // Update the stroke-dashoffset to create a moving pulse effect
        if (animationLineRef.current) {
          const dashOffset = (arrowLength) * (1 - progress);
          animationLineRef.current.style.strokeDashoffset = `${dashOffset}`;
          animationLineRef.current.style.strokeDasharray = `${arrowLength}`;
          const leadingEdgePosition = (arrowLength) * progress;
          const markerPosition = (arrowLength - 14);

          if (leadingEdgePosition >= markerPosition) {
            setFlashArrow(true);
          } else {
            setFlashArrow(false);
          }
        }
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (numAnimationCycles.current < Number(numSamples) - 1) {
            numAnimationCycles.current = numAnimationCycles.current + 1;
            startTime = null; // reset startTime for continuous loop
            requestAnimationFrame(animate); // for continuous loop
          } else {
            setRunAnimation(false);
            numAnimationCycles.current = 0;
          }
        }
      };

      requestAnimationFrame(animate);
    }
  }, [arrowLength, markerId, runAnimation, numAnimationCycles, numSamples]);

  // wait until both the source and target div are drawn
  if (!sourceDiv || !targetDiv) {
    return null;
  }

  const sourceRect = getRect(sourceDiv);
  const targetRect = getRect(targetDiv);
  // rect.midY takes into account the y position of the rect vs midpoint based on height.
  const sourceMidPointY = (sourceRect.bottom - sourceRect.top) / 2;
  const targetMidPointY = (targetRect.bottom - targetRect.top) / 2;
  let svgTop = Math.min(sourceMidPointY + kMaxLabelHeight, targetMidPointY + kMaxLabelHeight);
  let svgBottom = Math.max(sourceRect.midY, targetRect.midY);
  let svgHeight = svgBottom - svgTop;
  const horizontalArrow = sourceRect.midY === targetRect.midY;
  const minSvgHeight = Math.max(kMarkerHeight, kMarkerWidth) * 4;
  if (svgHeight < minSvgHeight) {
    const halfHeightDiff = (minSvgHeight + svgHeight) / 2;
    svgHeight = minSvgHeight;
    svgTop -= halfHeightDiff;
    svgBottom += halfHeightDiff;
  }

  const svgLeft = -kWidthBetweenDevices;
  const svgWidth = targetRect.left - sourceRect.right;
  const start: IPoint = {x: 0, y: sourceRect.midY - svgTop};
  const end: IPoint = {x: svgWidth, y: targetRect.midY - svgTop};
  arrowLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const arrowMidPoint = (end.y - start.y) / 2;
  const labelTop = horizontalArrow ? 0 : arrowMidPoint < 0 ? arrowMidPoint - kMaxLabelHeight/2 : -arrowMidPoint - kMaxLabelHeight;
  const labelLeft = (svgWidth / 2) - (labelDivWidth / 2);

  const arrowContainerStyle: React.CSSProperties = {top: 0, left: svgLeft, width: svgWidth, height: svgHeight + kMarkerHeight};
  const labelStyle: React.CSSProperties = {top: labelTop, left: labelLeft};

  const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpdateLabel();
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch(e.code) {
      case "Escape":
        handleToggleEditing();
        resetLabelInput();
        break;
      case "Enter":
        handleToggleEditing();
        handleUpdateLabel();
        break;
    }
  };

  return (
    <div className="arrow-container" style={arrowContainerStyle}>
      <svg className="arrow" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id={markerId}
            viewBox={`0 0 ${kMarkerWidth} ${kMarkerHeight}`}
            refX={kMarkerWidth - kArrowLineBuffer}
            refY={kMarkerHeight / 2}
            markerWidth={kMarkerWidth}
            markerHeight={kMarkerHeight}
            orient="auto"
          >
            <polygon points={`0 0, ${kMarkerWidth} ${kMarkerHeight / 2}, 0 ${kMarkerHeight}`} fill={flashArrow && runAnimation ? "#ff6347": "#008cba"}/>
          </marker>
        </defs>
        <line
          x1={start.x}
          y1={start.y - kMarkerHeight}
          x2={end.x - kMarkerWidth}
          y2={end.y - kMarkerHeight}
          markerEnd={`url(#${markerId})`}
        />
        <line ref={animationLineRef}
          className={`pulse-line ${runAnimation ? "visible" : ""}`}
          x1={start.x}
          y1={start.y - kMarkerHeight}
          x2={end.x - kMarkerWidth}
          y2={end.y - kMarkerHeight}
          markerEnd={`url(#${markerId})`}
        />
      </svg>
      <div ref={labelRef} className="arrow-label" style={labelStyle}>
        { editing
          ? <form className="label-form" onSubmit={handleSubmitEdit}>
              <input type="text" ref={inputRef} defaultValue={label} onKeyDown={handleLabelKeyDown}
                  style={{height: kMaxLabelHeight}} />
            </form>
          : <div className="label-span" tabIndex={0} onKeyDown={handleToggleEditing} onClick={handleToggleEditing}>{label}</div>
        }
      </div>
    </div>
  );
};
