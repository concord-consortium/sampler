import { createContext, useContext } from "react";
import { Updater, useImmer } from "use-immer";
import { IGlobalState } from "../types";

export const getDefaultState = (): IGlobalState => {
  return {
    model: {columns: []},
    selectedTab: "Model",
    selectedDeviceId: undefined,
    repeat: false,
    replacement: false,
    sampleSize: "5",
    numSamples: "3",
    createNewExperiment: true,
    enableRunButton: true
  };
};

export interface IGlobalStateContext {
  globalState: IGlobalState;
  setGlobalState: Updater<IGlobalState>;
}

export const useGlobalStateContextValue = (): IGlobalStateContext => {
  const [globalState, setGlobalState] = useImmer<IGlobalState>(getDefaultState());

  return {
    globalState,
    setGlobalState
  };
};

// note: the "setGlobalState: () => undefined" is fine as it is overridden in the AppContainer.Provider tag
export const GlobalStateContext = createContext<IGlobalStateContext>({globalState: getDefaultState(), setGlobalState: () => undefined});
export const useGlobalStateContext = () => useContext(GlobalStateContext);
