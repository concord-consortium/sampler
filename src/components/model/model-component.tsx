import React, { useState } from "react";
import { Device } from "./device";

import "./model-component.scss";

export const ModelTab = () => {
  const [numDevices, setNumDevices] = useState(1);

  return (
    <div className="model-tab">
      <div className="model-controls">
        <button className="start-button">START</button>
        <button className="stop-button">STOP</button>
        <div className="speed-slider">
          <input id="speed" type="range" min="0" max="3" value="1" list="speedsettings" />
          <datalist id="speedsettings">
            <option>0</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </datalist>
          <span id="speed-text" data-text="DG.plugin.Sampler.top-bar.medium-speed">
            Medium
          </span>
        </div>
        <button className="clear-data-button">CLEAR DATA</button>
      </div>
      <div className="select-repeat-controls">
        <select className="select-repeat-dropdown">
          <option defaultChecked>Select</option>
          <option>Repeat</option>
        </select>
        <input defaultValue="5"></input>
        <span>items</span>
        <select>
          <option>with replacement</option>
          <option>without replacement</option>
        </select>
      </div>
      <div className="collect-controls">
        <span>Collect</span>
        <input defaultValue="3"></input>
        <span>samples</span>
      </div>
      <div>
        <div className="model-container">
          <div className="device-outputs-container">
            <Device numDevices={numDevices} setNumDevices={setNumDevices}/>
            <div className="outputs">
              <div className="outputs-title">{`sample 1`}</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
