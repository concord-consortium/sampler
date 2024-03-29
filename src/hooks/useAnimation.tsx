import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimationStep, ArrowAnimationStep, DeviceAnimationStep, FinalAnimationStep, IExperimentResults, IExperimentResultsForAnimation, Speed } from "../types";
import { createItems } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../contants";
import { useGlobalStateContext } from "./useGlobalState";

export const createAnimationSteps = (animationResults: IExperimentResultsForAnimation, results: IExperimentResults, speed: Speed, onComplete: () => void): Array<AnimationStep> => {
  const steps = animationResults.reduce<Array<AnimationStep>>((acc, sample) => {
    return sample.reduce<Array<AnimationStep>>((acc2, run, runIndex) => {
      return Object.keys(run.results).reduce((acc3, id, deviceIdx) => {
        const isLastStepInSampleRun = runIndex === sample.length - 1 && deviceIdx === Object.keys(run.results).length - 1;
        const selectedVariable = run.results[id];
        const deviceAnimationStep: AnimationStep = {kind: "device", selectedVariable, id};

        if (isLastStepInSampleRun) {
          const onSampleComplete = async () => {
            const sampleResults = results.filter((result) => result.sample === run.sampleNumber);
            await createItems(kDataContextName, sampleResults);
          };
          deviceAnimationStep.onComplete = onSampleComplete;
        }

        acc3.push(deviceAnimationStep);
        return acc3;
      }, acc2);
    }, acc);
  }, []);
  steps.push({kind: "final", onComplete});
  return steps;
};

export interface IAnimationContext {
  deviceAnimationStep?: DeviceAnimationStep,
  arrowAnimationStep?: ArrowAnimationStep,
  finalAnimationStep?: FinalAnimationStep,
  setAnimationSteps: React.Dispatch<React.SetStateAction<AnimationStep[]>>
}


export const useAnimationContextValue = () : IAnimationContext => {
  const {globalState: {speed}} = useGlobalStateContext();
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const animationTimeoutRef = useRef<number>();

  const animationTimeout = useCallback(async () => {
    if (animationSteps.length === 0) {
      return;
    }
    const {onComplete} = animationSteps[0];
    if (onComplete) {
      await onComplete();
    }

    const newAnimationSteps = [...animationSteps];
    newAnimationSteps.shift();

    setAnimationSteps(newAnimationSteps);
  }, [animationSteps]);


  useEffect(() => {
    if (animationSteps.length === 0) {
      return;
    }
    const timeout = speed === Speed.Fastest ? 0 : 1200 / (speed + 1);
    clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(animationTimeout, timeout);
  }, [animationSteps, animationTimeout, speed]);

  if (animationSteps.length === 0) {
    return {
      deviceAnimationStep: undefined,
      arrowAnimationStep: undefined,
      finalAnimationStep: undefined,
      setAnimationSteps
    };
  }

  const currentAnimationStep = animationSteps[0];

  return {
    deviceAnimationStep: currentAnimationStep.kind === "device" ? currentAnimationStep : undefined,
    arrowAnimationStep: currentAnimationStep.kind === "arrow" ? currentAnimationStep : undefined,
    finalAnimationStep: currentAnimationStep.kind === "final" ? currentAnimationStep : undefined,
    setAnimationSteps
  };
};

export const AnimationContext = createContext<IAnimationContext>({setAnimationSteps: () => undefined});
export const useAnimationContext = () => useContext(AnimationContext);

