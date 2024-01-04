import React, { useCallback, useEffect, useState } from "react";
import VisibleIcon from "../../assets/visibility-on-icon.svg";
import { ClippingDef, IDataContext, IDevice, IItem, IItems } from "../../models/device-model";
import { Id } from "../../utils/id";
import { IModel, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import DeleteIcon from "../../assets/delete-icon.svg";
import { Mixer } from "./device-views/mixer/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";
import { VariableLabelInput } from "./variable-label-input";
import { DeviceFooter } from "./device-footer";
import { kMixerContainerHeight, kMixerContainerWidth, kSpinnerContainerHeight, kSpinnerContainerWidth } from "./device-views/shared/constants";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../utils/codap-helpers";

import "./device.scss";

interface IProps {
  model: IModel;
  device: IDevice;
  selectedDeviceId?: Id;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
  handleAddVariable: () => void;
  handleDeleteVariable: () => void;
  handleUpdateViewType: (viewType: IDevice["viewType"]) => void;
  handleEditVariable: (oldVariableIdx: number, newVariableName: string) => void;
}

export const Device = (props: IProps) => {
  const {model, device, selectedDeviceId, setSelectedDeviceId, addDevice, mergeDevices,
    deleteDevice, handleNameChange, handleUpdateCollectorVariables, handleAddVariable,
    handleUpdateViewType, handleDeleteVariable, handleEditVariable} = props;
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [selectedVariableIdx, setSelectedVariableIdx] = useState<number|null>(null);
  const [selectedWedge, setSelectedWedge] = useState<string|null>(null);
  const [viewBox, setViewBox] = useState<string>(`0 0 ${kMixerContainerWidth} ${kMixerContainerHeight}`);
  const [clippingDefs, setClippingDefs] = useState<ClippingDef[]>([]);
  const { viewType } = device;

  useEffect(() => {
    const fetchDataContexts = async () => {
      const res = await getListOfDataContexts();
      return res.values;
    };

    if (viewType === "collector") {
      fetchDataContexts().then((contexts: Array<IDataContext>) => {
        const filteredCtxs = contexts.filter((context) => context.name !== kDataContextName);
        setDataContexts(filteredCtxs);
      });
    }

    if (viewType === "spinner") {
      setViewBox(`0 0 ${kSpinnerContainerWidth + 10} ${kSpinnerContainerHeight}`);
    } else {
      setViewBox(`0 0 ${kMixerContainerWidth + 10} ${kMixerContainerHeight}`);
    }
  }, [viewType]);

  useEffect(() => {
    if (selectedDataContext) {
      const fetchItems = async () => {
        const res = await getAllItems(selectedDataContext);
        return res.values;
      };

      fetchItems().then((items: IItems) => {
        const itemValues = items.map((item: IItem) => item.values);
        handleUpdateCollectorVariables(itemValues);
      });
    }
  }, [selectedDataContext, handleUpdateCollectorVariables]);

  const handleSelectDevice = () => setSelectedDeviceId(device.id);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);
  const handleMergeDevices = () => mergeDevices(device);
  const handleSelectDataContext = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataContext(e.target.value);
  };

  const handleAddDefs = useCallback((defs: { id: string, element: JSX.Element }[]) => {
    setClippingDefs(prevDefs => {
      const newDefs = defs.filter(def => !prevDefs.some(prevDef => prevDef.id === def.id));
      return [...prevDefs, ...newDefs];
    });
  }, []);

  const handleSetSelectedVariable = (variableIdx: number) => {
    setSelectedVariableIdx(variableIdx);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if ((e.target as HTMLElement).id === "svg-elemt") {
      setSelectedVariableIdx(null);
      setSelectedWedge(null);
    }
  };

  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;

  return (
    <div className="device-controls-container" onClick={handleSelectDevice}>
      <div>
        <input className="attr-name" value={device.name} onChange={(e) => handleNameChange(e, device.id)}></input>
      </div>
      <div className="device-container" data-device-id={device.id}>
        <div className="device-status-icon">
          <VisibleIcon />
        </div>
        <div className="device-svg-container">
          <div className={`device-frame ${viewType}`}>
            <svg
              className="svg"
              id={`svg-elemt`}
              width="100%"
              height="100%"
              viewBox={viewBox}
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleSvgClick}
            >
              <defs>
                {clippingDefs.length && clippingDefs.map((def) => def.element)}
              </defs>
              {
                viewType === "mixer" ?
                  <Mixer
                    variables={device.variables}
                    handleAddDefs={handleAddDefs}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                  /> :
                viewType === "spinner" ?
                  <Spinner
                    variables={device.variables}
                    selectedVariableIdx={selectedVariableIdx}
                    selectedWedge={selectedWedge}
                    handleSetSelectedWedge={(vName: string) => setSelectedWedge(vName)}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                  /> :
                  <Collector
                    collectorVariables={device.collectorVariables}
                    handleAddDefs={handleAddDefs}
                    handleSetSelectedVariable={handleSetSelectedVariable}
                  />
              }
            </svg>
            {
              selectedVariableIdx !== null &&
                <VariableLabelInput
                  viewType={viewType}
                  variableIdx={selectedVariableIdx}
                  variableName={device.variables[selectedVariableIdx]}
                  handleEditVariable={handleEditVariable}
                  onBlur={() => setSelectedVariableIdx(null)}
                />
            }
          </div>
        </div>
        {deleteDevice &&
          <div className="device-delete-icon" onClick={handleDeleteDevice}>
            <DeleteIcon />
          </div>
        }
      </div>
      { device.id === selectedDeviceId &&
          <DeviceFooter
            viewType={viewType}
            handleAddVariable={handleAddVariable}
            handleAddDevice={handleAddDevice}
            handleDeleteVariable={handleDeleteVariable}
            showCollectorButton={showCollectorButton}
            showMergeButton={showMergeButton}
            handleUpdateViewType={handleUpdateViewType}
            handleSelectDataContext={handleSelectDataContext}
            dataContexts={dataContexts}
            addButtonLabel={addButtonLabel}
            handleMergeDevices={handleMergeDevices}
          />
      }
    </div>
  );
};
