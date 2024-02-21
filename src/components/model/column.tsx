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
  modelIsRunning: boolean;
  numSamples: string;
  setSelectedDeviceId: (id: Id) => void;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  handleNameChange: (deviceId: string, newName: string) => void;
  handleAddVariable: (selectedVariable?: string) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleUpdateViewType: (viewType: IDevice["viewType"]) => void;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
  handleEditVarPct: (variableIdx: number, pctStr: string, updateNext?: boolean) => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
  setModelIsRunning: (isRunning: boolean) => void;
}
export const Column = ({column, columnIndex, model, selectedDeviceId, modelIsRunning, numSamples,
    setSelectedDeviceId, addDevice, mergeDevices, deleteDevice,
    handleNameChange, handleUpdateCollectorVariables, handleAddVariable, handleDeleteVariable,
    handleEditVarPct, handleEditVariable, handleUpdateViewType, setModelIsRunning}: IProps) => {
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
                <input ref={attrNameInputRef} className="attr-name" value={column.name}
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
              deleteDevice={columnIndex !== 0 ? deleteDevice : undefined}
              handleNameChange={handleNameChange}
              handleUpdateCollectorVariables={handleUpdateCollectorVariables}
              handleAddVariable={handleAddVariable}
              handleDeleteVariable={handleDeleteVariable}
              handleUpdateViewType={handleUpdateViewType}
              handleEditVariable={handleEditVariable}
              handleEditVarPct={handleEditVarPct}
            />
            {sourceDevices.map(sourceDevice => (
              <Arrow
                key={`${sourceDevice.id}-${device.id}`}
                model={model}
                selectedDeviceId={selectedDeviceId}
                source={sourceDevice}
                target={device}
                modelIsRunning={modelIsRunning}
                numSamples={numSamples}
                setModelIsRunning={setModelIsRunning}
              />)
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
