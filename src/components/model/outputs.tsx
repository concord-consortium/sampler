import React, { useEffect, useMemo, useState } from "react";
import { AnimationStep, IAnimationStepSettings } from "../../types";
import { useAnimationContext } from "../../hooks/useAnimation";

import "./outputs.scss";

const maxInsideMargin = 30;
const maxOutsideMargin = 20;

const pulse = (t: number, max: number) => t <= 0.5 ? t * max : (1 - t) * max;

export const Outputs = () => {
  const { registerAnimationCallback } = useAnimationContext();
  const [ sampleIndex, setSampleIndex ] = useState(0);
  const [ numItems, setNumItems ] = useState(1);
  const [ tValue, setTValue ] = useState(1);
  const [ pushing, setPushing ] = useState(false);
  const [ variables, setVariables ] = useState<string[][]>([]);
  const [ animatedVariables, setAnimatedVariables ] = useState<string[]>([]);

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


  const showEmptyBracket = useMemo(() => (variables.length + animatedVariables.length) < numItems, [numItems, variables, animatedVariables]);
  const insidePushMargin = useMemo(() => pushing ? tValue * maxInsideMargin : 0, [tValue, pushing]);
  const insidePushOpacity = useMemo(() => pushing ? 1 - tValue : 1, [tValue, pushing]);
  const outsidePushMargin = useMemo(() => pushing ? pulse(tValue, maxOutsideMargin) : 0, [tValue, pushing]);
  const animatedVariablesOpacity = useMemo(() => animatedVariables.length > 0 ? tValue : 1, [tValue, animatedVariables]);

  const bracket = <div className="outputs-variable-bracket">[</div>;

  return (
    <div className="outputs">
      <div className="outputs-title">sample {sampleIndex + 1}</div>
      <div className="outputs-variables" style={{marginLeft: outsidePushMargin}}>
        {variables.map((variable, index) => (
          <div className="outputs-variable" key={index}>
            {bracket}<div style={{marginLeft: insidePushMargin, opacity: insidePushOpacity}}>{variable.join(", ")}</div>
          </div>
        ))}
        {animatedVariables.length > 0 && (
          <div className="outputs-variable" key="animated">
            {bracket}<div style={{opacity: animatedVariablesOpacity}}>{animatedVariables.join(", ")}</div>
          </div>
        )}
        {showEmptyBracket && <div className="outputs-variable" key="empty">{bracket}</div>}
      </div>
    </div>
  );
};
