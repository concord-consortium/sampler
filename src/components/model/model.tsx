import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import DeleteIcon from "../../assets/delete-icon.svg";

import "./model.css";

export const ModelTab = () => {
  const [deviceSelected, setDeviceSelected] = useState("mixer");
  return (
    <div className="model-tab">
      <div className="model-controls">
        <button className="start-button">START</button>
        <button className="stop-button">STOP</button>
        <div>Slider</div>
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
            <div className="device-controls-containter">
              <div>
                <input className="attr-name" defaultValue={"output"}></input>
              </div>
              <div className="device-container">
                <div className="device-status-icon">
                  <VisibleIcon />
                </div>
                <div className="device">
                  {deviceSelected}
                </div>
                <div className="device-delete-icon">
                  <DeleteIcon />
                </div>
              </div>
              <div className="footer">
                <div className="add-remove-variables-buttons">
                  <button>+</button>
                  <button>-</button>
                  <button>...</button>
                </div>
                <div className="device-buttons">
                  <button className={deviceSelected === "mixer" ? "selected" : ""} onClick={()=>setDeviceSelected("mixer")}>Mixer</button>
                  <button className={deviceSelected === "spinner" ? "selected" : ""} onClick={()=>setDeviceSelected("spinner")}>Spinner</button>
                  <button className={deviceSelected === "collector" ? "selected" : ""} onClick={()=>setDeviceSelected("collector")}>Collector</button>
                </div>
                <div className="add-device-button">
                  <button>Add Device</button>
                </div>
              </div>
            </div>
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
