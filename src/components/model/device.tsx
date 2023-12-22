import React, { useState } from "react";

import VisibleIcon from "../../assets/visibility-on-icon.svg";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { IModel, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";

import DeleteIcon from "../../assets/delete-icon.svg";

import "./device.scss";
import { Mixer } from "./device-views/mixer/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";

const views = ["mixer", "spinner", "collector"] as const;
type View = typeof views[number];

interface IProps {
  model: IModel;
  device: IDevice;
  selectedDeviceId?: Id;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
}

export const Device = (props: IProps) => {
  const {model, device, selectedDeviceId, setSelectedDeviceId, addDevice, mergeDevices, deleteDevice, handleNameChange, handleInputChange} = props;
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

  return (
    <div className="device-controls-container" onClick={handleSelectDevice}>
      <div>
        <input className="attr-name" value={device.name} onChange={(e) => handleNameChange(e, device.id)}></input>
      </div>
      <div className="device-container" data-device-id={device.id}>
        <div className="device-status-icon">
          <VisibleIcon />
        </div>
        {
          viewSelected === "mixer" ?
            <Mixer variables={device.variables} /> :
          viewSelected === "spinner" ?
            <Spinner variables={device.variables}/> :
            <Collector collectorVariables={device.collectorVariables}/>
        }
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
