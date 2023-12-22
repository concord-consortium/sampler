import React, { useEffect, useState } from "react";
import {
  initializePlugin,
  createItems
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";

import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IModel, IRunResult, getDeviceColumnIndex } from "../models/model-model";
import { IDevice } from "../models/device-model";
import { Id, createId } from "../utils/id";

import "./App.scss";
import { findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";

const kPluginName = "Sample Plugin";
const kVersion = "0.0.1";
const kInitialDimensions = {
  width: 380,
  height: 680
};
// const kDataContextName = "SamplePluginData";

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (): IDevice => ({id: createId(), name: "output", deviceType: "mixer", variables: {"a": 100}});

export const App = () => {
  const [selectedTab, setSelectedTab] = useState<NavTab>("Model");
  const [model, setModel] = useImmer<IModel>({columns: []});
  const [selectedDeviceId, setSelectedDeviceId] = useState<Id|undefined>(undefined);

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
  }, []);

  // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
  useEffect(() => {
    setModel({columns: [{devices: [createDefaultDevice()]}]});
  }, [setModel]);

  const handleTabSelect = (tab: NavTab) => {
    setSelectedTab(tab);
  };

  const handleAddDevice = (parentDevice: IDevice) => {
    setModel(draft => {
      const newDevice = createDefaultDevice();

      const newColumnIndex = getDeviceColumnIndex(draft, parentDevice) + 1;
      if (draft.columns[newColumnIndex]) {
        // column already exists so add the device
        draft.columns[newColumnIndex].devices.push(newDevice);
      } else {
        // create the column and add the device
        draft.columns.splice(newColumnIndex, 0, {devices: [newDevice]});
      }
    });
  };

  const handleMergeDevices = (device: IDevice) => {
    setModel(draft => {
      const columnIndex = getDeviceColumnIndex(draft, device);
      if (columnIndex !== -1) {
        // remove the other devices
        draft.columns[columnIndex].devices.splice(0, draft.columns[columnIndex].devices.length, device);
      }
    });
  };

  const handleDeleteDevice = (device: IDevice) => {
    setModel(draft => {
      const columnIndex = getDeviceColumnIndex(draft, device);
      if (columnIndex !== -1) {
        const devices = draft.columns[columnIndex].devices.filter(dev => dev.id !== device.id);
        const noMoreDevicesInThisColumn = devices.length === 0;
        const hasColumnsToTheRight = draft.columns.length > columnIndex + 1;
        const question = noMoreDevicesInThisColumn && hasColumnsToTheRight ? "Delete this device and all the devices to the right of it?" : "Delete this device?";
        if (confirm(question)) {
          if (noMoreDevicesInThisColumn) {
            // when last device in a column is deleted delete this column and all the devices to the right if they exist
            draft.columns.splice(columnIndex, draft.columns.length - columnIndex);
          }
          else {
            draft.columns[columnIndex].devices = devices;
          }
        }
      } else {
        alert("Sorry, that device could not be found!");
      }
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === deviceId));
      if (columnIndex !== -1) {
        const device = draft.columns[columnIndex].devices.find(dev => dev.id === deviceId);
        if (device) {
          device.name = e.target.value;
        }
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, deviceId: Id) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === deviceId));
      if (columnIndex !== -1) {
        const device = draft.columns[columnIndex].devices.find(dev => dev.id === deviceId);
        if (device) {
          device.variables = {[e.target.value]: 100};
        }
      }
    });
  };

  const handleStartRun = async () => {
    // proof of concept that we can "run" the model and add items to CODAP
    const result: IRunResult = {};
    const attrKeys: string[] = [];
    model.columns.forEach(column => {
      column.devices.forEach(device => {
        result[device.name] = Object.keys(device.variables)[0];
        attrKeys.push(device.name);
      });
    });
    const ctxRes = await findOrCreateDataContext(attrKeys);
    if (ctxRes === "success") {
      await createItems(kDataContextName, [result]);
    }
  };

  return (
    <div className="App">
      <div className="navigationTabs">
        { navTabs.map((tab, index) => {
            return (
              <div key={`${index}`}
                  className={`tab ${selectedTab === tab ? "selected" : ""}`}
                  onClick={() => handleTabSelect(navTabs[index])}>
                {tab}
              </div>
            );
          })
        }
      </div>
      <div className="tab-content">
        {selectedTab === "Model" &&
          <ModelTab
            model={model}
            selectedDeviceId={selectedDeviceId}
            addDevice={handleAddDevice}
            mergeDevices={handleMergeDevices}
            deleteDevice={handleDeleteDevice}
            setSelectedDeviceId={setSelectedDeviceId}
            handleInputChange={handleInputChange}
            handleNameChange={handleNameChange}
            handleStartRun={handleStartRun}
          />
        }
        {selectedTab === "Measures" && <MeasuresTab />}
        {selectedTab === "About" && <AboutTab />}
      </div>
    </div>
  );
};
