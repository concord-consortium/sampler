import React, { useEffect, useMemo, useState } from "react";
import { kSpinnerX, kSpinnerY } from "../shared/constants";
import { getCoordinatesForPercent } from "../shared/helpers";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";

interface IProps {
  percent: number;
  lastPercent: number;
  varArrayIdx: number;
  isDragging: boolean;
  handleSetSelectedVariable?: (variableIdx: number) => void;
  handleStartDrag?: (originPt: {x: number; y: number;}) => void;
}

export const SeparatorLine = ({percent, lastPercent, varArrayIdx, isDragging, handleSetSelectedVariable, handleStartDrag}: IProps) => {
  const { globalState: { isRunning } } = useGlobalStateContext();
  const [edgePath, setEdgePath] = useState("");
  const [style, setStyle] = useState<React.CSSProperties|undefined>(undefined);
  const [hovering, setHovering] = useState(false);

  const p1 = useMemo(() => getCoordinatesForPercent(lastPercent), [lastPercent]);
  const p2 = useMemo(() => getCoordinatesForPercent(lastPercent + percent), [lastPercent, percent]);

  const canDrag = useMemo(() => !!(!isRunning && handleSetSelectedVariable && handleStartDrag), [isRunning, handleSetSelectedVariable, handleStartDrag]);

  useEffect(() => {
    setEdgePath(`M ${kSpinnerX} ${kSpinnerY} L ${p2[0]} ${p2[1]}`);
  }, [p1, p2]);

  useEffect(() => {
    if (isDragging) {
      setStyle({cursor: "grabbing"});
    } else if (canDrag) {
      setStyle({cursor: "pointer"});
    } else {
      setStyle(undefined);
    }
  }, [canDrag, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (canDrag) {
      handleSetSelectedVariable?.(varArrayIdx);
      handleStartDrag?.({x: p1[0], y: p1[1]});
    }
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => setHovering(false);

  return (
    <>
      {hovering && <circle cx={kSpinnerX} cy={kSpinnerY} r={5} fill="#fff" style={{pointerEvents: "none"}} />}
      {canDrag && <path
        d={edgePath}
        stroke={"#000"}
        strokeWidth={10}
        opacity={0}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={style}
      />}
      <path
        d={edgePath}
        stroke={"#FFF"}
        strokeWidth={hovering ? 4 : 1}
        style={{pointerEvents: "none"}}
      />
    </>
  );
};
