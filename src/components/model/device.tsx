import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { IModel, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";

import DeleteIcon from "../../assets/delete-icon.svg";

import "./device.scss";

const views = ["mixer", "spinner", "collector"] as const;
type View = typeof views[number];

interface IProps {
  model: IModel;
  device: IDevice;
  selectedDeviceId?: Id;
  firstInColumn: boolean;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
}

export const Device = (props: IProps) => {
  const {model, device, selectedDeviceId, firstInColumn, setSelectedDeviceId, addDevice, mergeDevices, deleteDevice,
    handleNameChange, handleInputChange} = props;
  const [viewSelected, setViewSelected] = useState<View>("mixer");

  const handleSelectDevice = () => setSelectedDeviceId(device.id);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);
  const handleMergeDevices = () => mergeDevices(device);

  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;
  const isSelectedDevice = device.id === selectedDeviceId;

  return (
    <div className="device-controls-container" onClick={handleSelectDevice}>
      { firstInColumn &&
        <div className="device-column-header">
          <input className="attr-name" value={device.name} onChange={(e) => handleNameChange(e, device.id)}></input>
        </div>
      }
      <div className={`device-container ${isSelectedDevice ? "selected" : ""}`} data-device-id={device.id}>
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
      { isSelectedDevice &&
          <div className="footer">
            <div className="add-remove-variables-buttons">
              <button>+</button>
              <button>-</button>
              <button>...</button>
            </div>
            <div className="device-buttons">
              <button className={viewSelected === "mixer" ? "selected" : ""} onClick={()=>setViewSelected("mixer")}>Mixer</button>
              <button className={viewSelected === "spinner" ? "selected" : ""} onClick={()=>setViewSelected("spinner")}>Spinner</button>
              {showCollectorButton && <button className={viewSelected === "collector" ? "selected" : ""} onClick={()=>setViewSelected("collector")}>Collector</button>}
            </div>
            <div className="device-buttons">
              <button onClick={handleAddDevice} disabled={viewSelected === "collector"}>{addButtonLabel}</button>
              {showMergeButton && <button onClick={handleMergeDevices}>Merge</button>}
            </div>
          </div>
      }
    </div>
  );
};
