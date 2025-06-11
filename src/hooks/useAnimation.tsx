import { createContext, useContext, useEffect, useRef } from "react";
import { AnimationCallback, AnimationStep, IAnimationContext, IAnimationRuntime, IAnimationStepSettings, IExperimentResults, IExperimentAnimationResults, IModel, ISampleResults, Speed, ISampleVariableIndexes, AvailableDeviceVariableIndexes, ViewType } from "../types";
import { createItems, selectCases } from "@concord-consortium/codap-plugin-api";
import { useGlobalStateContext } from "./useGlobalState";
import { evaluateResult, findOrCreateDataContext, getNewExperimentInfo } from "../helpers/codap-helpers";
import { getDeviceById } from "../models/model-model";
import { formatFormula, parseFormula } from "../utils/utils";
import { computeExperimentHash, getExperimentDescription, modelHasSpinner } from "../helpers/model-helpers";
import { getVariables } from "../utils/formula-parser";
import { getCollectorAttrs, getCollectorFirstNameVariables, isCollectorOnlyModel, maybeRenameCollectorItem } from "../utils/collector";
import { evaluatePattern, isPattern } from "../utils/pattern";
import { getModelAttrs } from "../utils/model";

// maximum number of items to collect before stopping when the repeat until formula is not satisfied
const maxRepeatUntilItems = 1000;

const stepDurations: Partial<Record<AnimationStep["kind"], number>> = {
  "animateDevice": 1200,
  "showLabel": 1200,
  "animateArrow": 1200,
  "collectVariables": 1200,
  "pushVariables": 1200,
};

const stepsSkippedInFastMode: string[] = [
  "animateDevice",
  "showLabel",
  "animateArrow",
];
const instantStepsInFastMode: string[] = [
  "startSelectItem",
  "collectVariables",
  "endSelectItem",
  "pushVariables",
];

export const createExperimentAnimationSteps = (model: IModel, dataContextName: string, animationResults: IExperimentAnimationResults, results: IExperimentResults, replacement: boolean, onComplete?: () => void): Array<AnimationStep> => {
  let lastCaseIdsForFastestSpeed: number[] = [];
  const steps: AnimationStep[] = [];
  steps.push({ kind: "startExperiment", numSamples: animationResults.length });

  animationResults.forEach((sample, sampleIndex) => {
    steps.push({ kind: "startSample", sampleIndex, numItems: sample.length });

    sample.forEach((run) => {
      steps.push({ kind: "startSelectItem" });

      const deviceIds = Object.keys(run.results);
      const lastDeviceIdx = deviceIds.length - 1;
      const variables: string[] = [];

      deviceIds.forEach((deviceId, deviceIdx) => {
        const selectedVariable = run.results[deviceId];
        const selectedVariableIndex = run.resultsVariableIndex[deviceId];

        steps.push({ kind: "animateDevice", deviceId, selectedVariable, selectedVariableIndex, hideAfter: !replacement });

        const columnIndex = model.columns.findIndex(column => column.devices.find(device => device.id === deviceId));
        steps.push({ kind: "showLabel", columnIndex, selectedVariable });

        if (deviceIdx !== lastDeviceIdx) {
          steps.push({ kind: "animateArrow", sourceDeviceId: deviceIds[deviceIdx], targetDeviceId: deviceIds[deviceIdx + 1] });
        }

        variables.push(selectedVariable);
      });

      steps.push({ kind: "collectVariables", variables });

      steps.push({ kind: "endSelectItem", variables });
    });

    steps.push({
      kind: "pushVariables", onComplete: async (settings) => {
        if (sample.length > 0) {
          const sampleResults = results.filter((result) => result.sample === sample[0].sampleNumber);
          const createItemsResult = await createItems(dataContextName, sampleResults) as any;
          if (createItemsResult?.caseIDs) {
            // skip selecting cases if we are running at the fastest speed
            if (settings.speed !== Speed.Fastest) {
              await selectCases(dataContextName, createItemsResult.caseIDs);
            } else {
              // keep track of the last case IDs to select at the end of the experiment
              lastCaseIdsForFastestSpeed = createItemsResult.caseIDs;
            }
          }
        }
      }
    });
    steps.push({ kind: "endSample" });
  });

  steps.push({ kind: "endExperiment", onComplete: async () => {
    // select the last case IDs if we are running at the fastest speed
    if (lastCaseIdsForFastestSpeed.length > 0) {
      await selectCases(dataContextName, lastCaseIdsForFastestSpeed);
    }
    onComplete?.();
  }});

  return steps;
};

export const useAnimationContextValue = (): IAnimationContext => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed, attrMap, model, numSamples, sampleSize, dataContextName, repeat, untilFormula } = globalState;
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
  const stopAnimationAtRef = useRef<number>(0);

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
      const isCollector = currentDevice.viewType === ViewType.Collector;
      const variables = isCollector ? getCollectorFirstNameVariables(currentDevice.collectorVariables) : currentDevice.variables;
      const selectedVariable = variables[selectedIndex];

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
        try {
          const evaluationResult = await evaluateResult(formattedFormula, values);
          if (evaluationResult) {
            nextDeviceId = deviceId;
            break;
          }
        } catch (e) {
          throw new Error(`Error evaluating transition formula: ${formula}`);
        }
      }

      if (columnName) {
        if (isCollector) {
          const newOutputs = maybeRenameCollectorItem(currentDevice.collectorVariables[selectedIndex]);
          outputs = {...newOutputs};
          previousOutputs = {...newOutputs};
        } else {
          outputs[columnName] = selectedVariable;
          previousOutputs[columnName] = selectedVariable;
        }
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
    const endSampleNumber = startingSampleNumber + Number(numSamples);
    const counts = {
      totalSamples: 0,
      failedSamples: 0
    };
    const isCollector = isCollectorOnlyModel(model);

    for (let sampleIndex = startingSampleNumber; sampleIndex < endSampleNumber; sampleIndex++) {
      const sampleResultsForAnimation = [];
      const variableIndexes = model.columns.reduce<AvailableDeviceVariableIndexes>((acc, column) => {
        return column.devices.reduce<typeof acc>((acc2, device) => {
          if (isCollector) {
            acc2[device.id] = Object.keys(device.collectorVariables).map((_, index) => index);
          } else {
            acc2[device.id] = device.variables.map((_, index) => index);
          }
          return acc2;
        }, acc);
      }, {});

      const sampleSizeNum = Number(sampleSize);
      let itemIndex = 0;
      let doneSampling = repeat ? false : sampleSizeNum === 0;

      counts.totalSamples++;

      while (!doneSampling) {
        const sample: { [key: string]: string | number } = {};
        sample[attrMap.experiment.name] = experimentNum;
        sample[attrMap.sample.name] = sampleIndex;
        sample[attrMap.description.name] = getExperimentDescription(model, replacement);
        if (repeat) {
          sample[attrMap.until_formula.name] = untilFormula;
        } else {
          sample[attrMap.sample_size.name] = sampleSize && parseInt(sampleSize, 10);
        }
        sample[attrMap.experimentHash.name] = experimentHash;

        const { outputs, outputsForAnimation, resultsVariableIndex } = await getExperimentSample(variableIndexes);
        sampleResultsForAnimation.push({ sampleNumber: sampleIndex, results: outputsForAnimation, resultsVariableIndex });

        const outputKeys = Object.keys(outputs);
        doneSampling = outputKeys.length === 0;

        if (!doneSampling) {
          outputKeys.forEach(key => {
            sample[key] = outputs[key];
          });
          results.push(sample);

          itemIndex++;

          if (repeat) {
            if (isPattern(untilFormula)) {
              // this will throw a correctly formatted error message if the pattern is invalid
              doneSampling = evaluatePattern(untilFormula, outputs);
            } else {
              // must use try/catch here to customize the error message
              try {
                const evaluationResult = await evaluateResult(untilFormula, outputs);
                doneSampling = !!evaluationResult;
              } catch (e) {
                throw new Error(`Evaluating "until" formula: ${untilFormula}`);
              }
            }
            if (!doneSampling && (itemIndex >= maxRepeatUntilItems)) {
              counts.failedSamples++;
              doneSampling = true;
              continue;
            }
          } else {
            doneSampling = itemIndex >= sampleSizeNum;
          }
        }
      }

      animationResults.push(sampleResultsForAnimation);
    }

    if (counts.failedSamples > 0) {
      const message = counts.totalSamples === counts.failedSamples ? "All of the samples" : `${counts.failedSamples} of the ${counts.totalSamples} samples`;
      throw new Error(`Aborting! ${message} reached the maximum number of attempts (${maxRepeatUntilItems}) without satisfying the "formula for until" of "${untilFormula}"`);
    }

    return { results, animationResults };
  };

  const animate = (timestamp: number) => {
    let { stepIndex } = animationRef.current;
    const { mode, steps, lastTimestamp } = animationRef.current;

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

      // skip some steps in fast mode
      if (speedRef.current === Speed.Fast) {
        while (stepIndex < steps.length && stepsSkippedInFastMode.includes(steps[stepIndex].kind)) {
          stepIndex++;
        }
      }

      const step = steps[stepIndex];
      const stepDuration = stepDurations[step.kind] ?? 0;
      const currentSpeed = speedRef.current;
      const duration = stepDuration / (currentSpeed + 1);
      let t = (currentSpeed === Speed.Fastest) || (duration === 0) ? 1 : Math.min(elapsed / duration, 1);

      // instantly finish some steps in fast mode
      if ((speedRef.current === Speed.Fast) && instantStepsInFastMode.includes(step.kind)) {
        t = 1;
      }
      const settings: IAnimationStepSettings = { t, speed: currentSpeed };

      animationsCallbacksRef.current.forEach(callback => callback(step, settings));

      if (t >= 1) {
        step.onComplete?.(settings);
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
    stopAnimationAtRef.current = Date.now();
    cancelAnimationFrame(animationRef.current.frame);
  };

  const requestAnimation = () => {
    cancelAnimationFrame(animationRef.current.frame);

    // instantly finish all the steps if we start or change to fastest speed
    if (speedRef.current === Speed.Fastest) {
      const finish = async () => {
        const startedFinishAt = Date.now();
        const settings: IAnimationStepSettings = { t: 1, speed: Speed.Fastest };
        const endAnimations = () => animationsCallbacksRef.current.forEach(callback => callback({kind: "endExperiment"}, settings));

        // run through all the steps and call onComplete for each one
        while (animationRef.current.stepIndex < animationRef.current.steps.length) {
          const step = animationRef.current.steps[animationRef.current.stepIndex];
          await step.onComplete?.(settings);
          animationRef.current.stepIndex++;

          if (stopAnimationAtRef.current > startedFinishAt) {
            // if we were asked to stop while finishing, stop immediately
            break;
          }
        }

        endAnimations();
      };
      finish();
    } else {
      animationRef.current.frame = requestAnimationFrame(animate);
    }
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
      const isCollector = isCollectorOnlyModel(model);
      const attrNames = isCollector ? getCollectorAttrs(model) : getModelAttrs(model);
      const finalDataContextName = await findOrCreateDataContext(dataContextName, attrNames, attrMap, setGlobalState, repeat, isCollector, globalState.instance);
      if (!finalDataContextName) {
        alert("Unable to setup CODAP table");
        return;
      }

      setGlobalState(draft => {
        draft.dataContextName = finalDataContextName;
      });

      const experimentHash = await computeExperimentHash(globalState);
      const { experimentNum, startingSampleNumber } = await getNewExperimentInfo(finalDataContextName, experimentHash);

      const { results, animationResults } = await getAllExperimentSamples(experimentNum, startingSampleNumber, experimentHash);

      setGlobalState(draft => {
        draft.isRunning = true;
        draft.isPaused = false;
        draft.enableRunButton = false;
      });

      const onEndRun = () => {
        animationsCallbacksRef.current.forEach(callback => callback({ kind: "endExperiment" }));
        enableNewRun();
      };

      setGlobalState(draft => {
        draft.isPaused = false;
        draft.isRunning = true;
      });
      const newAnimationSteps = createExperimentAnimationSteps(model, finalDataContextName, animationResults, results, replacement, onEndRun);
      startAnimation(newAnimationSteps);
    } catch (e) {
      stopAnimation();
      enableNewRun();
      alert(e);
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
    animationsCallbacksRef.current.forEach(callback => callback({ kind: "endExperiment" }));
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
    animationsCallbacksRef.current.forEach(callback => callback({ kind: "modelChanged" }));
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

