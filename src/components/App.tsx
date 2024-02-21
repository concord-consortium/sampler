import React, { useEffect, useState } from "react";
import { initializePlugin, createItems } from "@concord-consortium/codap-plugin-api";
import { useImmer } from "use-immer";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { IModel, getDeviceById, getDeviceColumnIndex } from "../models/model-model";
import { IDevice, IVariables } from "../models/device-model";
import { Id, createId } from "../utils/id";
import { deleteAll, findOrCreateDataContext, kDataContextName } from "../utils/codap-helpers";
import { createNewVarArray, getNewVariable, getProportionalVars, getRandomElement } from "./helpers";

import "./App.scss";

export const kPluginMidWidth = 328;
const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: kPluginMidWidth,
  height: 500
};
const kDefaultVars: IVariables = ["a", "a", "b"];
const kMinColumnWidth = 220; // device + gap width
const kSelectedSamplesDivWidth = 65; //includes margin-right

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const createDefaultDevice = (): IDevice => ({id: createId(), viewType: "mixer", variables: kDefaultVars, collectorVariables: []});

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
  const modelWidth = (model.columns.length * kMinColumnWidth) + kSelectedSamplesDivWidth;
  const modelHeaderStyle = {width: modelWidth};
  const navTabsEl = document.getElementsByClassName("navigationTabs")[0] as HTMLElement;

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
  }, []);

  // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
  useEffect(() => {
    setModel({columns: [{name: "output", devices: [createDefaultDevice()]}], experimentNum: 0});
  }, [setModel]);

  useEffect(()=>{
    setSelectedDeviceId(lastDeviceId);
  }, [lastDeviceId]);

  useEffect(() => {
    if (navTabsEl && modelWidth) {
      navTabsEl.style.setProperty("--after-width", `${modelWidth + 25}px`);
    }
  },[modelWidth, navTabsEl]);

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
        draft.columns.splice(newColumnIndex, 0, {name: "output", devices: [newDevice]});
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

  const handleNameChange = (deviceId: Id, newName: string) => {
    setModel(draft => {
      const column = draft.columns.find(c => c.devices.find(d => d.id === deviceId));
      if (column) {
        column.name = newName;
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

  const getResults = (experimentNum: number): { [key: string]: string|number }[] => {
    const results: { [key: string]: string|number }[] = [];
    for (let sampleIndex = 0; sampleIndex < Number(numSamples); sampleIndex++) {
      for (let i = 0; i < Number(sampleSize); i++) {
        const sample: { [key: string]: string|number } = {};
        model.columns.forEach(column => {
          // to-do: pick a device based on the user formula if there is one defined
          const device = column.devices.length > 1 ? getRandomElement(column.devices): column.devices[0];
          const variable = getRandomElement(device.variables);
          sample[column.name] = variable;
          sample.experiment = experimentNum;
          sample.sample = sampleIndex + 1;
          const deviceStr = device.viewType.charAt(0).toUpperCase() + device.viewType.slice(1);
          sample.description = `${deviceStr} containing ${numSamples} items${replacement ? " (with replacement)" : ""}`;
          sample["sample size"] = sampleSize && parseInt(sampleSize, 10);
        });
        results.push(sample);
      }
    }
    return results;
  };

  const getAttrKeys = () => {
    const attrKeys: string[] = [];
    model.columns.forEach(column => {
        attrKeys.push(column.name);
    });
    return attrKeys;
  };

  const handleStartRun = async () => {
    // proof of concept that we can "run" the model and add items to CODAP
    setEnableRunButton(false);
    const experimentNum = model.experimentNum
    ? createNewExperiment
        ? model.experimentNum + 1
        : model.experimentNum
    : 1;
    const results = getResults(experimentNum);
    const attrKeys = getAttrKeys();
    const ctxRes = await findOrCreateDataContext(attrKeys);
    if (ctxRes === "success") {
      await createItems(kDataContextName, results);
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

  const handleDeleteVariable = (e: React.MouseEvent, selectedVariable?: string) => {
    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;

      if ([...new Set(variables)].length === 1) {
        return;
      }

      let newVariables: IVariables = [];
      if (viewType === "mixer") {
        newVariables.push(...variables.slice(0, variables.length - 1));
      } else {
        if (selectedVariable) {
          newVariables.push(...variables.filter((v) => v !== selectedVariable));
        } else {
          const lastVariable = variables[variables.length - 1];
          newVariables.push(...variables.filter((v) => v !== lastVariable));
        }
      }
      handleUpdateVariables(newVariables);
    }
  };

  const handleAddVariable = () => {
    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;
      if (viewType === "spinner") {
        handleUpdateVariables(getProportionalVars(variables));
      } else {
        const newVariable = getNewVariable(variables);
        handleUpdateVariables([...variables, newVariable]);
      }
    }
  };

  const handleEditVariable = (oldVariableIdx: number, newVariableName: string) => {
    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { viewType, variables } = selectedDevice;
      const newVariables: IVariables = [];
      if (viewType === "mixer" || viewType === "collector") {
        newVariables.push(...variables);
        newVariables[oldVariableIdx] = newVariableName;
      } else {
        const oldVariableName = variables[oldVariableIdx];
        newVariables.push(...variables.map((v) => v === oldVariableName ? newVariableName : v));
      }
      handleUpdateVariables(newVariables);
    }
  };

  const handleEditVarPct = (variableIdx: number, pctStr: string, updateNext?: boolean) => {
    if (model && selectedDeviceId) {
      const selectedDevice = getDeviceById(model, selectedDeviceId);
      const { variables } = selectedDevice;
      const selectedVar = variables[variableIdx];
      const newVariables = createNewVarArray(selectedVar, variables, Number(pctStr), updateNext);
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
        {selectedTab === "Model" ?
          <ModelTab
            model={model}
            selectedDeviceId={selectedDeviceId}
            repeat={repeat}
            sampleSize={sampleSize}
            numSamples={numSamples}
            enableRunButton={enableRunButton}
            modelHeaderStyle={modelHeaderStyle}
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
            handleEditVariable={handleEditVariable}
            handleEditVarPct={handleEditVarPct}
          /> :
          selectedTab === "Measures" ?
          <MeasuresTab /> :
          <AboutTab />
        }
      </div>
    </div>
  );
};
