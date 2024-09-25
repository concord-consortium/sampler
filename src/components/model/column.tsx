import React from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Device } from "./device";
import { getSourceDevices } from "../../models/model-model";
import { Arrow } from "./arrow";
import { ColumnHeader } from "./column-header";
import { IColumn } from "../../types";

import "./model-component.scss";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const Column = ({column, columnIndex}: IProps) => {
  const { globalState } = useGlobalStateContext();
  const { model } = globalState;
  const hasBranch = model.columns.find( c => c.id === column.id && c.devices.length > 1);

  return (
    <div key={columnIndex} className={`device-column ${hasBranch ? "centered" : ""}`}>
      {column.devices.map((device) => {
        const sourceDevices = getSourceDevices(model, device);
        const firstDeviceInColumn = column.devices[0].id === device.id;
        return (
          <React.Fragment key={device.id}>
            { firstDeviceInColumn &&
              <ColumnHeader column={column} columnIndex={columnIndex}/>
            }
            <Device
              device={device}
              columnIndex={columnIndex}
            />
            {sourceDevices.map((sourceDevice) => (
              <Arrow
                key={`${sourceDevice.id}-${device.id}`}
                source={sourceDevice}
                target={device}
                columnIndex={columnIndex - 1}
              />)
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
