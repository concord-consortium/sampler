import { createContext, useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { AttrMap, IGlobalState, IGlobalStateContext } from "../types";
import { addDataContextChangeListener, codapInterface, IInitializePlugin, initializePlugin } from "@concord-consortium/codap-plugin-api";
import { createDefaultDevice } from "../models/device-model";
import { kInitialDimensions, kPluginName, kVersion } from "../contants";
import { createId } from "../utils/id";
import { migrateModel, removeMissingDevicesFromFormulas } from "../helpers/model-helpers";
import { ensureMinimumDimensions } from "../helpers/codap-helpers";

const defaultAttrMap: AttrMap = {
  experiment: {codapID: null, name: "experiment"},
  description: {codapID: null, name: "description"},
  sample_size: {codapID: null, name: "sample size"},
  experimentHash: {codapID: null, name: "experimentHash"},
  sample: {codapID: null, name: "sample"},
};

export const getDefaultState = (): IGlobalState => {
  return {
    model: {columns: [{name: "output", id: createId(), devices: [createDefaultDevice()]}]},
    selectedTab: "Model",
    selectedDeviceId: undefined,
    repeat: false,
    replacement: true,
    sampleSize: "5",
    numSamples: "3",
    enableRunButton: true,
    attrMap: defaultAttrMap,
    dataContexts: [],
    dataContextName: "",
    samplerContext: undefined,
    collectorContext: undefined,
    isRunning: false,
    isPaused: false,
    speed: 1
  };
};

export const useGlobalStateContextValue = (): IGlobalStateContext => {
  const [globalState, setGlobalState] = useImmer<IGlobalState>(getDefaultState());

  useEffect(() => {
    const init = async () => {
      const options: IInitializePlugin = {pluginName: kPluginName, version: kVersion, dimensions: kInitialDimensions};
      // In the current @concord-consortium/codap-plugin-api library dimensions are required but are optional in the underlying CODAP api.
      // Sending the dimensions overrides any saved dimensions in a document so we are not going to send them.
      // Using the delete, after casting to any, lets us typecheck the options instead of casting the options to any at the initializePlugin call.
      delete (options as any).dimensions;
      const interactiveState = await initializePlugin(options);

      // ensure that the plugin has the minimum dimensions
      await ensureMinimumDimensions(kInitialDimensions);

      if (Object.keys(interactiveState || {}).length > 0) {
        // ensure there is a experiment hash on existing documents created before that attribute was added
        const newGlobalState = interactiveState as IGlobalState;
        if (!newGlobalState.attrMap.experimentHash) {
          newGlobalState.attrMap.experimentHash = {...defaultAttrMap.experimentHash};
        }

        // remove any devices that don't exist from formulas (to fix bug in previous saved documents)
        removeMissingDevicesFromFormulas(newGlobalState.model);

        // set the default values for any new attributes
        migrateModel(newGlobalState.model);

        setGlobalState(draft => {
          return newGlobalState;
        });
      } else {
        setGlobalState(draft => {
          const newColumnId = createId();
          draft.model = {
            columns: [
              {name: "output", id: newColumnId, devices: [createDefaultDevice()]}
            ]
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
      addDataContextChangeListener(globalState.samplerContext.name, (msg: any) => {
        if (msg.values.operation === "updateAttributes") {
          msg.values.result.attrIDs.forEach((id: string, i: number) => {
            const newName = msg.values.result.attrs[i].name;
            setGlobalState((draft) => {
              const columnId = Object.keys(draft.attrMap).find(key => draft.attrMap[key].codapID === id);
              const column = draft.model.columns.find(c => c.id === columnId);
              if (columnId && column) {
                draft.attrMap[columnId].name = newName;
                column.name = newName;
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
