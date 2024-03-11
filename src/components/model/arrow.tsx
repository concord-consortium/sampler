import React, { useEffect, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { IDevice } from "../../models/device-model";
import { useResizer } from "../../hooks/use-resizer";

import "./arrow.scss";
import { FormulaEditor } from "./formula-editor";

interface IPoint {
  x: number
  y: number;
}

interface IProps {
  source: IDevice
  target: IDevice
  selectedDeviceId?: string
  columnIndex: number
}

type Rect = Omit<DOMRect, "toJSON"> & {midY: number};

const kMarkerWidth = 4;
const kMarkerHeight = 5;
const kArrowLineBuffer = 3; //end line under arrowhead instead of the entire width of gap

const kMaxLabelHeight = 22;
const kWidthBetweenDevices = 40;
const kAnimationDuration = 2500; // Duration in milliseconds for the whole animation cycle

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

export const Arrow = ({source, target, columnIndex, selectedDeviceId}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, modelIsRunning, numSamples } = globalState;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [drawCount, setDrawCount] = useState(0);
  const redraw = () => setDrawCount(prev => prev + 1);

  const animationLineRef = useRef<SVGLineElement>(null);
  const [showFinalMarker, setShowFinalMarker] = useState(false);
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
  const markerId = `arrow_${source.id}_${target.id}`;
  let arrowLength = 0;


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

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsedTime = time - startTime;
        const progress = elapsedTime / kAnimationDuration;

        // Update the stroke-dashoffset to create a moving pulse effect
        if (animationLineRef.current) {
          const dashOffset = (arrowLength) * (1 - progress);
          animationLineRef.current.style.strokeDashoffset = `${dashOffset}`;
          animationLineRef.current.style.strokeDasharray = `${arrowLength}`;
          // const leadingEdgePosition = (arrowLength) * progress;
          // const markerPosition = (arrowLength - 14);
          const markerPosition = kMarkerWidth + kArrowLineBuffer;
          // const currentOffset = parseFloat(window.getComputedStyle(animationLineRef.current).strokeDashoffset);
          // if (currentOffset <= kMarkerWidth + kArrowLineBuffer) {

          if (dashOffset <= markerPosition) {
            setShowFinalMarker(true);
          } else {
            setShowFinalMarker(false);
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
            setGlobalState(draft => {
              draft.modelIsRunning = false;
            });
          }
        }
      };

      requestAnimationFrame(animate);
    }
  }, [arrowLength, markerId, runAnimation, numAnimationCycles, numSamples, setGlobalState]);

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
  const horizontalArrow = sourceRect.midY === targetRect.midY;


  const arrowContainerStyle: React.CSSProperties = {top: 0, left: svgLeft, width: svgWidth, height: svgHeight + kMarkerHeight};

  return (
    <div className="arrow-container" style={arrowContainerStyle}>
      <svg className="arrow" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id={`init-${markerId}`}
            viewBox={`0 0 ${kMarkerWidth} ${kMarkerHeight}`}
            refX={kMarkerWidth}
            refY={kMarkerHeight / 2}
            markerWidth={kMarkerWidth}
            markerHeight={kMarkerHeight}
            orient="auto-start-reverse"
            fill="#a2a2a2"
          >
            <polygon points={`0 0, ${kMarkerWidth} ${kMarkerHeight / 2}, 0 ${kMarkerHeight}`} />
          </marker>
          <marker
            id={`final-${markerId}`}
            viewBox={`0 0 ${kMarkerWidth} ${kMarkerHeight}`}
            refX={kMarkerWidth}
            refY={kMarkerHeight / 2}
            markerWidth={kMarkerWidth}
            markerHeight={kMarkerHeight}
            orient="auto-start-reverse"
            fill="#008cba"
          >
            <polygon points={`0 0, ${kMarkerWidth} ${kMarkerHeight / 2}, 0 ${kMarkerHeight}`} />
          </marker>
        </defs>
        <line
          x1={start.x}
          y1={start.y - kMarkerHeight}
          x2={end.x + kMarkerWidth - kArrowLineBuffer}
          y2={end.y - kMarkerHeight}
          stroke={runAnimation ? "#a2a2a2" : "#008cba"}
          markerEnd={showFinalMarker || !runAnimation ? `url(#final-${markerId})` : `url(#init-${markerId})`}
        />
        <line ref={animationLineRef}
          className={`pulse-line ${runAnimation ? "visible" : ""}`}
          x1={start.x}
          y1={start.y - kMarkerHeight}
          x2={end.x + kMarkerWidth - kArrowLineBuffer}
          y2={end.y - kMarkerHeight}
          stroke = "#008cba"
          strokeDasharray={arrowLength}
          strokeDashoffset={arrowLength}
        />
      </svg>
      <FormulaEditor
        source={source}
        target={target}
        columnIndex={columnIndex}
        arrowMidPoint={arrowMidPoint}
        svgWidth={svgWidth}
        horizontalArrow={horizontalArrow}
      />
    </div>
  );
};
