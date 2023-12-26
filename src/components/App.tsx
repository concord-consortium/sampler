import React, { useEffect, useState } from "react";
import {
  initializePlugin,
  createItems
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";

import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IExperiment, IModel, IRunResult, ISample, getDeviceColumnIndex } from "../models/model-model";
import { IDevice } from "../models/device-model";
import { Id, createId } from "../utils/id";
import { findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";
import { tr, localeInit } from "../utils/localeManager";

import "./App.scss";
const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: 328,
  height: 500
};
// const targetDataSetName = tr("DG.plugin.Sampler.dataset.name") || "Sampler";
const targetDataSetName = "Sampler";


const dataSetName = "Sampler Data";

const iFrameDescriptor ={
  version: kVersion,
  name: "Sampler",
  // name: tr("DG.plugin.Sampler.title"),
  pluginName: kPluginName,
  title: "Sampler",
  // title: tr("DG.plugin.Sampler.title"),
  dimensions: kInitialDimensions,
  preventDataContextReorg: false,

};

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (): IDevice => ({id: createId(), name: "output", deviceType: "mixer", variables: {"a": 100}});

export const App = () => {
  const [selectedTab, setSelectedTab] = useState<NavTab>("Model");
  const [model, setModel] = useImmer<IModel>({columns: []});
  const [selectedDeviceId, setSelectedDeviceId] = useState<Id|undefined>(undefined);

  useEffect(() => {
    localeInit();
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
  }, []);

  // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
  useEffect(() => {
    setModel({columns: [{devices: [createDefaultDevice()]}], experimentNum: 0});
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
    let sampleNum = 1;
    const experimentNum = model.experimentNum ? model.experimentNum + 1 : 1;
    const sampleSizeEl = document.getElementById("sample_size");
    const sampleSize: number = (sampleSizeEl?.textContent && parseInt(sampleSizeEl.textContent, 10)) || 1;
    const firstDevice: IDevice = (model.columns[0].devices[0]);
    const firstDeviceType: string = (firstDevice.deviceType).charAt(0).toUpperCase() + (firstDevice.deviceType).slice(1);
    const experiment: IExperiment = {experimentAttr: experimentNum, descriptionAttr: firstDevice.name, sampleSize};
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
      result.experiment = experimentNum;
      result["sample size"] = sampleSize;
      result.description = firstDeviceType;
      result.sample = sampleNum;
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
