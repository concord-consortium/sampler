import React, { useState } from "react";
import { Device } from "./device";
import { IDevice } from "../../models/device-model";

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
      />
      <span id="speed-text" data-text="DG.plugin.Sampler.top-bar.medium-speed">
        {speedValue[value]}
      </span>
    </div>
  );
};

export const ModelTab = () => {
  const [numDevices, setNumDevices] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<IDevice | null>(null);

  return (
    <div className="model-tab">
      <div className="model-controls">
        <button className="start-button">START</button>
        <button className="stop-button">STOP</button>
        <SpeedSlider />
        <button className="clear-data-button">CLEAR DATA</button>
      </div>
      <div className="select-repeat-controls">
        <div className="select-repeat-dropdown">
          <select>
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
