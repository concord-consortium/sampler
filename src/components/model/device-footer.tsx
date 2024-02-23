import React from "react";
import { IDataContext, IDevice, IVariables, createDefaultDevice, kDeviceTypes } from "../../models/device-model";
import { useGlobalStateContext } from "../../hooks/use-global-state";
import { getDeviceColumnIndex, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { getNewVariable, getProportionalVars } from "../helpers";

import "./device-footer.scss";

interface IDeviceFooter {
  device: IDevice;
  dataContexts: IDataContext[];
  handleUpdateVariables: (variables: IVariables) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleSelectDataContext: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DeviceFooter = ({device, handleUpdateVariables, handleDeleteVariable, handleSelectDataContext, dataContexts}: IDeviceFooter) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, selectedDeviceId } = globalState;
  const { viewType } = device;
  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;

  const handleAddVariable = () => {
    const { viewType, variables } = device;
    if (viewType === "spinner") {
      handleUpdateVariables(getProportionalVars(variables));
    } else {
      const newVariable = getNewVariable(variables);
      handleUpdateVariables([...variables, newVariable]);
    }
  };

  const handleAddDevice = () => {
    setGlobalState(draft => {
      const newDevice = createDefaultDevice();
      const newColumnIndex = getDeviceColumnIndex(draft.model, device) + 1;
      if (draft.model.columns[newColumnIndex]) {
        // column already exists so add the device
        draft.model.columns[newColumnIndex].devices.push(newDevice);
      } else {
        // create the column and add the device
        draft.model.columns.splice(newColumnIndex, 0, {name: "output", devices: [newDevice]});
      }
      draft.createNewExperiment = true;
    });
  };

  const handleMergeDevices = () => {
    setGlobalState(draft => {
      const { model } = draft;
      const columnIndex = getDeviceColumnIndex(model, device);
      if (columnIndex !== -1) {
        // remove the other devices
        model.columns[columnIndex].devices.splice(0, model.columns[columnIndex].devices.length, device);
      }
      draft.createNewExperiment = true;
    });
  };

  const handleUpdateViewType = (viewType: IDevice["viewType"]) => {
    setGlobalState(draft => {
      const { model } = draft;
      const columnIndex = model.columns.findIndex(c => c.devices.find(d => d.id === selectedDeviceId));
      if (columnIndex !== -1) {
        const deviceToUpdate = model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.viewType = viewType;
        }
      }
    });
  };

  return (
    <div className="footer">
      { viewType !== "collector" &&
        <div className="add-remove-variables-buttons">
          <button onClick={handleAddVariable}>+</button>
          <button onClick={(e) => handleDeleteVariable(e)}>-</button>
          <button>...</button>
        </div>
      }
      <div className="device-buttons">
        {
          kDeviceTypes.map((deviceType) => {
            const renderButton = deviceType !== "collector" || showCollectorButton;
            if (renderButton) {
              return (
                <button
                  className={viewType === deviceType ? "selected" : ""}
                  onClick={() => handleUpdateViewType(deviceType)}
                  key={deviceType}>
                    {deviceType}
                </button>
              );
            }
          })
        }
      </div>
      <div className="device-buttons">
        {
          viewType === "collector" ?
            <select onChange={handleSelectDataContext}>
              <option value="">Select a data context</option>
              {
                dataContexts.map((context) => {
                  return <option value={context.name} key={context.id}>{context.name}</option>;
                })
              }
            </select>
            :
            <>
              <button onClick={handleAddDevice}>{addButtonLabel}</button>
              {showMergeButton && <button onClick={handleMergeDevices}>Merge</button>}
            </>
        }

      </div>
    </div>
  );
};
