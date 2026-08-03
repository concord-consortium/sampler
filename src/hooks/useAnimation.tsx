import { createContext, useContext, useEffect, useRef } from "react";
import { AnimationCallback, AnimationStep, IAnimationContext, IAnimationRuntime, IAnimationStepSettings, IExperimentResults, IExperimentAnimationResults, IModel, ISampleResults, Speed, ISampleVariableIndexes, AvailableDeviceVariableIndexes, ViewType } from "../types";
import { createItems, getCaseByIndex, getCaseCount, selectCases } from "@concord-consortium/codap-plugin-api";
import { useGlobalStateContext } from "./useGlobalState";
import { evaluateResult, findOrCreateDataContext, getCollectionNames, getNewExperimentInfo, tryRequest } from "../helpers/codap-helpers";
import { getDeviceById } from "../models/model-model";
import { formatFormula, parseFormula } from "../utils/utils";
import { computeExperimentHash, getExperimentDescription, isSingleDeviceReplacement } from "../helpers/model-helpers";
import { getVariables } from "../utils/formula-parser";
import { getCollectorAttrs, getCollectorFirstNameVariables, isCollectorOnlyModel, maybeRenameCollectorItem } from "../utils/collector";
import { evaluatePattern, isPattern } from "../utils/pattern";
import { getModelAttrs } from "../utils/model";
import { evaluateUniqueValues } from "../utils/unique-values";
import { tr } from "../utils/localeManager";

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

export const createExperimentAnimationSteps = (model: IModel, dataContextName: string, animationResults: IExperimentAnimationResults, results: IExperimentResults, onComplete?: () => void, isCurrentRun: () => boolean = () => true): Array<AnimationStep> => {
  const steps: AnimationStep[] = [];
  const finalSampleResults: ISampleResults[][] = [];

  const devicesById = model.columns.reduce<Record<string, IModel["columns"][number]["devices"][number]>>((acc, column) => {
    column.devices.forEach(device => {
      acc[device.id] = device;
    });
    return acc;
  }, {});

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
        const replacement = devicesById[deviceId].replacement;

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
          const sampleAttr = tr("DG.Plugin.Sampler.dataset.attr-sample") || "sample";
          const sampleResults = results.filter((result) => result[sampleAttr] === sample[0].sampleNumber);
          if (settings.speed === Speed.Fastest) {
            // in fastest mode the samples are created at the end of the experiment
            finalSampleResults.push(sampleResults);
          } else {
            // A request that outlives the response deadline must not abort the animation — the
            // samples after this one still need collecting.
            const createItemsResult =
              await tryRequest(() => createItems(dataContextName, sampleResults)) as any;
            if (createItemsResult?.caseIDs) {
              await tryRequest(() => selectCases(dataContextName, createItemsResult.caseIDs));
            }
          }
        }
      }
    });
    steps.push({ kind: "endSample" });
  });

  steps.push({ kind: "endExperiment", onComplete: async () => {
    // Requests go through tryRequest so a slow one costs at most its own result rather than the
    // steps after it, and onComplete runs from a finally, so the experiment always reports itself
    // finished and the controls are never left mid-run.
    try {
      // in fastest mode the samples are created at the end of the experiment
      if (finalSampleResults.length > 0) {
        const mergedFinalSampleResults: ISampleResults[] = [];
        for (const sampleResults of finalSampleResults) {
          mergedFinalSampleResults.push(...sampleResults);
        }

        // A sample can be animated without producing any rows — a device with no variables
        // collects nothing — and creating no items succeeds without adding anything. There is
        // then no sample just collected, so there is nothing to select and nothing to scroll to.
        if (mergedFinalSampleResults.length === 0) {
          return;
        }

        // The whole experiment goes over in one request. CODAP prices a create by the size of the
        // dataset it is added to rather than by the number of items sent, so each additional
        // request costs about as much as the first however little it carries.
        const created = await tryRequest(() => createItems(dataContextName, mergedFinalSampleResults));

        // Samples are appended in order, so the sample collection's last case is the one just
        // collected. Select the case rather than its items: CODAP resolves the ids it is given
        // against each collection's rows, and naming the case is what scrolls the table to it and
        // cascades that scroll to its children. Reading the case back costs far less than
        // arranging for the create to report it.
        //
        // Only once the create is known to have landed, though. Otherwise the last case may belong
        // to an earlier experiment, and highlighting it would claim it is the sample just
        // collected. Selecting nothing says nothing; selecting the wrong row misleads. A refused
        // create resolves with success false rather than rejecting, so the request has to be asked
        // whether it worked, not merely whether it answered.
        if (created?.success) {
          const sampleCollectionName = getCollectionNames().samples;
          const caseCountResult =
            await tryRequest(() => getCaseCount(dataContextName, sampleCollectionName)) as any;
          const sampleCount = caseCountResult?.values;
          if (typeof sampleCount === "number" && sampleCount > 0) {
            const lastCaseResult = await tryRequest(
              () => getCaseByIndex(dataContextName, sampleCollectionName, sampleCount - 1)) as any;
            const lastSampleCaseId = lastCaseResult?.values?.case?.id;
            if (lastSampleCaseId != null) {
              await tryRequest(() => selectCases(dataContextName, [lastSampleCaseId]));
            }
          }
        }
      }
    } finally {
      onComplete?.();
    }
  }});

  return steps;
};

export const useAnimationContextValue = (): IAnimationContext => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed, attrMap, model, numSamples, sampleSize, dataContextName, repeat, untilFormula, repeatCondition, repeatNumUniqueValues } = globalState;
  const animationRef = useRef<IAnimationRuntime>({
    frame: 0,
    steps: [],
    stepIndex: 0,
    mode: "stopped"
  });
  const animationsCallbacksRef = useRef<AnimationCallback[]>([]);
  const speedRef = useRef<Speed>(Speed.Slow);
  const stopAnimationAtRef = useRef<number>(0);
  // A run is set up before it animates, so the controls act on it while there is no animation to
  // act on. These record what the user asked for during the setup so the run can honor it once it
  // has something to animate: the id identifies the run still wanted, and the pause flag whether
  // it should begin paused.
  const runIdRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  // set once the run enters the single pass that finishes it, which nothing can pause part-way
  const uninterruptibleRunRef = useRef<boolean>(false);
  const globalReplacement = isSingleDeviceReplacement(model);

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

      if (!currentDevice.replacement) {
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

      const accumulatedOutputs: ISampleResults[] = [];

      while (!doneSampling) {
        const sample: { [key: string]: string | number } = {};
        sample[attrMap.experiment.name] = experimentNum;
        sample[attrMap.sample.name] = sampleIndex;
        sample[attrMap.description.name] = getExperimentDescription(model, globalReplacement);
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

        accumulatedOutputs.push(outputs);

        if (!doneSampling) {
          outputKeys.forEach(key => {
            sample[key] = outputs[key];
          });
          results.push(sample);

          itemIndex++;

          if (repeat) {
            switch (repeatCondition) {
              case "expressionOrPattern":
                if (isPattern(untilFormula)) {
                  // this will throw a correctly formatted error message if the pattern is invalid
                  doneSampling = evaluatePattern(untilFormula, accumulatedOutputs);
                } else {
                  // must use try/catch here to customize the error message
                  try {
                    const evaluationResult = await evaluateResult(untilFormula, outputs);
                    doneSampling = !!evaluationResult;
                  } catch (e) {
                    throw new Error(`Evaluating "until" formula: ${untilFormula}`);
                  }
                }
                break;

              case "uniqueValues":
                doneSampling = evaluateUniqueValues(repeatNumUniqueValues, accumulatedOutputs);
                break;
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
      let suffix = "";
      switch (repeatCondition) {
        case "expressionOrPattern":
          suffix = `"${untilFormula}"`;
          break;
        case "uniqueValues":
          suffix = `${repeatNumUniqueValues} unique values`;
          break;
      }
      throw new Error(`Aborting! ${message} reached the maximum number of attempts (${maxRepeatUntilItems}) without satisfying the "formula for until" of ${suffix}`);
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
    uninterruptibleRunRef.current = false;
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
      // this pass runs to the end of the experiment whatever the speed does from here, so the
      // controls have to know that pausing can no longer reach it
      uninterruptibleRunRef.current = true;
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
    isPausedRef.current = false;
    uninterruptibleRunRef.current = false;
    setGlobalState(draft => {
      draft.isRunning = false;
      draft.isPaused = false;
      draft.enableRunButton = true;
    });
  };

  const handleStartRun = async () => {
    // Mark the run as under way before issuing any request. Setting up the data context and
    // collecting the samples takes many round-trips to CODAP — seconds, on a large experiment —
    // and until this lands the controls still invite the user to start a run that is already
    // running, with nothing to show that anything is happening.
    const runId = ++runIdRef.current;
    isPausedRef.current = false;
    setGlobalState(draft => {
      draft.isRunning = true;
      draft.isPaused = false;
      draft.enableRunButton = false;
    });

    // The run being set up is only still wanted while it is the most recent one requested: stopping
    // it, or starting another, leaves it to abandon itself, since there is no animation yet for
    // those to act on.
    const isCurrentRun = () => runIdRef.current === runId;

    try {
      const isCollector = isCollectorOnlyModel(model);
      const attrNames = isCollector ? getCollectorAttrs(model) : getModelAttrs(model);
      const finalDataContextName = await findOrCreateDataContext(dataContextName, attrNames, attrMap, setGlobalState, repeat, isCollector, globalState.instance, true);
      if (!isCurrentRun()) {
        return;
      }
      if (!finalDataContextName) {
        enableNewRun();
        alert("Unable to setup CODAP table");
        return;
      }

      setGlobalState(draft => {
        draft.dataContextName = finalDataContextName;
      });

      const experimentHash = await computeExperimentHash(globalState);
      const { experimentNum, startingSampleNumber } = await getNewExperimentInfo(finalDataContextName, experimentHash);

      const { results, animationResults } = await getAllExperimentSamples(experimentNum, startingSampleNumber, experimentHash);
      if (!isCurrentRun()) {
        return;
      }

      const onEndRun = () => {
        // The steps hold on to this, and a request they are waiting on can settle long after the
        // run was stopped or replaced. Ending a run that is no longer the one under way would
        // hand its controls back over a run that is still going.
        if (!isCurrentRun()) {
          return;
        }
        animationsCallbacksRef.current.forEach(callback => callback({ kind: "endExperiment" }));
        enableNewRun();
      };

      const newAnimationSteps = createExperimentAnimationSteps(model, finalDataContextName, animationResults, results, onEndRun);
      startAnimation(newAnimationSteps);
      // startAnimation runs whatever it is given, so a pause requested during the setup has to be
      // re-applied to the animation it just replaced — unless the run has reached the fastest
      // speed in the meantime, where it runs in one pass that no pause can reach. Carrying the
      // pause over there would leave the controls offering to resume a run already under way.
      if (isPausedRef.current) {
        if (speedRef.current === Speed.Fastest) {
          isPausedRef.current = false;
          setGlobalState(draft => {
            draft.isPaused = false;
          });
        } else {
          togglePauseAnimation(true);
        }
      }
    } catch (e) {
      if (!isCurrentRun()) {
        console.warn("Sampler: abandoned run failed to start:", e);
        return;
      }
      stopAnimation();
      enableNewRun();
      // The run's own failures — an until formula that cannot be evaluated, samples that never
      // satisfied it — carry a message written for the user. Anything else is a rejection string
      // written for a developer, which belongs in the console.
      console.warn("Sampler: could not run the experiment:", e);
      alert(e instanceof Error ? e.message : "Unable to run the experiment. Please try again.");
    }
  };

  const handleTogglePauseRun = async (pause: boolean) => {
    isPausedRef.current = pause;
    togglePauseAnimation(pause);
    setGlobalState(draft => {
      draft.isPaused = pause;
    });
  };

  const handleStopRun = async () => {
    // Abandon a run that is still being set up; stopAnimation only reaches one that is animating.
    runIdRef.current++;
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
    isRunUninterruptible: () => uninterruptibleRunRef.current,
    registerAnimationCallback
  };
};

export const AnimationContext = createContext<IAnimationContext>({
  handleStartRun: () => Promise.resolve(),
  handleTogglePauseRun: (pause: boolean) => Promise.resolve(),
  handleStopRun: () => Promise.resolve(),
  isRunUninterruptible: () => false,
  registerAnimationCallback: () => () => undefined
});
export const useAnimationContext = () => useContext(AnimationContext);

