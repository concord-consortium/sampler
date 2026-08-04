import React from "react";
import { tr } from "../../utils/localeManager";
import { createDefaultDevice } from "../../models/device-model";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { getNewColumnName, getNewVariable, getProportionalVars } from "../helpers";
import { createNewAttribute } from "@concord-consortium/codap-plugin-api";
import { getCollectionNames, tryRequest } from "../../helpers/codap-helpers";
import { createId } from "../../utils/id";
import {IDataContext, IDevice, IVariables, defaultOutputAttrName, ViewType, deviceButtonLabels, deviceButtonTooltips}
  from "../../types";

import "./device-footer.scss";

interface IProps {
  device: IDevice;
  columnIndex: number;
  dataContexts: IDataContext[];
  handleUpdateVariables: (variables: IVariables) => void;
  handleDeleteVariable: (e: React.MouseEvent, selectedVariable?: string) => void;
  handleSelectDataContext: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSpecifyVariables: () => void;
  clearFixedVariables: () => void
}

export const DeviceFooter = ({device, columnIndex, handleUpdateVariables, handleDeleteVariable, handleSelectDataContext, handleSpecifyVariables, clearFixedVariables, dataContexts}: IProps) => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { model, selectedDeviceId, isRunning, collectorContextName, attrMap, dataContextName } = globalState;
  const { viewType, hidden } = device;
  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0
    ? tr("DG.Plugin.Sampler.device-add") : tr("DG.Plugin.Sampler.device-branch");
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;
  const collectorSelectPrompt = tr("DG.Plugin.Sampler.collector.select-prompt");

  const handleAddVariable = () => {
    const { variables } = device;
    clearFixedVariables();
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
    const currentDeviceViewType = model.columns[columnIndex].devices[0].viewType;
    const newColumnIndex = columnIndex + 1;

    if (model.columns[newColumnIndex]) {
      // add the device
      setGlobalState(draft => {
        draft.model.columns[newColumnIndex].devices.push(createDefaultDevice(currentDeviceViewType));
      });
      updateFormulas();
      return;
    }

    // create the column and add the same number devices as the current column
    const name: string = getNewColumnName(defaultOutputAttrName, model.columns);
    const id: string = createId();
    const numNewDevices = model.columns[columnIndex].devices.length;
    const newDevices = Array.from({length: numNewDevices}, () => createDefaultDevice(currentDeviceViewType));
    // check if any attrs in attrMap have same name as new column name
    // if so, replace the old attrMap key with the new id rather than adding a CODAP attribute
    const existingAttr = Object.keys(attrMap).find((key) => attrMap[key].name === name);

    setGlobalState(draft => {
      draft.model.columns.splice(newColumnIndex, 0, {name, id, devices: newDevices});
      if (existingAttr) {
        draft.attrMap[id] = {...draft.attrMap[existingAttr]};
        delete draft.attrMap[existingAttr];
      } else {
        draft.attrMap[id] = {name, codapID: null};
      }
    });

    // TODO: tell the user. Adding a column is an explicit action, and a create that fails leaves the
    // column in the model with a null codapID and no attribute behind it, with nothing on screen to
    // say so. The next run recreates the attribute, so a warning will do until then.
    if (!existingAttr && dataContextName) {
      tryRequest(() => createNewAttribute(dataContextName, getCollectionNames().items, name),
        `could not create the attribute for column ${name}`)
        .then((result) => {
          if (result?.success && result.values.attrs?.[0]?.id) {
            setGlobalState(draft => {
              // the column can be deleted while this is in flight, taking its attrMap entry with it
              if (draft.attrMap[id]) {
                draft.attrMap[id].codapID = result.values.attrs[0].id;
              }
            });
          } else if (result) {
            // tryRequest reports a request that never answered. This is one that answered, but
            // either refused or came back without the id the column needs to recognise it later.
            console.warn(`Sampler: CODAP did not create an attribute for column ${name}`);
          }
        });
    }

    updateFormulas();
  };

  const handleMergeDevices = () => {
    setGlobalState(draft => {
      draft.model.columns[columnIndex].devices.splice(0, model.columns[columnIndex].devices.length, device);
    });
    updateFormulas();
  };

  const handleUpdateViewType = (view: ViewType) => {
    setGlobalState(draft => {
      const deviceToUpdate = draft.model.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
      if (deviceToUpdate) {

        if (deviceToUpdate.viewType === ViewType.Collector && view !== ViewType.Collector) {
          // reset the collector device to a default device
          draft.model.columns[columnIndex].name = defaultOutputAttrName;
          deviceToUpdate.variables = createDefaultDevice().variables;
        }
        if (view === "spinner") {
          deviceToUpdate.replacement = true; // reset replacement to true when switching to spinner
        }
        draft.enableRunButton = view !== ViewType.Collector || (draft.collectorContextName !== "");
        deviceToUpdate.viewType = view;
      }
    });
  };

  return (
    <div className="footer">
      { viewType !== ViewType.Collector &&
        <div className="add-remove-variables-buttons">
          <button disabled={isRunning || hidden} title={tr("DG.Plugin.Sampler.tooltip.add-item")}
                  onClick={handleAddVariable}>
            +
          </button>
          <button disabled={isRunning || hidden} title={tr("DG.Plugin.Sampler.tooltip.remove-item")}
                  onClick={(e) => handleDeleteVariable(e)}>
            -
          </button>
          <button disabled={isRunning || hidden} title={tr("DG.Plugin.Sampler.tooltip.specify-items")}
                  onClick={handleSpecifyVariables}>
            ...
          </button>
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
                  title={deviceButtonTooltips[deviceType]}
                  disabled={isRunning || hidden}
                  onClick={() => handleUpdateViewType(deviceType)}
                  key={deviceType}>
                    {deviceButtonLabels[deviceType]}
                </button>
              );
            }
          })
        }
      </div>
      <div className="device-buttons">
        {
          viewType === ViewType.Collector ? (
            dataContexts.length > 0 ?
              <select disabled={isRunning} value={collectorContextName} onChange={handleSelectDataContext}>
                <option value="">{collectorSelectPrompt}</option>
                {
                  dataContexts.map((context) => {
                    return <option value={context.name} key={context.id}>{context.name}</option>;
                  })
                }
              </select>
              :
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 3}}>
                <div>{tr("DG.Plugin.Sampler.collector.noDatasets")}</div>
                <div>{tr("DG.Plugin.Sampler.collector.add-or-import")}</div>
              </div>
            ):
            <>
              <button disabled={isRunning} onClick={handleAddDevice} title={tr("DG.Plugin.Sampler.tooltip.add-device")}>
                {addButtonLabel}
              </button>
              {showMergeButton && <button disabled={isRunning} onClick={handleMergeDevices}>Merge</button>}
            </>
        }
      </div>
    </div>
  );
};
