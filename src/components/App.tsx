import React, { useEffect } from "react";
import { GlobalStateContext, useGlobalStateContextValue } from "../hooks/useGlobalState";
import { AboutTab } from "./about/about";
import { MeasuresTab } from "./measures/measures";
import { ModelTab } from "./model/model-component";
import { PasswordModal } from "./model/password-modal";
import { SettingsMenu } from "./settings/settings-menu";
import { initializeFormulaTracker } from "../utils/formula/FormulaVariableRenaming";

import "./App.scss";

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export const App = () => {
  const globalStateContextValue = useGlobalStateContextValue();
  const { globalState, setGlobalState } = globalStateContextValue;
  const { model, selectedTab, showPasswordModal } = globalState;
  const numColumns = model.columns.length;
  const lastColumn = model.columns[numColumns - 1];
  const numDevicesInLastColumn = lastColumn?.devices?.length;
  const lastDeviceId = lastColumn?.devices?.[numDevicesInLastColumn - 1].id;

  useEffect(()=>{
    setGlobalState(draft => {
      draft.selectedDeviceId = lastDeviceId;
    });
  }, [lastDeviceId, setGlobalState]);

  // Initialize formula tracker when the app starts
  useEffect(() => {
    initializeFormulaTracker(globalState);
  }, [globalState]);

  const handleTabSelect = (tab: NavTab) => {
    setGlobalState(draft => {
      draft.selectedTab = tab;
    });
  };

  return (
    <GlobalStateContext.Provider value={globalStateContextValue}>
    <div className="App">
      {/* Skip navigation link for keyboard users */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      
      <div className="app-header">
        <div className="navigationTabs" role="navigation" aria-label="Main navigation">
          { navTabs.map((tab, index) => {
              return (
                <div key={`${index}`}
                    className={`tab ${selectedTab === tab ? "selected" : ""}`}
                    onClick={() => handleTabSelect(navTabs[index])}
                    role="tab"
                    tabIndex={0}
                    aria-selected={selectedTab === tab}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTabSelect(navTabs[index]);
                      }
                    }}
                >
                  {tab}
                </div>
              );
            })
          }
        </div>
        <div className="app-header-right">
          <SettingsMenu />
        </div>
      </div>
      <div id="main-content" className="tab-content" role="main" tabIndex={-1}>
        {selectedTab === "Model" ?
          <ModelTab /> :
          selectedTab === "Measures" ?
          <MeasuresTab /> :
          <AboutTab />
        }
      </div>
      {showPasswordModal && <PasswordModal />}
    </div>
    </GlobalStateContext.Provider>
  );
};
