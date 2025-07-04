import React, { useMemo } from "react";
import { SpeedSlider } from "./model-speed-slider";
import WithReplacementIcon from "../../assets/with-replacement-icon.svg";
import WithoutReplacementIcon from "../../assets/without-replacement-icon.svg";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { deleteAllItems, deleteItemAttrs, findOrCreateDataContext, getItemAttrs } from "../../helpers/codap-helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { isRunButtonEnabled, modelHasSpinner } from "../../helpers/model-helpers";
import { getCollectorAttrs, isCollectorOnlyModel } from "../../utils/collector";
import { getModelAttrs } from "../../utils/model";
import { RepeatUntilModal } from "./repeat-until-modal";
import { CustomSelect, CustomSelectOption } from "../common/custom-select";
import { tr } from "../../utils/localeManager";

const startLabel = tr("DG.Plugin.Sampler.top-bar.run");
const startTip = tr("DG.Plugin.Sampler.tooltip.start-sampling");
const pauseLabel = tr("DG.Plugin.Sampler.top-bar.pause");
const pauseTip = tr("DG.Plugin.Sampler.tooltip.pause-sampling");
const stopLabel = tr("DG.Plugin.Sampler.top-bar.stop");
const stopTip = tr("DG.Plugin.Sampler.tooltip.stop-sampling");
const clearDataLabel = tr("DG.Plugin.Sampler.reset-text");
const selectLabel = tr("DG.Plugin.Sampler.draw-settings.select-items-p1");
const itemsLabel = tr("DG.Plugin.Sampler.draw-settings.select-items-p2");
const repeatLabel = tr("DG.Plugin.Sampler.draw-settings.repeat-items-p1");
const selectingItemsLabel = tr("DG.Plugin.Sampler.draw-settings.repeat-items-p2");
const withReplacementLabel = tr("DG.Plugin.Sampler.selection-options.with-replacement");
const withoutReplacementLabel = tr("DG.Plugin.Sampler.selection-options.without-replacement");
const replacementPerDeviceLabel = tr("DG.Plugin.Sampler.selection-options.replacement-per-device");
const collectLabel = tr("DG.Plugin.Sampler.draw-settings.collect-samples-p1");
const samplesLabel = tr("DG.Plugin.Sampler.draw-settings.collect-samples-p2");

interface IProps {
  showRepeatUntil: boolean;
  isWide: boolean;
  setShowRepeatUntil: (value: boolean) => void
}

export const ModelHeader = (props: IProps) => {
  const { showRepeatUntil, isWide, setShowRepeatUntil } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, sampleSize, numSamples, enableRunButton, isRunning, isPaused, model, dataContextName, untilFormula, attrMap, repeatCondition, repeatNumUniqueValues } = globalState;
  const { handleStartRun, handleTogglePauseRun, handleStopRun } = useAnimationContext();
  const startToggleDisabled = !isRunning && !enableRunButton;

  const numDevices = useMemo(() => model.columns.reduce<number>((acc, column) => acc + column.devices.length, 0), [model]);
  const multipleDevices = useMemo(() => numDevices > 1, [numDevices]);
  const firstDevice = useMemo(() => model.columns[0].devices[0], [model]);
  const hasSpinner = useMemo(() => modelHasSpinner(model), [model]);
  const replacementValue = useMemo(() => {
    if (multipleDevices) {
      return "multiple";
    }
    if (firstDevice.viewType === "spinner") {
      return "with";
    }
    return firstDevice.replacement ? "with" : "without";
  }, [multipleDevices, firstDevice.viewType, firstDevice.replacement]);
  const allowReplacement = useMemo(() => !multipleDevices && !hasSpinner, [multipleDevices, hasSpinner]);

  const replacementOptions = useMemo(() => {
    const options: CustomSelectOption[] = [
      { value: "with", label: withReplacementLabel, icon: <WithReplacementIcon /> },
      { value: "without", label: withoutReplacementLabel, icon: <WithoutReplacementIcon /> }
    ];
    if (multipleDevices) {
      options.unshift({ value: "multiple", label: replacementPerDeviceLabel });
    }
    return options;
  }, [multipleDevices]);

  const handleToggleRun = () => {
    if (isRunning) {
      handleTogglePauseRun(!isPaused);
    } else {
      handleStartRun();
    }
  };

  const handleClearData = () => {
    const deleteItems = async () => {
      try {
        const isCollector = isCollectorOnlyModel(model);
        const existingAttrs = await getItemAttrs(dataContextName, { excludeFormulas: true});

        let newAttrs: string[] = [];
        if (isCollector) {
          newAttrs = getCollectorAttrs(model);
        } else {
          newAttrs = getModelAttrs(model);
        }
        const attrsToDelete = existingAttrs.filter(attr => !newAttrs.includes(attr));

        await deleteAllItems(dataContextName);
        await findOrCreateDataContext(dataContextName, newAttrs, attrMap, setGlobalState, repeat, isCollector, globalState.instance, false);
        await deleteItemAttrs(dataContextName, attrsToDelete);

      } catch (e) {
        console.error(e);
      }
    };

    deleteItems();
  };

  const handleSelectRepeat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalState(draft => {
      draft.repeat = e.target.value === "repeat";
      draft.enableRunButton = isRunButtonEnabled(draft);
    });
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      if (e.target.value !== null && Number(e.target.value)) {
        draft.enableRunButton = true;
      } else {
        draft.enableRunButton = false;
      }
      draft.sampleSize = e.target.value;
    });
  };

  const handleSelectReplacement = (value: string) => {
    setGlobalState(draft => {
      draft.model.columns[0].devices[0].replacement = value === "with";
    });
  };

  const handleNumSamplesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      if (e.target.value !== null && Number(e.target.value)) {
        draft.enableRunButton = true;
      } else {
        draft.enableRunButton = false;
      }
      draft.numSamples = e.target.value;
    });
  };

  const handleShowRepeatUntil = () => {
    setShowRepeatUntil(true);
  };

  const repeatUntilDisplay = useMemo(() => {
    switch (repeatCondition) {
      case "expressionOrPattern":
        return untilFormula.trim();
      case "uniqueValues":
        return `uniqueValues() = ${repeatNumUniqueValues}`;
      default:
        return "";
    }
  }, [repeatCondition, repeatNumUniqueValues, untilFormula]);

  const clearDataButtonDisabled = isRunning || dataContextName === "";

  return (
    <div className="model-header">
      <div className="model-controls">
        <div className="inner-controls">
          <button disabled={startToggleDisabled} className={`start-button ${startToggleDisabled ? "disabled" : ""}`}
                  title={isRunning ? (isPaused ? startTip : pauseTip) : startTip}
                  onClick={handleToggleRun}>
            {isRunning ? (isPaused ? startLabel : pauseLabel) : startLabel}
          </button>
          <button disabled={!isRunning} className={`stop-button ${!isRunning ? "disabled" : ""}`}
                  title={stopTip} onClick={handleStopRun}>
            {stopLabel}
          </button>
          <SpeedSlider />
          <button disabled={clearDataButtonDisabled} title={tr("DG.Plugin.Sampler.tooltip.clear-data")}
                  className={`clear-data-button ${clearDataButtonDisabled ? "disabled" : ""}`}
                  onClick={handleClearData}>{clearDataLabel}
          </button>
        </div>
      </div>
      <div className="select-repeat-controls">
        <div className="inner-controls">
          <div className="select-repeat-selection">
            <div className="select-repeat-dropdown" title={tr("DG.Plugin.Sampler.tooltip.select-repeat")}>
              <select disabled={isRunning} value={repeat ? "repeat" : "select"} onChange={handleSelectRepeat}>
                <option className={`select-repeat-option`} value="select">{selectLabel}</option>
                <option className={`select-repeat-option`} value="repeat">{repeatLabel}</option>
              </select>
            </div>
            {!repeat && <input disabled={isRunning} type="number" min={1} id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>}
            <span>{`${repeat ? selectingItemsLabel : ""} ${itemsLabel}`}</span>
            <div className="select-replacement-dropdown" title={tr("DG.Plugin.Sampler.tooltip.replacement")}>
              <CustomSelect disabled={isRunning || !allowReplacement} value={replacementValue} onChange={handleSelectReplacement} options={replacementOptions} />
            </div>
          </div>
          {repeat &&
            <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
              <span>until</span>
              <input type="text" value={repeatUntilDisplay} onClick={handleShowRepeatUntil} onChange={handleShowRepeatUntil}></input>
              {showRepeatUntil && <RepeatUntilModal setShowRepeatUntil={setShowRepeatUntil} />}
            </div>
          }
        </div>
      </div>
      <div className="collect-controls">
        <div className="inner-controls">
          <span>{collectLabel}</span>
          <input disabled={isRunning} type="number" min={1} id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
          <span>{samplesLabel}</span>
        </div>
      </div>
    </div>
  );
};

