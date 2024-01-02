import React, { useEffect, useState } from "react";
import { ClippingDef, IDataContext, IDevice, IItem, IItems, kDeviceTypes } from "../../models/device-model";
import { Id } from "../../utils/id";
import { IModel, getNumDevices, getSiblingDevices, getTargetDevices } from "../../models/model-model";
import { Mixer } from "./device-views/mixer/mixer";
import { Spinner } from "./device-views/spinner/spinner";
import { Collector } from "./device-views/collector";
import { kMixerContainerHeight, kMixerContainerWidth, kSpinnerContainerHeight, kSpinnerContainerWidth } from "./device-views/shared/constants";
import { getAllItems, getListOfDataContexts } from "@concord-consortium/codap-plugin-api";
import { kDataContextName } from "../../utils/codap-helpers";
import DeleteIcon from "../../assets/delete-icon.svg";
import VisibleIcon from "../../assets/visibility-on-icon.svg";

import "./device.scss";

const views = ["mixer", "spinner", "collector"] as const;
type View = typeof views[number];

interface IProps {
  model: IModel;
  device: IDevice;
  selectedDeviceId?: Id;
  addDevice: (parentDevice: IDevice) => void;
  mergeDevices: (device: IDevice) => void;
  deleteDevice?: (device: IDevice) => void;
  setSelectedDeviceId: (id: Id) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => void;
  handleUpdateCollectorVariables: (collectorVariables: IDevice["collectorVariables"]) => void;
}

export const Device = (props: IProps) => {
  const {model, device, selectedDeviceId, setSelectedDeviceId, addDevice, mergeDevices,
    deleteDevice, handleNameChange, handleInputChange, handleUpdateCollectorVariables} = props;
  const [viewSelected, setViewSelected] = useState<View>("mixer");
  const [viewBox, setViewBox] = useState<string>(`0 0 ${kMixerContainerWidth} ${kMixerContainerHeight}`); // [x, y, width, height
  const [dataContexts, setDataContexts] = useState<IDataContext[]>([]);
  const [selectedDataContext, setSelectedDataContext] = useState<string>("");
  const [clippingDefs, setClippingDefs] = useState<ClippingDef[]>([]);

  useEffect(() => {
    const fetchDataContexts = async () => {
      const res = await getListOfDataContexts();
      return res.values;
    };

    if (viewSelected === "collector") {
      fetchDataContexts().then((contexts: Array<IDataContext>) => {
        const filteredCtxs = contexts.filter((context) => context.name !== kDataContextName);
        setDataContexts(filteredCtxs);
      });
    }

    if (viewSelected === "spinner") {
      setViewBox(`0 0 ${kSpinnerContainerWidth + 10} ${kSpinnerContainerHeight}`);
    } else {
      setViewBox(`0 0 ${kMixerContainerWidth + 10} ${kMixerContainerHeight}`);
    }
  }, [viewSelected]);

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
  }, [selectedDataContext]);

  const handleSelectDevice = () => setSelectedDeviceId(device.id);
  const handleAddDevice = () => addDevice(device);
  const handleDeleteDevice = () => deleteDevice?.(device);
  const handleMergeDevices = () => mergeDevices(device);
  const handleSelectDataContext = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataContext(e.target.value);
  };

  const handleAddDefs = (defs: { id: string, element: JSX.Element }[]) => {
    setClippingDefs(prevDefs => {
      const newDefs = defs.filter(def => !prevDefs.some(prevDef => prevDef.id === def.id));
      return [...prevDefs, ...newDefs];
    });
  }

  const targetDevices = getTargetDevices(model, device);
  const siblingDevices = getSiblingDevices(model, device);
  const addButtonLabel = targetDevices.length === 0 ? "Add Device" : "Add Branch";
  const showCollectorButton = getNumDevices(model) === 1;
  const showMergeButton = siblingDevices.length > 0;
  const isSelectedDevice = device.id === selectedDeviceId;

  return (
    <div className="device-controls-container" onClick={handleSelectDevice}>
      <div className={`device-container ${isSelectedDevice ? "selected" : ""}`} data-device-id={device.id}>
        <div className="device-status-icon">
          <VisibleIcon />
        </div>
        <div className="device-svg-container">
          <div className={`device-frame ${viewSelected}`}>
            <svg
              className="svg"
              width="100%"
              height="100%"
              viewBox={viewBox}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {clippingDefs.length && clippingDefs.map((def) => def.element)}
              </defs>
              {
                viewSelected === "mixer" ?
                  <Mixer variables={device.variables} handleAddDefs={handleAddDefs} /> :
                viewSelected === "spinner" ?
                  <Spinner variables={device.variables}/> :
                  <Collector collectorVariables={device.collectorVariables} handleAddDefs={handleAddDefs}/>
              }
            </svg>
          </div>
        </div>
        {deleteDevice &&
          <div className="device-delete-icon" onClick={handleDeleteDevice}>
            <DeleteIcon />
          </div>
        }
      </div>
      { isSelectedDevice &&
          <div className="footer">
            <div className="add-remove-variables-buttons">
              <button>+</button>
              <button>-</button>
              <button>...</button>
            </div>
            <div className="device-buttons">
              {
                kDeviceTypes.map((deviceType) => {
                  const renderButton = deviceType !== "collector" || showCollectorButton;
                  if (renderButton) {
                    return (
                      <button
                        className={viewSelected === deviceType ? "selected" : ""}
                        onClick={()=>setViewSelected(deviceType)}
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
                viewSelected === "collector" ?
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
      }
    </div>
  );
};
