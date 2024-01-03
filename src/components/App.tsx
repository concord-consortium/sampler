import React, { useEffect, useState } from "react";
import {
  initializePlugin,
  createItems,
} from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IModel, IRunResult, getDeviceById, getDeviceColumnIndex } from "../models/model-model";
import { IDevice, IVariables, findCommonDenominator, findEquivNum } from "../models/device-model";
import { Id, createId } from "../utils/id";
import { deleteAll, findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";

import "./App.scss";

const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: 328,
  height: 500
};
const kDefaultVars: IVariables = ["a", "a", "b"];


const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (): IDevice => ({id: createId(), name: "output", viewType: "mixer", variables: kDefaultVars, collectorVariables: []});

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

  const handleUpdateVariables = (variables: IVariables) => {
    setModel(draft => {
      const columnIndex = draft.columns.findIndex(c => c.devices.find(d => d.id === selectedDeviceId));
      if (columnIndex !== -1) {
        const deviceToUpdate = draft.columns[columnIndex].devices.find(dev => dev.id === selectedDeviceId);
        if (deviceToUpdate) {
          deviceToUpdate.variables = variables;
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

  const handleDeleteVariable = () => {
    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;
      let newVariables: IVariables = [];
      if (viewType === "mixer") {
        newVariables.push(...variables.slice(0, variables.length - 1));
      } else {
        const lastVariable = variables[variables.length - 1];
        newVariables.push(...variables.filter((v) => v !== lastVariable));
      }
      handleUpdateVariables(newVariables);
    }
  };

  const handleAddVariable = () => {
    const getNextVariable = (vars: IVariables): string => {
      const isNumeric = vars.every(v => !isNaN(Number(v)));

      if (isNumeric) {
          const maxKey = Math.max(...vars.map(Number));
          return (maxKey + 1).toString();
      } else {
          const maxChar = vars.reduce((max, v) => {
              if (v >= "a" && v < "z" || v >= "A" && v < "Z") {
                  return max < v ? v : max;
              }
              return max;
          }, "0");
          return String.fromCharCode(maxChar.charCodeAt(0) + 1);
      }
    };

    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;
      const newVariable = getNextVariable(variables);
      let newVariables: IVariables = [];
      if (viewType === "spinner") {
        const numUnique = [...new Set(variables)].length;
        const newFraction = 1 / (numUnique + 1);
        const pctMap = [...new Set(variables)].map((v) => {
          const currentPct = (variables.filter((variable) => variable === v).length / variables.length) * 100;
          const amtToSubtract = currentPct * newFraction;
          return {variable: v, pct: Math.round(currentPct - amtToSubtract)};
        });
        pctMap.push({variable: newVariable, pct: Math.round(newFraction * 100)});
        const sumOfNewPcts = pctMap.reduce((sum, v) => sum + v.pct, 0);
        let discrepancy = 100 - sumOfNewPcts;
        while (discrepancy !== 0) {
          const sign = discrepancy > 0 ? 1 : -1;
          const index = Math.floor(Math.random() * pctMap.length);
          pctMap[index].pct += sign;
          discrepancy -= sign;
        }
        const lcd = findCommonDenominator(pctMap.map((v) => v.pct));
        pctMap.forEach((vPct) => {
          const newNum = findEquivNum(vPct.pct, lcd);
          newVariables.push(...Array.from({length: newNum}, () => vPct.variable));
        });
      } else {
        newVariables.push(...variables, newVariable);
      }
      handleUpdateVariables(newVariables);
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
            handleNameChange={handleNameChange}
            handleSampleSizeChange={handleSampleSizeChange}
            handleNumSamplesChange={handleNumSamplesChange}
            handleStartRun={handleStartRun}
            handleUpdateCollectorVariables={handleUpdateCollectorVariables}
            handleSelectRepeat={handleSelectRepeat}
            handleSelectReplacement={handleSelectReplacement}
            handleClearData={handleClearData}
            handleAddVariable={handleAddVariable}
            handleDeleteVariable={handleDeleteVariable}
            handleUpdateViewType={handleUpdateViewType}
          />
        }
        {selectedTab === "Measures" && <MeasuresTab />}
        {selectedTab === "About" && <AboutTab />}
      </div>
    </div>
  );
};
