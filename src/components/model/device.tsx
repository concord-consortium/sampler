import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import DeleteIcon from "../../assets/delete-icon.svg";

import "./device.scss";

interface IProps {
  numDevices: number;
  setNumDevices: (numDevices: number) => void;
}

export const Device = ({numDevices, setNumDevices}: IProps) => {
  const [deviceSelected, setDeviceSelected] = useState("mixer");

  return (
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
          <button onClick={()=>setNumDevices(numDevices + 1)}>Add Device</button>
        </div>
      </div>
    </div>
  );
};
