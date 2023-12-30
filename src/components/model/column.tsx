import React, {useEffect} from "react";
import { Device } from "./device";
import { IColumn, IModel, getSourceDevices } from "../../models/model-model";
import { IDevice } from "../../models/device-model";
import { Id } from "../../utils/id";
import { useResizer } from "../../hooks/use-resizer";
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
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
}
export const Column = ({column, columnIndex, model, selectedDeviceId, setSelectedDeviceId, addDevice, mergeDevices, deleteDevice,
    handleNameChange, handleInputChange}: IProps) => {
  const isLastColumn = columnIndex >= model.columns.length - 1;
  const isFirstColumn = columnIndex <= 0;
  // if adjacent columns have more than one device,
  // and this column only has one device, center this device
  const centerDevice = model.columns[columnIndex].devices.length === 1
                        && ((!isLastColumn && model.columns[columnIndex + 1].devices.length > 1)
                              || (!isFirstColumn && model.columns[columnIndex - 1].devices.length > 1));

  return (
    <div key={columnIndex} className={`device-column ${centerDevice? "centered" : ""}`}>
      {column.devices.map(device => {
        const sourceDevices = getSourceDevices(model, device);
        const firstDeviceInColumn = column.devices[0].id === device.id;
        return (
          <React.Fragment key={device.id}>
            { firstDeviceInColumn &&
              <div className="device-column-header">
                <input className="attr-name" value={device.name} onChange={(e) => handleNameChange(e, device.id)}></input>
              </div>
            }
            <Device
              model={model}
              device={device}
              selectedDeviceId={selectedDeviceId}
              setSelectedDeviceId={setSelectedDeviceId}
              addDevice={addDevice}
              mergeDevices={mergeDevices}
              deleteDevice={deleteDevice}
              handleNameChange={handleNameChange}
              handleInputChange={handleInputChange}
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
