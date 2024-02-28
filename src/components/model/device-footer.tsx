import React from "react";
import { IDataContext, kDeviceTypes } from "../../models/device-model";

import "./device-footer.scss";

interface IDeviceFooter {
  viewType: string;
  handleAddVariable: () => void;
  handleAddDevice: () => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  showCollectorButton: boolean;
  showMergeButton: boolean;
  handleUpdateViewType: (viewType: "mixer" | "spinner" | "collector") => void;
  handleSelectDataContext: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  dataContexts: IDataContext[];
  addButtonLabel: string;
  handleMergeDevices: () => void;
  handleSpecifyVariables: () => void;
}

export const DeviceFooter = ({viewType, handleAddVariable, handleAddDevice, handleDeleteVariable,
  showCollectorButton, handleUpdateViewType, handleSelectDataContext, showMergeButton, dataContexts,
  addButtonLabel, handleMergeDevices, handleSpecifyVariables}: IDeviceFooter) => {
  return (
    <div className="footer">
      { viewType !== "collector" &&
        <div className="add-remove-variables-buttons">
          <button onClick={handleAddVariable}>+</button>
          <button onClick={(e) => handleDeleteVariable(e)}>-</button>
          <button onClick={handleSpecifyVariables}>...</button>
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
