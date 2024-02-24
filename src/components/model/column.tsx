import React, { useCallback, useRef, useState } from "react";
import { getAttribute, updateAttribute } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../contants";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Device } from "./device";
import { IColumn, getSourceDevices } from "../../models/model-model";
import { Arrow } from "./arrow";

import "./model-component.scss";

interface IProps {
  column: IColumn;
  columnIndex: number;
}

export const Column = ({column, columnIndex}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model } = globalState;
  const hasBranch = model.columns.find( c => c.id === column.id && c.devices.length > 1);
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

  const handleNameChange = async (newName: string) => {
    const oldAttrName = globalState.attrMap[column.id].name;
    if (globalState.samplerContext) {
      const attr = (await getAttribute(kDataContextName, "items", oldAttrName)).values;
      await updateAttribute(kDataContextName, "items", oldAttrName, attr, {name: newName});
    }
    setGlobalState(draft => {
      draft.model.columns[columnIndex].name = newName;
      draft.attrMap[column.id].name = newName;
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
        handleNameChange(e.currentTarget.value);
        break;
    }
  };

  return (
    <div key={columnIndex} className={`device-column ${hasBranch ? "centered" : ""}`}>
      {column.devices.map((device, index) => {
        const sourceDevices = getSourceDevices(model, device);
        const firstDeviceInColumn = column.devices[0].id === device.id;
        return (
          <React.Fragment key={device.id}>
            { firstDeviceInColumn &&
              <div className="device-column-header" onClick={handleToggleEditing}>
                <input ref={attrNameInputRef} className="attr-name" value={column.name}
                      onChange={(e) => handleNameChange(e.target.value)} onKeyDown={(e)=>handleAttrNameKeyDown(e, device.id)}>
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
