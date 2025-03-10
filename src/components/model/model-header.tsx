import React, { useMemo } from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { deleteAll } from "../../helpers/codap-helpers";
import { useAnimationContext } from "../../hooks/useAnimation";
import { modelHasSpinner } from "../../helpers/model-helpers";
import { VisibilityToggle } from "./visibility-toggle";
import { LockModelButton } from "./lock-model-button";
import { RepeatUntil } from "./repeat-until";

interface IProps {
  showHelp: boolean;
  isWide: boolean;
  setShowHelp: (showHelp: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IProps) => {
  const { showHelp, setShowHelp, isWide, handleOpenHelp } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, sampleSize, numSamples, enableRunButton, isRunning, isPaused, attrMap, model, replacement, isModelHidden, modelLocked } = globalState;
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

  const handleToggleModelVisibility = () => {
    setGlobalState(draft => {
      draft.isModelHidden = !draft.isModelHidden;
    });
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

  // Get button text and aria-label based on current state
  const getRunButtonProps = () => {
    if (isRunning) {
      if (isPaused) {
        return {
          text: "RESUME",
          ariaLabel: "Resume animation"
        };
      } else {
        return {
          text: "PAUSE",
          ariaLabel: "Pause animation"
        };
      }
    } else {
      return {
        text: "START",
        ariaLabel: "Start animation"
      };
    }
  };

  const runButtonProps = getRunButtonProps();

  return (
    <div className="model-header">
      <div className="model-title-container">
        <h2>Model</h2>
        <div className="model-controls-buttons">
          <VisibilityToggle 
            isHidden={isModelHidden} 
            onToggle={handleToggleModelVisibility} 
            ariaLabel="Toggle model visibility"
          />
          <LockModelButton />
        </div>
      </div>
      <div className="model-controls" role="toolbar" aria-label="Animation controls">
        <button 
          disabled={startToggleDisabled || modelLocked} 
          className={`animation-control-button ${startToggleDisabled || modelLocked ? "disabled" : ""}`} 
          onClick={handleToggleRun}
          aria-label={runButtonProps.ariaLabel}
          tabIndex={0}
        >
          {runButtonProps.text}
        </button>
        <button 
          disabled={!isRunning || modelLocked} 
          className={`animation-control-button ${!isRunning || modelLocked ? "disabled" : ""}`} 
          onClick={handleStopRun}
          aria-label="Stop animation"
          tabIndex={0}
        >
          STOP
        </button>
        <div className="animation-speed-control">
          <label id="speed-slider-label" htmlFor="speed-slider">Animation speed:</label>
          <SpeedSlider aria-labelledby="speed-slider-label" />
        </div>
        <button 
          disabled={isRunning || modelLocked} 
          className={`clear-data-button ${isRunning || modelLocked ? "disabled" : ""}`} 
          onClick={handleClearData}
          aria-label="Clear all data"
          tabIndex={0}
        >
          CLEAR DATA
        </button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-selection">
          <div className="select-repeat-dropdown">
            <select 
              disabled={isRunning || modelLocked} 
              onChange={handleSelectRepeat}
              aria-label="Select mode"
            >
              <option className={`select-repeat-option`} value="select">Select</option>
              <option className={`select-repeat-option`} value="repeat">Repeat</option>
            </select>
          </div>
          <input 
            disabled={isRunning || modelLocked} 
            type="number" 
            min={1} 
            id="sample_size" 
            value={sampleSize} 
            onChange={handleSampleSizeChange}
            aria-label="Sample size"
          />
          <span>{`${repeat ? "selecting" : ""} items`}</span>
          <div className="select-replacement-dropdown">
            <select 
              disabled={isRunning || !allowReplacement || modelLocked} 
              value={replacement ? "with" : "without"} 
              onChange={handleSelectReplacement}
              aria-label="Replacement mode"
            >
              <option value="with">with replacement</option>
              <option value="without">without replacement</option>
            </select>
          </div>
        </div>
        {repeat &&
          <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
            <RepeatUntil />
            <div 
              role="button" 
              tabIndex={0} 
              aria-label="Help with repeat until conditions"
              onClick={handleOpenHelp}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenHelp();
                }
              }}
            >
              <InfoIcon aria-hidden="true" />
            </div>
            {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
          </div>
        }
      </div>
      <div className="collect-controls">
        <span>Collect</span>
        <input 
          disabled={isRunning || modelLocked} 
          type="number" 
          min={1} 
          id="num_samples" 
          value={numSamples} 
          onChange={handleNumSamplesChange}
          aria-label="Number of samples to collect"
        />
        <span>samples</span>
      </div>
    </div>
  );
};

