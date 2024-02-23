import React, { useEffect } from "react";
import { GlobalStateContext, useGlobalStateContextValue } from "../hooks/use-global-state";
import { initializePlugin  } from "@concord-consortium/codap-plugin-api";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { createDefaultDevice } from "../models/device-model";

import "./App.scss";

export const kPluginMidWidth = 328;
const kPluginName = "Sampler";
const kVersion = "v0.50";
const kInitialDimensions = {
  width: kPluginMidWidth,
  height: 500
};

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const App = () => {
  const globalStateContextValue = useGlobalStateContextValue();
  const { globalState, setGlobalState } = globalStateContextValue;
  const { model, selectedTab } = globalState;
  const numColumns = model.columns.length;
  const lastColumn = model.columns[numColumns - 1];
  const numDevicesInLastColumn = lastColumn?.devices?.length;
  const lastDeviceId = lastColumn?.devices?.[numDevicesInLastColumn - 1].id;

  useEffect(() => {
    initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
    // TODO: replace this with code that listens for the model state from CODAP - right now this just sets an initial model for development
    setGlobalState(draft => {
      draft.model = {columns: [{name: "output", devices: [createDefaultDevice()]}], experimentNum: 0};
    });
  }, [setGlobalState]);

  useEffect(()=>{
    setGlobalState(draft => {
      draft.selectedDeviceId = lastDeviceId;
    });
  }, [lastDeviceId, setGlobalState]);

  const handleTabSelect = (tab: NavTab) => {
    setGlobalState(draft => {
      draft.selectedTab = tab;
    });
  };

  return (
    <GlobalStateContext.Provider value={globalStateContextValue}>
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
          <ModelTab /> :
          selectedTab === "Measures" ?
          <MeasuresTab /> :
          <AboutTab />
        }
      </div>
    </div>
    </GlobalStateContext.Provider>

  );
};
