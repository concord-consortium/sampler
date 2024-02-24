import { createContext, useContext, useEffect } from "react";
import { Updater, useImmer } from "use-immer";
import { AttrMap, IGlobalState } from "../types";
import { addDataContextChangeListener, codapInterface, initializePlugin } from "@concord-consortium/codap-plugin-api";
import { createDefaultDevice } from "../models/device-model";
import { kDataContextName, kInitialDimensions, kPluginName, kVersion } from "../contants";
import { createId } from "../utils/id";

const defaultAttrMap: AttrMap = {
  experiment: {codapID: null, name: "experiment"},
  description: {codapID: null, name: "description"},
  sample_size: {codapID: null, name: "sample size"},
  sample: {codapID: null, name: "sample"},
};


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
    enableRunButton: true,
    attrMap: defaultAttrMap,
    dataContexts: [],
    samplerContext: undefined,
    collectorContext: undefined
  };
};

export interface IGlobalStateContext {
  globalState: IGlobalState;
  setGlobalState: Updater<IGlobalState>;
}

export const useGlobalStateContextValue = (): IGlobalStateContext => {
  const [globalState, setGlobalState] = useImmer<IGlobalState>(getDefaultState());

  useEffect(() => {
    const init = async () => {
      const interactiveState = await initializePlugin({pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions});
      if (Object.keys(interactiveState || {}).length > 0) {
        setGlobalState(draft => {
          return interactiveState;
        });
      } else {
        setGlobalState(draft => {
          const newColumnId = createId();
          draft.model = {
            columns: [
              {name: "output", id: newColumnId, devices: [createDefaultDevice()]}
            ],
            experimentNum: 0
          };
          draft.attrMap[newColumnId] = {codapID: null, name: "output"};
        });
      }
    };

    init();
  }, [setGlobalState]);

  useEffect(() => {
    codapInterface.updateInteractiveState(globalState);
  }, [globalState]);

  useEffect(() => {
    if (globalState.samplerContext) {
      addDataContextChangeListener(kDataContextName, (msg: any) => {
        if (msg.values.operation === "updateAttributes") {
          msg.values.result.attrIDs.forEach((id: string, i: number) => {
            const newName = msg.values.result.attrs[i].name;
            setGlobalState((draft) => {
              const attrKey = Object.keys(draft.attrMap).find(key => draft.attrMap[key].codapID === id);
              if (attrKey) {
                draft.attrMap[attrKey].name = newName;
                const column = draft.model.columns.find(c => c.id === attrKey);
                console.log("column", column, newName);
                // also update the name of the column in the model
                if (column) {
                  console.log("in if statement");
                  column.name = newName;
                }
              }
            });
          });
        }
      });
    }

  }, [globalState.samplerContext, setGlobalState]);

  return {
    globalState,
    setGlobalState
  };
};

// note: the "setGlobalState: () => undefined" is fine as it is overridden in the AppContainer.Provider tag
export const GlobalStateContext = createContext<IGlobalStateContext>({globalState: getDefaultState(), setGlobalState: () => undefined});
export const useGlobalStateContext = () => useContext(GlobalStateContext);
