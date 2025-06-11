import React, { useMemo } from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { deleteAllItems, deleteItemAttrs, findOrCreateDataContext, getItemAttrs } from "../../helpers/codap-helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { modelHasSpinner } from "../../helpers/model-helpers";
import { getCollectorAttrs, isCollectorOnlyModel } from "../../utils/collector";
import { getModelAttrs } from "../../utils/model";

interface IProps {
  showHelp: boolean;
  isWide: boolean;
  setShowHelp: (showHelp: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IProps) => {
  const { showHelp, setShowHelp, isWide, handleOpenHelp } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, sampleSize, numSamples, enableRunButton, isRunning, isPaused, model, replacement, dataContextName, untilFormula, attrMap } = globalState;
  const { handleStartRun, handleTogglePauseRun, handleStopRun } = useAnimationContext();
  const startToggleDisabled = !isRunning && !enableRunButton;

  // allowReplacement when there are no spinners
  const allowReplacement = useMemo(() => !modelHasSpinner(model), [model]);

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
        await findOrCreateDataContext(dataContextName, newAttrs, attrMap, setGlobalState, repeat, isCollector, globalState.instance);
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
      if (draft.repeat) {
        draft.enableRunButton = draft.untilFormula.trim() !== "";
      } else {
        draft.enableRunButton = draft.sampleSize.length > 0;
      }
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

  const handleSelectReplacement = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalState(draft => {
      draft.replacement = e.target.value === "with";
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

  const handleUntilFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.untilFormula = e.target.value;
      draft.enableRunButton = draft.untilFormula.trim() !== "";
    });
  };

  const clearDataButtonDisabled = isRunning || dataContextName === "";

  return (
    <div className="model-header">
      <div className="model-controls">
        <div className="inner-controls">
          <button disabled={startToggleDisabled} className={`start-button ${startToggleDisabled ? "disabled" : ""}`} onClick={handleToggleRun}>{isRunning ? (isPaused ? "START" : "PAUSE") : "START"}</button>
          <button disabled={!isRunning} className={`stop-button ${!isRunning ? "disabled" : ""}`} onClick={handleStopRun}>STOP</button>
          <SpeedSlider />
          <button disabled={clearDataButtonDisabled} className={`clear-data-button ${clearDataButtonDisabled ? "disabled" : ""}`} onClick={handleClearData}>CLEAR DATA</button>
        </div>
      </div>
      <div className="select-repeat-controls">
        <div className="inner-controls">
          <div className="select-repeat-selection">
            <div className="select-repeat-dropdown">
              <select disabled={isRunning} value={repeat ? "repeat" : "select"} onChange={handleSelectRepeat}>
                <option className={`select-repeat-option`} value="select">Select</option>
                <option className={`select-repeat-option`} value="repeat">Repeat</option>
              </select>
            </div>
            {!repeat && <input disabled={isRunning} type="number" min={1} id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>}
            <span>{`${repeat ? "selecting" : ""} items`}</span>
            <div className="select-replacement-dropdown">
              <select disabled={isRunning || !allowReplacement} value={replacement ? "with" : "without"} onChange={handleSelectReplacement}>
                <option value="with">with replacement</option>
                <option value="without">without replacement</option>
              </select>
            </div>
          </div>
          {repeat &&
            <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
              <span>until</span>
              <input type="text" value={untilFormula} onChange={handleUntilFormulaChange}></input>
              <InfoIcon onClick={handleOpenHelp}/>
              {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
            </div>
          }
        </div>
      </div>
      <div className="collect-controls">
        <div className="inner-controls">
          <span>Collect</span>
          <input disabled={isRunning} type="number" min={1} id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
          <span>samples</span>
        </div>
      </div>
    </div>
  );
};

