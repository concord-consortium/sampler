import React from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { useGlobalStateContext } from "../../hooks/use-global-state";
import { getRandomElement } from "../helpers";
import { findOrCreateDataContext, kDataContextName, deleteAll } from "../../utils/codap-helpers";
import { createItems } from "@concord-consortium/codap-plugin-api";

interface IModelHeader {
  modelHeaderStyle: React.CSSProperties;
  showHelp: boolean;
  isWide: boolean;
  setShowHelp: (showHelp: boolean) => void;
  setIsWide: (isWide: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IModelHeader) => {
  const { modelHeaderStyle, showHelp, setShowHelp, isWide, setIsWide, handleOpenHelp } = props;
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, repeat, sampleSize, numSamples, enableRunButton, replacement, createNewExperiment } = globalState;

  const getResults = (experimentNum: number): { [key: string]: string|number }[] => {
    const results: { [key: string]: string|number }[] = [];
    for (let sampleIndex = 0; sampleIndex < Number(numSamples); sampleIndex++) {
      for (let i = 0; i < Number(sampleSize); i++) {
        const sample: { [key: string]: string|number } = {};
        model.columns.forEach(column => {
          // to-do: pick a device based on the user formula if there is one defined
          const device = column.devices.length > 1 ? getRandomElement(column.devices): column.devices[0];
          const variable = getRandomElement(device.variables);
          sample[column.name] = variable;
          sample.experiment = experimentNum;
          sample.sample = sampleIndex + 1;
          const deviceStr = device.viewType.charAt(0).toUpperCase() + device.viewType.slice(1);
          sample.description = `${deviceStr} containing ${numSamples} items${replacement ? " (with replacement)" : ""}`;
          sample["sample size"] = sampleSize && parseInt(sampleSize, 10);
        });
        results.push(sample);
      }
    }
    return results;
  };

  const getAttrKeys = () => {
    const attrKeys: string[] = [];
    model.columns.forEach(column => {
        attrKeys.push(column.name);
    });
    return attrKeys;
  };

  const handleStartRun = async () => {
    // proof of concept that we can "run" the model and add items to CODAP
    setGlobalState(draft => {
      draft.createNewExperiment = false;
    });
    const experimentNum = model.experimentNum
    ? createNewExperiment
        ? model.experimentNum + 1
        : model.experimentNum
    : 1;
    const results = getResults(experimentNum);
    const attrKeys = getAttrKeys();
    const ctxRes = await findOrCreateDataContext(attrKeys);
    if (ctxRes === "success") {
      await createItems(kDataContextName, results);
      setGlobalState(draft => {
        draft.model.experimentNum = experimentNum;
        draft.enableRunButton = true;
      });
    }
  };

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
