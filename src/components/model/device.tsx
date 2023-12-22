import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import DeleteIcon from "../../assets/delete-icon.svg";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";

import "./device.scss";

const views = ["mixer", "spinner", "collector"] as const;
type View = typeof views[number];

interface IProps {
  device: IDevice;
  selectedDeviceId?: Id;
  addDevice: (parentDevice: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
}

export const Device = (props: IProps) => {
  const {device, selectedDeviceId, setSelectedDeviceId, addDevice, deleteDevice, handleNameChange, handleInputChange} = props;
  const [viewSelected, setViewSelected] = useState<View>("mixer");

  const handleSelectDevice = () => setSelectedDeviceId(device.id);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);

  return (
    <div className="device-controls-container" onClick={handleSelectDevice}>
      <div>
        <input className="attr-name" value={device.name} onChange={(e) => handleNameChange(e, device.id)}></input>
      </div>
      <div className="device-container" data-device-id={device.id}>
        <div className="device-status-icon">
          <VisibleIcon />
        </div>
        <div className="device">
          {viewSelected}
        </div>
        <div className={"set-input"}>
          <input value={Object.keys(device.variables)[0]} onChange={(e) => handleInputChange(e, device.id)}></input>
        </div>
        {deleteDevice &&
          <div className="device-delete-icon" onClick={handleDeleteDevice}>
            <DeleteIcon />
          </div>
        }
      </div>
      { device.id === selectedDeviceId &&
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
      <div>id: {device.id}</div>
    </div>
  );
};
