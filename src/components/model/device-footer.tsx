import React from "react";
import { createDefaultDevice } from "../../models/device-model";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { getNewColumnName, getNewVariable, getProportionalVars } from "../helpers";
import { createNewAttribute } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../contants";
import { createId } from "../../utils/id";
import { IDataContext, IDevice, IVariables, ViewType } from "../../types";

import "./device-footer.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
  dataContexts?: IDataContext[];
  handleUpdateVariables: (variables: IVariables) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleSpecifyVariables: () => void;
}

export const DeviceFooter = ({device, columnIndex, handleUpdateVariables, handleDeleteVariable, handleSpecifyVariables, dataContexts = []}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, isRunning, collectorContext } = globalState;
  const { viewType } = device;
  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;
  const selectedDataContext = collectorContext?.name || "";

  const handleAddVariable = () => {
    const { variables } = device;
    if (viewType === ViewType.Spinner) {
      handleUpdateVariables(getProportionalVars(variables));
    } else {
      const newVariable = getNewVariable(variables);
      handleUpdateVariables([...variables, newVariable]);
    }
  };

  /**
   * Handle keyboard events for buttons
   * @param e - The keyboard event
   * @param callback - The function to call when Enter or Space is pressed
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scrolling on space
      callback();
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
        // check if any attrs in attrMap have same name as new column name
        // if so, replace the old attrMap key with the new id
        const existingAttr = Object.keys(draft.attrMap).find((key) => draft.attrMap[key].name === name);
        if (existingAttr) {
          draft.attrMap[id] = {...draft.attrMap[existingAttr]};
          delete draft.attrMap[existingAttr];
        } else {
          draft.attrMap[id] = {name, codapID: null};
          if (draft.samplerContext) {
            createNewAttribute(kDataContextName, "items", name);
          }
        }
      }
    });
    updateFormulas();
  };

  const handleMergeDevices = () => {
    setGlobalState(draft => {
      draft.model.columns[columnIndex].devices.splice(0, model.columns[columnIndex].devices.length, device);
    });
    updateFormulas();
  };

  const handleUpdateViewType = (view: ViewType) => {
    console.log("handleUpdateViewType called with view:", view);
    console.log("Current device:", device);
    
    setGlobalState(draft => {
      console.log("Updating global state with new view type");
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === device.id);
      console.log("Device to update:", deviceToUpdate);
      
      if (deviceToUpdate) {
        deviceToUpdate.viewType = view;
        console.log("Updated device view type to:", view);
        
        // If switching to Collector and there's only one device, check for available datasets
        if (view === ViewType.Collector && getNumDevices(draft.model) === 1) {
          console.log("Switching to Collector mode with single device");
          // The actual dataset selection is handled in the Collector component
        }
        
        // If switching from Collector to another type, reset collector-specific state
        if (deviceToUpdate.viewType !== ViewType.Collector && view !== ViewType.Collector) {
          console.log("Switching from Collector to another type, resetting state");
          deviceToUpdate.collectorVariables = [];
          draft.collectorContext = undefined;
        }
      } else {
        console.log("Device not found for update");
      }
    });
  };

  return (
    <div className="device-footer">
      <div className="device-controls">
        <div className="device-variables">
          <button 
            onClick={handleAddVariable} 
            onKeyDown={(e) => handleKeyDown(e, handleAddVariable)}
            disabled={isRunning}
            aria-label="Add variable"
          >
            Add Variable
          </button>
          <button 
            onClick={handleSpecifyVariables} 
            onKeyDown={(e) => handleKeyDown(e, handleSpecifyVariables)}
            disabled={isRunning}
            aria-label="Specify variables"
          >
            Specify Variables
          </button>
        </div>
        <div className="device-type-selector">
          <button
            className={`device-type-button ${viewType === ViewType.Mixer ? "selected" : ""}`}
            onClick={() => handleUpdateViewType(ViewType.Mixer)}
            onKeyDown={(e) => handleKeyDown(e, () => handleUpdateViewType(ViewType.Mixer))}
            disabled={isRunning}
            aria-label="Switch to Mixer view"
            aria-pressed={viewType === ViewType.Mixer}
          >
            Mixer
          </button>
          <button
            className={`device-type-button ${viewType === ViewType.Spinner ? "selected" : ""}`}
            onClick={() => handleUpdateViewType(ViewType.Spinner)}
            onKeyDown={(e) => handleKeyDown(e, () => handleUpdateViewType(ViewType.Spinner))}
            disabled={isRunning}
            aria-label="Switch to Spinner view"
            aria-pressed={viewType === ViewType.Spinner}
          >
            Spinner
          </button>
          {showCollectorButton && (
            <button
              className={`device-type-button ${viewType === ViewType.Collector ? "selected" : ""}`}
              onClick={() => handleUpdateViewType(ViewType.Collector)}
              onKeyDown={(e) => handleKeyDown(e, () => handleUpdateViewType(ViewType.Collector))}
              disabled={isRunning}
              aria-label="Switch to Collector view"
              aria-pressed={viewType === ViewType.Collector}
            >
              Collector
            </button>
          )}
        </div>
      </div>
      <div className="device-buttons">
        {
          viewType === ViewType.Collector ?
            <div className="data-context-selector" style={{ marginBottom: '5px' }}>
              <div style={{ marginBottom: '5px', fontSize: '12px' }}>Available Datasets:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Array.isArray(dataContexts) && dataContexts.length > 0 ? 
                  dataContexts.map(context => {
                    const contextId = context.id || context.guid || Math.random().toString();
                    const contextName = context.name || "";
                    const displayName = context.title || context.name || "Unnamed dataset";
                    const isSelected = selectedDataContext === contextName;
                    
                    return (
                      <button
                        key={contextId}
                        style={{
                          padding: '3px 8px',
                          border: isSelected ? '2px solid #4a90e2' : '1px solid #ccc',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? '#e6f2ff' : '#f8f8f8',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isSelected ? 'bold' : 'normal'
                        }}
                        disabled={true}
                        aria-pressed={isSelected}
                      >
                        {displayName}
                      </button>
                    );
                  })
                : <div>No datasets available</div>}
              </div>
            </div>
          :
            <>
              <button 
                disabled={isRunning} 
                onClick={handleAddDevice}
                onKeyDown={(e) => handleKeyDown(e, handleAddDevice)}
                aria-label={addButtonLabel}
              >
                {addButtonLabel}
              </button>
              {showMergeButton && 
                <button 
                  disabled={isRunning} 
                  onClick={handleMergeDevices}
                  onKeyDown={(e) => handleKeyDown(e, handleMergeDevices)}
                  aria-label="Merge devices"
                >
                  Merge
                </button>
              }
            </>
        }
      </div>
    </div>
  );
};
