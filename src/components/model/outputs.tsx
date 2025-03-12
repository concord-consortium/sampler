import React, { useEffect, useMemo, useState } from "react";
import { AnimationStep, IAnimationStepSettings } from "../../types";
import { useAnimationContext } from "../../hooks/useAnimation";
import { useGlobalStateContext } from "../../hooks/useGlobalState";

import "./outputs.scss";

const maxInsideMargin = 30;
const maxOutsideMargin = 20;

const pulse = (t: number, max: number) => t <= 0.5 ? t * max : (1 - t) * max;

export const Outputs = () => {
  const { registerAnimationCallback } = useAnimationContext();
  const { globalState } = useGlobalStateContext();
  const { isRunning, sampleSize } = globalState;
  const [ sampleIndex, setSampleIndex ] = useState(0);
  const [ numItems, setNumItems ] = useState(1);
  const [ tValue, setTValue ] = useState(1);
  const [ pushing, setPushing ] = useState(false);
  const [ variables, setVariables ] = useState<string[][]>([]);
  const [ animatedVariables, setAnimatedVariables ] = useState<string[]>([]);
  
  // Parse sampleSize to determine how many placeholder brackets to display
  const parsedSampleSize = useMemo(() => {
    const parsed = parseInt(sampleSize, 10);
    return isNaN(parsed) ? 1 : parsed;
  }, [sampleSize]);

  const animate = (step: AnimationStep, settings?: IAnimationStepSettings) => {
    const { kind } = step;
    const t = settings?.t ?? 1;

    setTValue(t);

    if (kind === "collectVariables") {
      setAnimatedVariables(step.variables);
    } else if (kind === "pushVariables") {
      setPushing(true);
    } else if (t === 1) {
      setPushing(false);
      if (kind === "startExperiment") {
        setSampleIndex(0);
        setNumItems(step.numItems);
      } else if (kind === "startSample") {
        setVariables([]);
        setAnimatedVariables([]);
        setSampleIndex(step.sampleIndex);
      } else if (kind === "endSelectItem") {
        setVariables(prev => [...prev, step.variables]);
        setAnimatedVariables([]);
      } else if (kind === "endSample") {
        setVariables([]);
      } else if (kind === "endExperiment") {
        setSampleIndex(0);
        setVariables([]);
        setNumItems(1);
        setAnimatedVariables([]);
      }
    }
  };

  useEffect(() => {
    return registerAnimationCallback(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update numItems when sampleSize changes
  useEffect(() => {
    if (!isRunning) {
      setNumItems(parsedSampleSize);
    }
  }, [parsedSampleSize, isRunning]);

  // Calculate how many empty brackets to show
  const emptyBracketsCount = useMemo(() => {
    // When not running, show placeholders based on sampleSize
    if (!isRunning) {
      return parsedSampleSize;
    }
    // When running, show remaining placeholders based on numItems and current variables
    return Math.max(0, numItems - variables.length - (animatedVariables.length > 0 ? 1 : 0));
  }, [isRunning, parsedSampleSize, numItems, variables.length, animatedVariables.length]);

  const insidePushMargin = useMemo(() => pushing ? tValue * maxInsideMargin : 0, [tValue, pushing]);
  const insidePushOpacity = useMemo(() => pushing ? 1 - tValue : 1, [tValue, pushing]);
  const outsidePushMargin = useMemo(() => pushing ? pulse(tValue, maxOutsideMargin) : 0, [tValue, pushing]);
  const animatedVariablesOpacity = useMemo(() => animatedVariables.length > 0 ? tValue : 1, [tValue, animatedVariables]);

  const bracket = <div className="outputs-variable-bracket">[</div>;

  return (
    <div 
      className="outputs"
      role="region"
      aria-label="Model outputs"
    >
      <div 
        className="outputs-title"
        id="outputs-title"
      >
        sample {sampleIndex + 1}
      </div>
      <div 
        className="outputs-variables" 
        style={{marginLeft: outsidePushMargin}}
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {variables.map((variable, index) => (
          <div 
            className="outputs-variable" 
            key={`filled-${index}`}
            aria-label={`Variable ${variable.join(", ")}`}
          >
            {bracket}
            <div 
              style={{marginLeft: insidePushMargin, opacity: insidePushOpacity}}
              aria-live="polite"
            >
              {variable.join(", ")}
            </div>
          </div>
        ))}
        {animatedVariables.length > 0 && (
          <div 
            className="outputs-variable" 
            key="animated"
            aria-label={`Animated variable ${animatedVariables.join(", ")}`}
          >
            {bracket}
            <div 
              style={{opacity: animatedVariablesOpacity}}
              aria-live="polite"
            >
              {animatedVariables.join(", ")}
            </div>
          </div>
        )}
        {/* Display empty placeholder brackets */}
        {Array.from({ length: emptyBracketsCount }).map((_, index) => (
          <div 
            className="outputs-variable" 
            key={`empty-${index}`}
            aria-label="Empty output placeholder"
          >
            {bracket}
          </div>
        ))}
      </div>
    </div>
  );
};
