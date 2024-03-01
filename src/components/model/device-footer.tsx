import React from "react";
import { IDataContext, IDevice, IVariables, ViewType, createDefaultDevice } from "../../models/device-model";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { getNewColumnName, getNewVariable, getProportionalVars } from "../helpers";
import { createNewAttribute } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../contants";
import { createId } from "../../utils/id";

import "./device-footer.scss";

interface IDeviceFooter {
  device: IDevice;
  columnIndex: number;
  dataContexts: IDataContext[];
  handleUpdateVariables: (variables: IVariables) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleSelectDataContext: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSpecifyVariables: () => void;
}

export const DeviceFooter = ({device, columnIndex, handleUpdateVariables, handleDeleteVariable, handleSelectDataContext, handleSpecifyVariables, dataContexts}: IDeviceFooter) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, selectedDeviceId } = globalState;
  const { viewType } = device;
  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;

  const handleAddVariable = () => {
    const { variables } = device;
    if (viewType === ViewType.Spinner) {
      handleUpdateVariables(getProportionalVars(variables));
    } else {
      const newVariable = getNewVariable(variables);
      handleUpdateVariables([...variables, newVariable]);
    }
  };

  const updateFormulas = () => {
    setGlobalState(draft => {
      draft.model.columns.forEach((col) => {
        col.devices.forEach((dev) => {
          const targets = getTargetDevices(draft.model, dev);
          if (targets.length) {
            targets.forEach((target) => {
              // add a formula if it doesn't exist
              if (!dev.formulas[target.id]) {
                dev.formulas[target.id] = "*";
              }
            });
            // check if there are any formulas that are no longer needed
            Object.keys(dev.formulas).forEach((key) => {
              if (!targets.find((t) => t.id === key)) {
                delete dev.formulas[key];
              }
            });
          }
        });
      });
    });
  };

  const handleAddDevice = () => {
    setGlobalState(draft => {
      const newDevice = createDefaultDevice();
      const newColumnIndex = columnIndex + 1;
      if (draft.model.columns[newColumnIndex]) {
        // add the device
        draft.model.columns[newColumnIndex].devices.push(newDevice);
      } else {
        // create the column and add the device
        const name: string = getNewColumnName("output", model.columns);
        const id: string = createId();
        draft.model.columns.splice(newColumnIndex, 0, {name, id, devices: [newDevice]});
        draft.attrMap[id] = {name, codapID: null};
        if (draft.samplerContext) {
          createNewAttribute(kDataContextName, "items", name);
        }
      }
      draft.createNewExperiment = true;
    });
    updateFormulas();
  };

  const handleMergeDevices = () => {
    setGlobalState(draft => {
      draft.model.columns[columnIndex].devices.splice(0, model.columns[columnIndex].devices.length, device);
      draft.createNewExperiment = true;
    });
  };

  const handleUpdateViewType = (view: ViewType) => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
      if (deviceToUpdate) {
        deviceToUpdate.viewType = view;
      }
    });
  };

  return (
    <div className="footer">
      { viewType !== ViewType.Collector &&
        <div className="add-remove-variables-buttons">
          <button onClick={handleAddVariable}>+</button>
          <button onClick={(e) => handleDeleteVariable(e)}>-</button>
          <button onClick={handleSpecifyVariables}>...</button>
        </div>
      }
      <div className="device-buttons">
        {
          Object.values(ViewType).map((deviceType) => {
            const renderButton = deviceType !== ViewType.Collector || showCollectorButton;
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
          viewType === ViewType.Collector ?
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
