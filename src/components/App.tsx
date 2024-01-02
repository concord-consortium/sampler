import React, { useEffect, useState } from "react";
import {
  initializePlugin,
  createItems,
  codapInterface
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IExperiment, IModel, IRunResult, ISample, getDeviceById, getDeviceColumnIndex } from "../models/model-model";
import { IDevice, IVariables, extractProportionalKeys } from "../models/device-model";
import { Id, createId } from "../utils/id";
import { deleteAll, findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";

import "./App.scss";

const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: 328,
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

  useEffect(() => {
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

  const handleUpdateVariables = (variables: IDevice["variables"]) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === selectedDeviceId));
      if (columnIndex !== -1) {
        const deviceToUpdate = draft.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.variables = variables;
        }
      }
    });
  }

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

  const handleUpdateViewType = (viewType: IDevice["viewType"]) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === selectedDeviceId));
      if (columnIndex !== -1) {
        const deviceToUpdate = draft.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.viewType = viewType;
        }
      }
    });
  };

  const handleAddVariable = () => {
    const getNextVariable = (vars: IVariables): string => {
      const keys = Object.keys(vars);
      const isNumeric = keys.every(key => !isNaN(Number(key)));

      if (isNumeric) {
          const maxKey = Math.max(...keys.map(Number));
          return (maxKey + 1).toString();
      } else {
          const maxChar = keys.reduce((max, key) => {
              if (key >= "a" && key < "z" || key >= "A" && key < "Z") {
                  return max < key ? key : max;
              }
              return max;
          }, "0");
          return String.fromCharCode(maxChar.charCodeAt(0) + 1);
      }
    };

    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;
      const varKeys = Object.keys(variables);
      const newPcts: IVariables = {};
      const newVariable = getNextVariable(variables);

      if (viewType === "spinner") {
        const numUnique = varKeys.length;
        const newFraction = 1 / (numUnique + 1);
        varKeys.map((v) => {
          const currentPct = (varKeys.filter((variable) => variable === v).length / numUnique) * 100;
          const amtToSubtract = currentPct * newFraction;
          newPcts[v] = currentPct - amtToSubtract;
        });
        newPcts[newVariable] = newFraction * 100;
      }

      // else if (viewType === "mixer") {
      //   const variablesAsArray = extractProportionalKeys(variables);
      //   const newFraction = 1 / (variablesAsArray.length + 1);
      //   variablesAsArray.map((v) => {
      //     const currentPct = (variablesAsArray.filter((variable) => variable === v).length / variablesAsArray.length) * 100;
      //     const amtToSubtract = currentPct * newFraction;
      //     newPcts[v] = currentPct - amtToSubtract;
      //   });
      //   newPcts[newVariable] = newFraction * 100;
      // }

      const sumOfNewPcts = Object.keys(newPcts).reduce((sum, v) => sum + newPcts[v], 0);
      let discrepancy = 100 - sumOfNewPcts;
      while (discrepancy !== 0) {
        const sign = discrepancy > 0 ? 1 : -1;
        const index = Math.floor(Math.random() * Object.keys(newPcts).length);
        newPcts[Object.keys(newPcts)[index]] += sign;
        discrepancy -= sign;
      }
      handleUpdateVariables(newPcts);
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
            handleAddVariable={handleAddVariable}
            handleUpdateViewType={handleUpdateViewType}
          />
        }
        {selectedTab === "Measures" && <MeasuresTab />}
        {selectedTab === "About" && <AboutTab />}
      </div>
    </div>
  );
};
