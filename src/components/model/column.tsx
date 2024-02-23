import React, { useCallback, useRef, useState } from "react";
import { useGlobalStateContext } from "../../hooks/use-global-state";
import { Device } from "./device";
import { IColumn, getSourceDevices } from "../../models/model-model";
import { Id } from "../../utils/id";
import { Arrow } from "./arrow";

import "./model-component.scss";
interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const Column = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model } = globalState;
  const hasBranch = model.columns.find(c =>  c.devices.length > 1);
  const [attrName] = useState("output");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleNameChange = (deviceId: Id, newName: string) => {
    setGlobalState(draft => {
      const col = draft.model.columns.find(c => c.devices.find(d => d.id === deviceId));
      if (col) {
        col.name = newName;
      }
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
      {column.devices.map((device, index) => {
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
              device={device}
              deviceIndex={index}
            />
            {sourceDevices.map(sourceDevice => (
              <Arrow
                key={`${sourceDevice.id}-${device.id}`}
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
