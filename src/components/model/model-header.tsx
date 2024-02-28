import React from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { useCodapAPI } from "../../hooks/useCodapAPI";

interface IModelHeader {
  modelHeaderStyle: React.CSSProperties;
  showHelp: boolean;
  isWide: boolean;
  setShowHelp: (showHelp: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IModelHeader) => {
  const { modelHeaderStyle, showHelp, setShowHelp, isWide, handleOpenHelp } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, sampleSize, numSamples, enableRunButton } = globalState;
  const { handleStartRun, deleteAll } = useCodapAPI();

  const handleClearData = () => {
    deleteAll();
  };

  const handleSelectRepeat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalState(draft => {
      draft.repeat = e.target.value === "repeat";
      draft.createNewExperiment = true;
    });
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.sampleSize = e.target.value;
      if (e.target.value !== null && Number(e.target.value)) {
        draft.createNewExperiment = true;
        draft.enableRunButton = true;
      } else {
        draft.enableRunButton = false;
      }
    });
  };

  const handleSelectReplacement = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalState(draft => {
      draft.replacement = e.target.value === "with";
      draft.createNewExperiment = true;
    });
  };

  const handleNumSamplesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.numSamples = e.target.value;
      if (e.target.value !== null && Number(e.target.value)) {
        draft.createNewExperiment = true;
        draft.enableRunButton = true;
      } else {
        draft.enableRunButton = false;
      }
    });
  };

  return (
    <div className="model-header" style={modelHeaderStyle}>
      <div className="model-controls">
        <button className={`start-button ${!enableRunButton ? "disabled" : ""}`} onClick={handleStartRun}>START</button>
        <button className={`stop-button ${enableRunButton ? "disabled" : ""}`}>STOP</button>
        <SpeedSlider />
        <button className="clear-data-button" onClick={handleClearData}>CLEAR DATA</button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-selection">
          <div className="select-repeat-dropdown">
            <select onChange={handleSelectRepeat}>
              <option className={`select-repeat-option`} value="select">Select</option>
              <option className={`select-repeat-option`} value="repeat">Repeat</option>
            </select>
          </div>
          <input type="text" id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>
          <span>{`${repeat ? "selecting" : ""} items`}</span>
          <div className="select-replacement-dropdown">
            <select onChange={handleSelectReplacement}>
              <option value="with">with replacement</option>
              <option value="without">without replacement</option>
            </select>
          </div>
        </div>
        {repeat &&
          <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
            <span>until</span>
            <input type="text"></input>
            <InfoIcon onClick={handleOpenHelp}/>
            {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
          </div>
        }
      </div>
      <div className="collect-controls">
        <span>Collect</span>
        <input type="text" id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
        <span>samples</span>
      </div>
    </div>
  );
};
