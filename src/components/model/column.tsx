import React, { useCallback, useRef, useState } from "react";
import { Device } from "./device";
import { IColumn, IModel, getSourceDevices } from "../../models/model-model";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { Arrow } from "./arrow";

import "./model-component.scss";

interface IProps {
  column: IColumn;
  columnIndex: number;
  model: IModel;
  selectedDeviceId?: Id;
  setSelectedDeviceId: (id: Id) => void;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  handleNameChange: (deviceId: Id, newName: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
}
export const Column = ({column, columnIndex, model, selectedDeviceId, setSelectedDeviceId, addDevice, mergeDevices, deleteDevice,
    handleNameChange, handleInputChange, handleUpdateCollectorVariables}: IProps) => {
  const hasBranch = model.columns.find(c =>  c.devices.length > 1);
  const multipleColumns = model.columns.length > 1;
  const [attrName, setAttrName] = useState("output");
  const [editing, setEditing] = useState(false);
  const attrNameInputRef = useRef<HTMLInputElement>(null);

  const resetAttrInput = useCallback(() => {
    if (attrNameInputRef.current) {
      attrNameInputRef.current.value = attrName;
    }
  }, [attrName]);

  const handleToggleEditing = () => {
    setEditing(prev => {
      setTimeout(() => {
        attrNameInputRef.current?.focus();
        attrNameInputRef.current?.select();
      }, 1);
      return !prev;
    });
  };

  const handleAttrNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, deviceId: string) => {
    switch(e.code) {
      case "Escape":
        attrNameInputRef.current?.blur();
        resetAttrInput();
        break;
      case "Enter":
        attrNameInputRef.current?.blur();
        handleNameChange(deviceId, e.currentTarget.value);
        break;
    }
  };

  return (
    <div key={columnIndex} className={`device-column ${hasBranch? "centered" : ""}`}>
      {column.devices.map(device => {
        const sourceDevices = getSourceDevices(model, device);
        const firstDeviceInColumn = column.devices[0].id === device.id;
        return (
          <React.Fragment key={device.id}>
            { firstDeviceInColumn &&
              <div className="device-column-header" onClick={handleToggleEditing}>
                <input ref={attrNameInputRef} className="attr-name" value={device.name}
                      onChange={(e) => handleNameChange(device.id, e.target.value)} onKeyDown={(e)=>handleAttrNameKeyDown(e, device.id)}>
                </input>
              </div>
            }
            <Device
              model={model}
              device={device}
              selectedDeviceId={selectedDeviceId}
              multipleColumns={multipleColumns}
              setSelectedDeviceId={setSelectedDeviceId}
              addDevice={addDevice}
              mergeDevices={mergeDevices}
              deleteDevice={deleteDevice}
              handleUpdateCollectorVariables={handleUpdateCollectorVariables}
            />
            {sourceDevices.map(sourceDevice => (
              <Arrow
                key={`${sourceDevice.id}-${device.id}`}
                model={model}
                selectedDeviceId={selectedDeviceId}
                source={sourceDevice}
                target={device}
              />)
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
