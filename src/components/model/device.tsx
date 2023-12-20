import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import DeleteIcon from "../../assets/delete-icon.svg";
import { IDevice } from "../../models/device-model";

import "./device.scss";

const views = ["mixer", "spinner", "collector"] as const;
type View = typeof views[number];

interface IProps {
  device: IDevice;
  selectedDevice?: IDevice;
  addDevice: (parentDevice: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDevice: (selectedDevice: IDevice) => void
}

export const Device = (props: IProps) => {
  const {device, selectedDevice, setSelectedDevice, addDevice, deleteDevice} = props;
  const [viewSelected, setViewSelected] = useState<View>("mixer");

  const handleSelectDevice = () => setSelectedDevice(device);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);

  return (
    <div className="device-controls-containter" onClick={handleSelectDevice}>
      <div>
        <input className="attr-name" defaultValue={"output"}></input>
      </div>
      <div className="device-container">
        <div className="device-status-icon">
          <VisibleIcon />
        </div>
        <div className="device">
          {viewSelected}
        </div>
        {deleteDevice &&
          <div className="device-delete-icon" onClick={handleDeleteDevice}>
            <DeleteIcon />
          </div>
        }
      </div>
      { device === selectedDevice &&
          <div className="footer">
            <div className="add-remove-variables-buttons">
              <button>+</button>
              <button>-</button>
              <button>...</button>
            </div>
            <div className="device-buttons">
              <button className={viewSelected === "mixer" ? "selected" : ""} onClick={()=>setViewSelected("mixer")}>Mixer</button>
              <button className={viewSelected === "spinner" ? "selected" : ""} onClick={()=>setViewSelected("spinner")}>Spinner</button>
              <button className={viewSelected === "collector" ? "selected" : ""} onClick={()=>setViewSelected("collector")}>Collector</button>
            </div>
            <div className="add-device-button">
              <button onClick={handleAddDevice} disabled={viewSelected === "collector"}>Add Device</button>
            </div>
          </div>
      }
    </div>
  );
};
