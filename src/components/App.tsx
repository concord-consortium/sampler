import React, { useEffect } from "react";
import { GlobalStateContext, useGlobalStateContextValue } from "../hooks/useGlobalState";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";

import "./App.scss";

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
