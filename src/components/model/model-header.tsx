import React, { useMemo } from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { deleteAll } from "../../helpers/codap-helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { modelHasSpinner } from "../../helpers/model-helpers";

interface IProps {
  showHelp: boolean;
  isWide: boolean;
  setShowHelp: (showHelp: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IProps) => {
  const { showHelp, setShowHelp, isWide, handleOpenHelp } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, sampleSize, numSamples, enableRunButton, isRunning, isPaused, attrMap, model, replacement } = globalState;
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
    deleteAll(attrMap);
  };

  const handleSelectRepeat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalState(draft => {
      draft.repeat = e.target.value === "repeat";
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

  return (
    <div className="model-header">
      <div className="model-controls">
        <button disabled={startToggleDisabled} className={`start-button ${startToggleDisabled ? "disabled" : ""}`} onClick={handleToggleRun}>{isRunning ? (isPaused ? "START" : "PAUSE") : "START"}</button>
        <button disabled={!isRunning} className={`stop-button ${!isRunning ? "disabled" : ""}`} onClick={handleStopRun}>STOP</button>
        <SpeedSlider />
        <button disabled={isRunning} className={`clear-data-button ${isRunning ? "disabled" : ""}`} onClick={handleClearData}>CLEAR DATA</button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-selection">
          <div className="select-repeat-dropdown">
            <select disabled={isRunning} onChange={handleSelectRepeat}>
              <option className={`select-repeat-option`} value="select">Select</option>
              <option className={`select-repeat-option`} value="repeat">Repeat</option>
            </select>
          </div>
          <input disabled={isRunning} type="number" min={1} id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>
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
            {/* note: when this feature is implemented the model-helpers#computeExperimentHash method needs to be updated to include the until value */}
            <input type="text"></input>
            <InfoIcon onClick={handleOpenHelp}/>
            {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
          </div>
        }
      </div>
      <div className="collect-controls">
        <span>Collect</span>
        <input disabled={isRunning} type="number" min={1} id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
        <span>samples</span>
      </div>
    </div>
  );
};

