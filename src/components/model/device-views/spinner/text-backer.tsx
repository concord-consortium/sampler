import React from "react";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { ITextBackerPos } from "../../../../types";

interface IProps {
  pos?: ITextBackerPos;
  onClick: () => void;
  isDragging: boolean;
}

export const updateTextBackerRefFn = (setTextBackerPos: (value: React.SetStateAction<ITextBackerPos | undefined>) => void) => (svgText: SVGTextElement | null) => {
  setTextBackerPos(prev => {
    const rect = svgText?.getBBox();
    if (rect) {
      const {x, y, width, height} = rect;
      if (prev && (prev.x === x) && (prev.y === y) && (prev.width === width) && (prev.height === height)) {
        return prev;
      }
      return {x, y, width, height};
    }
    return prev;
  });
};

export const TextBacker = ({pos, onClick, isDragging}: IProps) => {
  const { globalState: { isRunning } } = useGlobalStateContext();

  if (!pos) {
    return null;
  }
  const {x, y, width, height} = pos;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={0}
      style={{ cursor: isRunning ? "default" : isDragging? "grabbing" : "pointer" }}
      onClick={onClick}
    />
  );
};
