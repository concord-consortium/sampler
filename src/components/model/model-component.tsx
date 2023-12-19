import React, { useState } from "react";
import { Device } from "./device";
import { IDevice } from "../../models/device-model";
import InfoIcon from "../../assets/help-icon.svg";

import "./model-component.scss";

const SpeedSlider = () => {
  const [value, setValue] = useState(1);
  const speedValue = ["Slow", "Medium", "Fast", "Fastest"];
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value, 10)); // Parse the value as an integer
  };

  return (
    <div className="speed-slider">
      <input
        type="range"
        min={0}
        max={3}
        value={value}
        onChange={handleChange}
        step={1}
        list="speedSettings"
        className="slider"
      />
      <div className="tick-marks-container">
          {speedValue.map((speed, i) => {
            return (
              <div className="tick-mark" key={`tick-${i}`}>
                <div className="tick-line"/>
              </div>
            );
          })}
      </div>
      <span id="speed-text" data-text="DG.plugin.Sampler.top-bar.medium-speed">
        {speedValue[value]}
      </span>
    </div>
  );
};

export const ModelTab = () => {
  const [numDevices, setNumDevices] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<IDevice | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSelectRepeat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRepeat(e.target.value === "repeat");
  };

  const handleOpenHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="model-tab">
      <div className="model-controls">
        <button className="start-button">START</button>
        <button className="stop-button">STOP</button>
        <SpeedSlider />
        <button className="clear-data-button">CLEAR DATA</button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-selection">
          <div className="select-repeat-dropdown">
            <select onChange={handleSelectRepeat}>
              <option className={`select-repeat-option`} value="select">Select</option>
              <option className={`select-repeat-option`} value="repeat">Repeat</option>
            </select>
          </div>
          <input id="sample_size" defaultValue="5"></input>
          <span>items</span>
          <div className="select-replacement-dropdown">
            <select>
              <option>with replacement</option>
              <option>without replacement</option>
            </select>
          </div>
        </div>
        {repeat &&
          <div className="repeat-until-controls">
            <span>until</span>
            <input type="text"></input>
            <InfoIcon onClick={handleOpenHelp}/>
            {showHelp && <HelpModal setShowHelp={setShowHelp}/>}
          </div>
        }
      </div>
      <div className="collect-controls">
        <span>Collect</span>
        <input defaultValue="3"></input>
        <span>samples</span>
      </div>
      <div className="model-container">
        <div className="device-outputs-container">
          <div className="device-column">
            <Device numDevices={numDevices} setNumDevices={setNumDevices} selectedDevice={selectedDevice}
                    setSelectedDevice={setSelectedDevice}/>
          </div>
          <div className="outputs">
            <div className="outputs-title">{`sample 1`}</div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IHelpModal {
  setShowHelp: (show: boolean) => void;
}

const HelpModal = ({setShowHelp}: IHelpModal) => {
  const handleCloseModal = () => {
    setShowHelp(false);
  };
  return (
    <div className="help-modal">
      <div className="modal-header">
        Help: Repeat Until Condition
      </div>
      <div className="modal-body">
        <p className="help-section-title">
          Specify a Condition to Repeat Until
        </p>
        <p className="help-section-body">
          Repeat Until allos the odel to continue drawing samples until a desired outcome -- the Condition specified -- occurs.
        </p>
        <p className="help-section-title">
          Using a Formula
        </p>
        <p className="help-section-body">
          {`Example: sex = "male" AND height > 5`}
        </p>
        <p className="help-section-title">
          Using a Pattern
        </p>
        <p className="help-section-body">
          {`Example: a,b,a`}
        </p>
      </div>
      <div className="modal-footer">
        <button className="modal-button" onClick={handleCloseModal}>Close</button>
      </div>
    </div>
  );
};
