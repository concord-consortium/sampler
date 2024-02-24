import React from "react";
import { SpeedSlider } from "./model-speed-slider";
import { HelpModal } from "./help-modal";
import InfoIcon from "../../assets/help-icon.svg";
import { tr } from "../../utils/localeManager";

interface IModelHeader {
  modelHeaderStyle: React.CSSProperties;
  enableRunButton: boolean;
  repeat: boolean;
  sampleSize: string;
  numSamples: string;
  showHelp: boolean;
  isWide: boolean;
  handleStartRun: () => void;
  handleSampleSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumSamplesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRepeat: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSelectReplacement: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleClearData: () => void;
  setShowHelp: (showHelp: boolean) => void;
  setIsWide: (isWide: boolean) => void;
  handleOpenHelp: () => void;
}

export const ModelHeader = (props: IModelHeader) => {
  const { modelHeaderStyle, enableRunButton, repeat, sampleSize, numSamples, handleStartRun,
    handleSampleSizeChange, handleNumSamplesChange, handleSelectRepeat, handleSelectReplacement,
    handleClearData, showHelp, setShowHelp, isWide, setIsWide, handleOpenHelp } = props;
  return (
    <div className="model-header" style={modelHeaderStyle}>
      <div className="model-controls">
        <button className={`start-button ${!enableRunButton ? "disabled" : ""}`} onClick={handleStartRun} data-text="DG.plugin.Sampler.top-bar.run"></button>
        <button className={`stop-button ${enableRunButton ? "disabled" : ""}`} data-text="DG.plugin.Sampler.top-bar.stop"></button>
        <SpeedSlider />
        <button className="clear-data-button" onClick={handleClearData} data-text="DG.plugin.Sampler.reset-text"></button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-selection">
          <div className="select-repeat-dropdown">
            <select onChange={handleSelectRepeat}>
              <option className={`select-repeat-option`} value="select" data-text="DG.plugin.Sampler.selection-options.select-cases"></option>
              <option className={`select-repeat-option`} value="repeat" data-text="DG.plugin.Sampler.selection-options.repeat-cases"></option>
            </select>
          </div>
          <input type="text" id="sample_size" value={sampleSize} onChange={handleSampleSizeChange}></input>
          <span data-text={repeat ? "DG.plugin.Sampler.selection-options.selecting-items" : "DG.plugin.Sampler.selection-options.items"}></span>
          <div className="select-replacement-dropdown">
            <select onChange={handleSelectReplacement}>
              <option value="with" data-text="DG.plugin.Sampler.selection-options.with-replacement"></option>
              <option value="without" data-text="DG.plugin.Sampler.selection-options.without-replacement"></option>
            </select>
          </div>
        </div>
        {repeat &&
          <div className={`repeat-until-controls ${isWide ? "wide" : ""}`}>
            <span >{tr("DG.plugin.Sampler.repeat-control.until")}</span>
            <input type="text"></input>
            <InfoIcon onClick={handleOpenHelp}/>
            {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
          </div>
        }
      </div>
      <div className="collect-controls">
        <span data-text="DG.plugin.Sampler.draw-settings.collect-samples-p1"></span>
        <input type="text" id="num_samples" value={numSamples} onChange={handleNumSamplesChange}></input>
        <span data-text="DG.plugin.Sampler.draw-settings.collect-samples-p2"></span>
      </div>
    </div>
  );
};
