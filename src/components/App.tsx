import React, { useEffect, useState } from "react";
import {
  initializePlugin,
  createItems,
  codapInterface
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";
import { ModelTab } from "./model/model-component";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { IExperiment, IModel, IRunResult, ISample, getDeviceColumnIndex } from "../models/model-model";
import { IDevice, IVariables } from "../models/device-model";
import { Id, createId } from "../utils/id";
import { deleteAll, findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";

import "./App.scss";

export const kPluginMidWidth = 328;
const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: kPluginMidWidth,
  height: 500
};
// const targetDataSetName = tr("DG.plugin.Sampler.dataset.name") || "Sampler";
const targetDataSetName = "Sampler";
const kDefaultDeviceVariables: IVariables = { "a": 33, "b": 33, "c": 33};


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

export const createDefaultDevice = (): IDevice => ({id: createId(), name: "output", viewType: "mixer", variables: {"a": 67, "b": 33}, collectorVariables: []});

export const App = () => {
  const [selectedTab, setSelectedTab] = useState<NavTab>("Model");
  const [model, setModel] = useImmer<IModel>({columns: []});
  const [selectedDeviceId, setSelectedDeviceId] = useState<Id|undefined>(undefined);
  const [repeat, setRepeat] = useState(false);
  const [replacement, setReplacement] = useState(true);
  const [sampleSize, setSampleSize] = useState<string>("5");
  const [numSamples, setNumSamples] = useState<string>("3");
  const [createNewExperiment, setCreateNewExperiment] = useState(true);
  const [enableRunButton, setEnableRunButton] = useState(true);
  const numColumns = model.columns.length;
  const lastColumn = model.columns[numColumns - 1];
  const numDevicesInLastColumn = lastColumn?.devices?.length;
  const lastDeviceId = lastColumn?.devices?.[numDevicesInLastColumn - 1].id;

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
  }, []);

  // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
  useEffect(() => {
    setModel({columns: [{devices: [createDefaultDevice()]}], experimentNum: 0});
  }, [setModel]);

  useEffect(()=>{
    setSelectedDeviceId(lastDeviceId);
  }, [lastDeviceId]);

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
    setCreateNewExperiment(true);
  };

  const handleMergeDevices = (device: IDevice) => {
    setModel(draft => {
      const columnIndex = getDeviceColumnIndex(draft, device);
      if (columnIndex !== -1) {
        // remove the other devices
        draft.columns[columnIndex].devices.splice(0, draft.columns[columnIndex].devices.length, device);
      }
    });
    setCreateNewExperiment(true);
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
        setCreateNewExperiment(true);
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

  const handleUpdateCollectorVariables = (collectorVariables: IDevice["collectorVariables"]) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === selectedDeviceId));
      if (columnIndex !== -1) {
        const deviceToUpdate = draft.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.collectorVariables = collectorVariables;
        }
      }
    });
  };

  const handleSelectRepeat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRepeat(e.target.value === "repeat");
    setCreateNewExperiment(true);
  };

  const handleSelectReplacement = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReplacement(e.target.value === "with");
    setCreateNewExperiment(true);
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSampleSize(e.target.value);
    if (e.target.value !== null) {
      if (Number(e.target.value)) {
        setCreateNewExperiment(true);
        setEnableRunButton(true);
      } else {
        setEnableRunButton(false);
      }
    } else {
      setEnableRunButton(false);
    }
  };

  const handleNumSamplesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumSamples(e.target.value);
    if (e.target.value !== null) {
      if (Number(e.target.value)) {
        setCreateNewExperiment(true);
        setEnableRunButton(true);
      } else {
        setEnableRunButton(false);
      }
    } else {
      setEnableRunButton(false);
    }
  };

  const handleStartRun = async () => {
    // proof of concept that we can "run" the model and add items to CODAP
    let sampleNum = 1;
    setEnableRunButton(false);
    const experimentNum = model.experimentNum
                            ? createNewExperiment
                                ? model.experimentNum + 1
                                : model.experimentNum
                            : 1;
    const firstDevice: IDevice = (model.columns[0].devices[0]);
    const firstDeviceType: string = (firstDevice.viewType).charAt(0).toUpperCase() + (firstDevice.viewType).slice(1);
    const firstDeviceVariableLength = Object.keys(firstDevice.variables).length;
    const descriptionText = `${firstDeviceType} containing ${firstDeviceVariableLength} items with${replacement? "" : "out"} replacement`;
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
      result["sample size"] = sampleSize && parseInt(sampleSize, 10);
      result.description = descriptionText;
      result.sample = sampleNum;
      await createItems(kDataContextName, [result]);
      setCreateNewExperiment(false);
      setModel({columns: model.columns, experimentNum});
      setEnableRunButton(true);
    }
  };

  const handleClearData = () => {
    deleteAll();
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
            repeat={repeat}
            sampleSize={sampleSize}
            numSamples={numSamples}
            enableRunButton={enableRunButton}
            addDevice={handleAddDevice}
            mergeDevices={handleMergeDevices}
            deleteDevice={handleDeleteDevice}
            setSelectedDeviceId={setSelectedDeviceId}
            handleInputChange={handleInputChange}
            handleNameChange={handleNameChange}
            handleSampleSizeChange={handleSampleSizeChange}
            handleNumSamplesChange={handleNumSamplesChange}
            handleStartRun={handleStartRun}
            handleUpdateCollectorVariables={handleUpdateCollectorVariables}
            handleSelectRepeat={handleSelectRepeat}
            handleSelectReplacement={handleSelectReplacement}
            handleClearData={handleClearData}
          />
        }
        {selectedTab === "Measures" && <MeasuresTab />}
        {selectedTab === "About" && <AboutTab />}
      </div>
    </div>
  );
};
