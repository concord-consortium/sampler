import { createContext, useContext, useEffect, useRef } from "react";
import { AnimationCallback, AnimationStep, IAnimationContext, IAnimationRuntime, IAnimationStepSettings, IExperimentResults, IExperimentAnimationResults, IModel, ISampleResults, Speed, ISampleVariableIndexes, AvailableDeviceVariableIndexes } from "../types";
import { createItems, selectCases } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../contants";
import { useGlobalStateContext } from "./useGlobalState";
import { evaluateResult, findOrCreateDataContext, getNewExperimentInfo } from "../helpers/codap-helpers";
import { getDeviceById } from "../models/model-model";
import { formatFormula, parseFormula } from "../utils/utils";
import { computeExperimentHash, modelHasSpinner } from "../helpers/model-helpers";
import { getVariables } from "../utils/formula-parser";

const stepDurations: Partial<Record<AnimationStep["kind"], number>> = {
  "animateDevice": 1200,
  "showLabel": 1200,
  "animateArrow": 1200,
  "collectVariables": 1200,
  "pushVariables": 1200,
};

export const createExperimentAnimationSteps = (model: IModel, animationResults: IExperimentAnimationResults, results: IExperimentResults, replacement: boolean, onComplete?: () => void): Array<AnimationStep> => {
  const steps: AnimationStep[] = [];
  steps.push({kind: "startExperiment", numSamples: animationResults.length, numItems: animationResults[0]?.length ?? 0});

  animationResults.forEach((sample, sampleIndex) => {
    steps.push({kind: "startSample", sampleIndex});

    sample.forEach((run) => {
      steps.push({kind: "startSelectItem"});

      const deviceIds = Object.keys(run.results);
      const lastDeviceIdx = deviceIds.length - 1;
      const variables: string[] = [];

      deviceIds.forEach((deviceId, deviceIdx) => {
        const selectedVariable = run.results[deviceId];
        const selectedVariableIndex = run.resultsVariableIndex[deviceId];

        steps.push({ kind: "animateDevice", deviceId, selectedVariable, selectedVariableIndex, hideAfter: !replacement });

        const columnIndex = model.columns.findIndex(column => column.devices.find(device => device.id === deviceId));
        steps.push({kind: "showLabel", columnIndex, selectedVariable});

        if (deviceIdx !== lastDeviceIdx) {
          steps.push({kind: "animateArrow", sourceDeviceId: deviceIds[deviceIdx], targetDeviceId: deviceIds[deviceIdx + 1]});
        }

        variables.push(selectedVariable);
      });

      steps.push({kind: "collectVariables", variables});

      steps.push({kind: "endSelectItem", variables});
    });

    steps.push({kind: "pushVariables", onComplete: async () => {
      if (sample.length > 0) {
        const sampleResults = results.filter((result) => result.sample === sample[0].sampleNumber);
        const createItemsResult = await createItems(kDataContextName, sampleResults) as any;
        if (createItemsResult?.caseIDs) {
          await selectCases(kDataContextName, createItemsResult.caseIDs);
        }
      }
    }});
    steps.push({kind: "endSample"});
  });

  steps.push({kind: "endExperiment", onComplete});

  return steps;
};

export const useAnimationContextValue = (): IAnimationContext => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed, attrMap, model, numSamples, sampleSize } = globalState;
  // do not allow without replacement when there is a spinner
  const hasSpinner = modelHasSpinner(model);
  const replacement = globalState.replacement || hasSpinner;
  const animationRef = useRef<IAnimationRuntime>({
    frame: 0,
    steps: [],
    stepIndex: 0,
    mode: "stopped"
  });
  const animationsCallbacksRef = useRef<AnimationCallback[]>([]);
  const speedRef = useRef<Speed>(Speed.Slow);

  const getExperimentSample = async (variableIndexes: AvailableDeviceVariableIndexes) => {
    let currentDevice = model.columns[0].devices[0];
    let outputs: ISampleResults = {};
    let outputsForAnimation: ISampleResults = {};
    let previousOutputs: Record<string, any> = {};

    const resultsVariableIndex: ISampleVariableIndexes = {};

    while (currentDevice) {
      const availableVariableIndexes = variableIndexes[currentDevice.id];
      if (availableVariableIndexes.length === 0) {
        break;
      }

      const randomIndex = Math.floor(Math.random() * availableVariableIndexes.length);
      const selectedIndex = availableVariableIndexes[randomIndex];
      const selectedVariable = currentDevice.variables[selectedIndex];

      if (!replacement) {
        availableVariableIndexes.splice(randomIndex, 1);
      }

      let nextDeviceId: string | null = null;
      const columnName = model.columns.find(column => column.devices.find(device => device.id === currentDevice.id))?.name || "";

      for (const [deviceId, formula] of Object.entries(currentDevice.formulas)) {
        if (formula === "*") {
          nextDeviceId = deviceId;
          break;
        }

        const parsedFormula = parseFormula(formula, columnName);
        const neededVariables = getVariables(parsedFormula);

        const values = neededVariables.reduce((acc, variable) => {
          if (variable in previousOutputs) {
            acc[variable] = previousOutputs[variable];
          }
          return acc;
        }, { [columnName]: selectedVariable });

        const formattedFormula = formatFormula(formula, columnName, Object.keys(values));
        const evaluationResult = await evaluateResult(formattedFormula, values);
        if (evaluationResult) {
          nextDeviceId = deviceId;
          break;
        }
      }

      if (columnName) {
        outputs[columnName] = selectedVariable;
        previousOutputs[columnName] = selectedVariable;
        outputsForAnimation[currentDevice.id] = selectedVariable;
        resultsVariableIndex[currentDevice.id] = selectedIndex;
      }

      if (nextDeviceId) {
        const nextDevice = getDeviceById(model, nextDeviceId);
        if (!nextDevice) break;
        currentDevice = nextDevice;
      } else {
        break;
      }
    }

    return { outputs, outputsForAnimation, resultsVariableIndex };
  };

  const getAllExperimentSamples = async (experimentNum: number, startingSampleNumber: number, experimentHash: string) => {
    const results: IExperimentResults = [];
    const animationResults: IExperimentAnimationResults = [];
    const firstDevice = model.columns[0].devices[0];
    const endSampleNumber = startingSampleNumber + Number(numSamples);
    const numItems = firstDevice.variables.length;

    for (let sampleIndex = startingSampleNumber; sampleIndex < endSampleNumber; sampleIndex++) {
      const sampleResultsForAnimation = [];
      const variableIndexes = model.columns.reduce<AvailableDeviceVariableIndexes>((acc, column) => {
        return column.devices.reduce<typeof acc>((acc2, device) => {
          acc2[device.id] = device.variables.map((_, index) => index);
          return acc2;
        }, acc);
      }, {});

      for (let i = 0; i < Number(sampleSize); i++) {
        const sample: { [key: string]: string | number } = {};
        sample[attrMap.experiment.name] = experimentNum;
        sample[attrMap.sample.name] = sampleIndex;
        const deviceStr = firstDevice.viewType.charAt(0).toUpperCase() + firstDevice.viewType.slice(1);
        sample[attrMap.description.name] = `${deviceStr} containing ${numItems} items${replacement ? " (with replacement)" : ""}`;
        sample[attrMap.sample_size.name] = sampleSize && parseInt(sampleSize, 10);
        sample[attrMap.experimentHash.name] = experimentHash;

        const { outputs, outputsForAnimation, resultsVariableIndex } = await getExperimentSample(variableIndexes);
        sampleResultsForAnimation.push({ sampleNumber: sampleIndex, results: outputsForAnimation, resultsVariableIndex });

        const outputKeys = Object.keys(outputs);
        if (outputKeys.length > 0) {
          outputKeys.forEach(key => {
            sample[key] = outputs[key];
          });
          results.push(sample);
        } else {
          break;
        }
      }
      animationResults.push(sampleResultsForAnimation);
    }

    return { results, animationResults };
  };

  const animate = (timestamp: number) => {
    const { mode, steps, stepIndex, lastTimestamp } = animationRef.current;

    animationRef.current.lastTimestamp = timestamp;

    // nothing to do when stopped, including requesting another animation
    if (mode === "stopped") {
      return;
    }

    if (mode === "running") {
      let elapsed = animationRef.current.elapsed ?? 0;
      if (lastTimestamp) {
        elapsed += timestamp - lastTimestamp;
      }
      animationRef.current.elapsed = elapsed;

      const step = steps[stepIndex];
      const stepDuration = stepDurations[step.kind] ?? 0;
      const currentSpeed = speedRef.current;
      const duration = stepDuration / (currentSpeed + 1);
      const t = (currentSpeed === Speed.Fastest) || (duration === 0) ? 1 : Math.min(elapsed / duration, 1);
      const settings: IAnimationStepSettings = {t, speed: currentSpeed};

      animationsCallbacksRef.current.forEach(callback => callback(step, settings));

      if (t >= 1) {
        step.onComplete?.();
        animationRef.current.elapsed = undefined;
        animationRef.current.lastTimestamp = undefined;
        animationRef.current.stepIndex++;
      }
    }

    if (animationRef.current.stepIndex < animationRef.current.steps.length) {
      requestAnimation();
    }
  };

  const startAnimation = (newAnimationSteps: AnimationStep[]) => {
    animationRef.current = {
      frame: 0,
      steps: newAnimationSteps,
      stepIndex: 0,
      mode: "running"
    };
    requestAnimation();
  };

  const togglePauseAnimation = (pause: boolean) => {
    animationRef.current.mode = pause ? "paused" : "running";
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationRef.current.frame);
  };

  const requestAnimation = () => {
    cancelAnimationFrame(animationRef.current.frame);
    animationRef.current.frame = requestAnimationFrame(animate);
  };

  const enableNewRun = () => {
    setGlobalState(draft => {
      draft.isRunning = false;
      draft.isPaused = false;
      draft.enableRunButton = true;
    });
  };

  const handleStartRun = async () => {
    try {
      const attrNames = model.columns.map(column => column.name);
      const result = await findOrCreateDataContext(attrNames, attrMap, setGlobalState);
      if (!result) {
        alert("Unable to setup CODAP table");
        return;
      }

      const experimentHash = await computeExperimentHash(globalState);
      const {experimentNum, startingSampleNumber} = await getNewExperimentInfo(experimentHash);

      const { results, animationResults } = await getAllExperimentSamples(experimentNum, startingSampleNumber, experimentHash);

      setGlobalState(draft => {
        draft.isRunning = true;
        draft.isPaused = false;
        draft.enableRunButton = false;
      });

      const onEndRun = () => {
        animationsCallbacksRef.current.forEach(callback => callback({kind: "endExperiment"}));
        enableNewRun();
      };

      setGlobalState(draft => {
        draft.isPaused = false;
        draft.isRunning = true;
      });
      const newAnimationSteps = createExperimentAnimationSteps(model, animationResults, results, replacement, onEndRun);
      startAnimation(newAnimationSteps);
    } catch (e) {
      stopAnimation();
      enableNewRun();
      console.log(e);
      alert("Error running model! Please check your formulas.");
    }
  };

  const handleTogglePauseRun = async (pause: boolean) => {
    togglePauseAnimation(pause);
    setGlobalState(draft => {
      draft.isPaused = pause;
    });
  };

  const handleStopRun = async () => {
    stopAnimation();
    animationsCallbacksRef.current.forEach(callback => callback({kind: "endExperiment"}));
    enableNewRun();
  };

  const registerAnimationCallback = (animationCallback: AnimationCallback) => {
    animationsCallbacksRef.current.push(animationCallback);

    return () => {
      animationsCallbacksRef.current.splice(animationsCallbacksRef.current.indexOf(animationCallback), 1);
    };
  };

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    // whenever the model changes re-render
    animationsCallbacksRef.current.forEach(callback => callback({kind: "modelChanged"}));
  }, [model]);

  return {
    handleStartRun,
    handleTogglePauseRun,
    handleStopRun,
    registerAnimationCallback
  };
};

export const AnimationContext = createContext<IAnimationContext>({
  handleStartRun: () => Promise.resolve(),
  handleTogglePauseRun: (pause: boolean) => Promise.resolve(),
  handleStopRun: () => Promise.resolve(),
  registerAnimationCallback: () => () => undefined
});
export const useAnimationContext = () => useContext(AnimationContext);

