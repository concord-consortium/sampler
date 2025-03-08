import React, { useEffect, useMemo, useState } from "react";
import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "../shared/constants";
import { getTextShift, getVariableColor } from "../shared/helpers";
import { Wedge } from "./wedge";
import { SeparatorLine } from "./separator-lines";
import { useGlobalStateContext } from "../../../../hooks/useGlobalState";
import { TextBacker, updateTextBackerRefFn } from "./text-backer";
import { Needle } from "./needle";
import { ClippingDef, IDevice, ITextBackerPos, IVariableLocation } from "../../../../types";
import { useSpinnerAnimation } from "../../../../hooks/useSpinnerAnimation";

interface IProps {
  device: IDevice;
  selectedVariableIdx: number|null;
  isDragging: boolean;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleDeleteWedge: (e: React.MouseEvent, variableName: string) => void;
  handleSetEditingPct: () => void;
  handleSetEditingVarName: (variableIdx: number) => void;
  handleStartDrag: (originPt: {x: number; y: number;}) => void;
}

export const Spinner = ({device, selectedVariableIdx, isDragging, handleSetSelectedVariable, handleDeleteWedge,
  handleSetEditingPct, handleSetEditingVarName, handleAddDefs, handleStartDrag}: IProps) => {
  const { globalState: { isRunning } } = useGlobalStateContext();
  const [selectedWedge, setSelectedWedge] = useState<string|null>(null);
  const [draggingBoundary, setDraggingBoundary] = useState<{
    beforeWedge: string | null;
    afterWedge: string | null;
  }>({ beforeWedge: null, afterWedge: null });
  const { variables, id } = device;
  const [textBackerPos, setTextBackerPos] = useState<ITextBackerPos|undefined>(undefined);
  
  // Define uniqueVariables first so it can be used in the animation hook
  const uniqueVariables = useMemo(() => [...new Set(variables)], [variables]);
  const fontSize = useMemo(() => uniqueVariables.length >= 20 ? 6 : (uniqueVariables.length >= 10 ? 10 : 16), [uniqueVariables]);
  
  // calculate the location of all the variables
  const variableLocations = useMemo(() => uniqueVariables.reduce<Record<string,IVariableLocation>>((acc, variableName, index) => {
    const counts = variables.reduce((acc2, val) => {
      acc2[val] = (acc2[val] || 0) + 1;
      return acc2;
    }, {} as Record<string, number>);
    let lastPercent = 0;
    for (let i = 0; i < index; i++) {
      lastPercent += (counts[uniqueVariables[i]] / variables.length);
    }
    const currPercent = (counts[variableName] / variables.length);
    acc[variableName] = {lastPercent, currPercent};
    return acc;
  }, {}), [variables, uniqueVariables]);
  
  // Use our custom hook for spinner animation
  const spinnerAnimation = useSpinnerAnimation({
    deviceId: id,
    variableLocations
  });

  useEffect(() => {
    if (selectedVariableIdx !== null) {
      setSelectedWedge(variables[selectedVariableIdx]);
    } else {
      setSelectedWedge(null);
    }
  }, [variables, selectedVariableIdx]);

  // Reset dragging boundary state when dragging ends
  useEffect(() => {
    if (!isDragging) {
      setDraggingBoundary({ beforeWedge: null, afterWedge: null });
    }
  }, [isDragging]);

  const handleLabelClick = () => {
    if (isRunning) return;
    handleSetEditingVarName(0);
    handleSetSelectedVariable(0);
  };

  const handleBoundaryDrag = (originPt: {x: number; y: number;}, beforeWedgeIdx: number) => {
    // Get the wedge before and after the boundary
    const beforeWedge = uniqueVariables[beforeWedgeIdx];
    const afterWedge = uniqueVariables[(beforeWedgeIdx + 1) % uniqueVariables.length];
    
    setDraggingBoundary({
      beforeWedge,
      afterWedge
    });
    
    // Call the original handleStartDrag function
    handleStartDrag(originPt);
  };

  return (
    uniqueVariables.length === 1 ?
      <>
        <circle
          cx={kSpinnerX}
          cy={kSpinnerY}
          r={kSpinnerRadius}
          stroke="#000"
          strokeWidth={1}
          fill={getVariableColor(0, 0, false)}
        />
        {/* Safari does not support cursor styling or click handling on svg text elements so this invisible element that
            is drawn behind the text acts as the styling and click handler source */}
        <TextBacker pos={textBackerPos} isDragging={isDragging} onClick={handleLabelClick} />
        <text
          id={`${id}-wedge-label-${variables[0]}-0`}
          x={kSpinnerX}
          y={kSpinnerY}
          textAnchor="middle"
          dy=".25em"
          dx={getTextShift(variables[0], variables[0].length)}
          fill="#000"
          fontSize={fontSize}
          style={{ pointerEvents: "none"}}
          ref={updateTextBackerRefFn(setTextBackerPos)}
        >
          {variables[0]}
        </text>
      </> :
      <>
        {uniqueVariables.map((variableName, index) => {
          const varArrayIdx = variables.findIndex((v) => v === variableName);
          const {lastPercent, currPercent} = variableLocations[variableName];
          return (
            <Wedge
              key={`${variableName}-${index}`}
              deviceId={id}
              percent={currPercent}
              lastPercent={lastPercent}
              variableName={variableName}
              index={index}
              labelFontSize={fontSize}
              varArrayIdx={varArrayIdx}
              selectedWedge={selectedWedge}
              numUniqueVariables={uniqueVariables.length}
              nextVariable={uniqueVariables[index + 1]}
              isLastVariable={index === uniqueVariables.length - 1}
              isDragging={isDragging}
              isBoundaryBeingDragged={
                draggingBoundary.beforeWedge === variableName || 
                draggingBoundary.afterWedge === variableName
              }
              // Animation props
              isAnimating={spinnerAnimation.isAnimating}
              isAnimationTarget={spinnerAnimation.isAnimationTarget(variableName)}
              animationProgress={spinnerAnimation.animationProgress}
              handleAddDefs={handleAddDefs}
              handleSetSelectedVariable={handleSetSelectedVariable}
              handleSetEditingVarName={handleSetEditingVarName}
              handleSetEditingPct={handleSetEditingPct}
              handleDeleteWedge={handleDeleteWedge}
            />
          );
        })}
        {isDragging && <circle cx={kSpinnerX} cy={kSpinnerY} r={5} fill="#fff" />}
        {uniqueVariables.map((variableName, index) => {
          const varArrayIdx = variables.findIndex((v) => v === variableName);
          const {lastPercent, currPercent} = variableLocations[variableName];
          const isLastVariable = index === uniqueVariables.length - 1;
          return (
            <SeparatorLine
              key={`${id}-separator-line-${variableName}-${index}`}
              percent={currPercent}
              lastPercent={lastPercent}
              varArrayIdx={varArrayIdx}
              isDragging={isDragging}
              handleSetSelectedVariable={isLastVariable ? undefined : handleSetSelectedVariable}
              handleStartDrag={isLastVariable ? undefined : (originPt) => handleBoundaryDrag(originPt, index)}
            />
          );
        })}
        <Needle
          deviceId={id}
          variableLocations={variableLocations}
        />
      </>
    );
  };
