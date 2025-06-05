import { createContext, useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { IColumn, IGlobalState, IGlobalStateContext, ITPSamplerPluginState, Speed, ViewType } from "../types";
import { addDataContextChangeListener, codapInterface, IInitializePlugin, initializePlugin } from "@concord-consortium/codap-plugin-api";
import { createDefaultDevice, createDevice } from "../models/device-model";
import { kInitialDimensions, kPluginName, kVersion } from "../constants";
import { createId } from "../utils/id";
import { removeMissingDevicesFromFormulas } from "../helpers/model-helpers";
import { ensureMinimumDimensions, setDimensions } from "../helpers/codap-helpers";
import { isCollectorOnlyModel } from "../utils/collector";
import { defaultAttrMap } from "../utils/attr-map";

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
    dataContextName: "",
    collectorContextName: "",
    samplerContext: undefined,
    isRunning: false,
    isPaused: false,
    speed: 1,
    untilFormula: ""
  };
};

export const migrateOrCreateInteractiveState = (interactiveState: any, defaultGlobalState: IGlobalState): IGlobalState => {
  const hasExistingState = Object.keys(interactiveState || {}).length > 0;

  // use the default state if there is no existing state
  if (!hasExistingState) {
    const firstColumn: IColumn = defaultGlobalState.model.columns[0];
    interactiveState = {
      ...defaultGlobalState,
      attrMap: {
        ...defaultGlobalState.attrMap,
        [firstColumn.id]: {codapID: null, name: firstColumn.name}
      }
    };
  }

  // since there are no versioning of the plugin state use the existence of the device property to determine if the state from v1
  if (interactiveState.device) {
    const oldPluginState = interactiveState as ITPSamplerPluginState;
    const oldSpeed = oldPluginState.speed;
    const oldDevice = oldPluginState.device;
    const speed: Speed = oldSpeed < 1 ? Speed.Slow : oldSpeed < 2 ? Speed.Medium : oldSpeed < 3 ? Speed.Fast : Speed.Fastest;
    const viewType = oldDevice === "collector" ? ViewType.Collector : oldDevice === "spinner" ? ViewType.Spinner : ViewType.Mixer;

    // generate a model from the v1 settings
    const firstColumn: IColumn = {
      name: oldPluginState.deviceName ?? "output",
      id: createId(),
      devices: [createDevice({
        viewType,
        variables: oldPluginState.variables ?? defaultGlobalState.model.columns[0].devices[0].variables,
        hidden: oldPluginState.hidden ?? false,
        lockPassword: oldPluginState.password ?? ""
      })]
    };

    interactiveState = {...defaultGlobalState,
      numSamples: String(oldPluginState.repeat ?? defaultGlobalState.numSamples),
      sampleSize: String(oldPluginState.draw ?? defaultGlobalState.sampleSize),
      speed,
      replacement: oldPluginState.withReplacement ?? true,
      dataContextName: oldPluginState.dataSetName ?? "",
      model: {
        columns: [firstColumn]
      },
      attrMap: {
        ...defaultGlobalState.attrMap,
        [firstColumn.id]: {codapID: null, name: firstColumn.name}
      }
    };
  }

  return interactiveState;
};

export const migrateState = (state: IGlobalState) => {
  state.model.columns.forEach(column => {
    column.devices.forEach(device => {

      // ensure all devices have a hidden and lockPassword attribute
      if (device.hidden === undefined) {
        device.hidden = false;
      }
      if (device.lockPassword === undefined) {
        device.lockPassword = "";
      }
    });
  });

  // ensure the state has the default until formula values
  if (state.untilFormula === undefined) {
    state.untilFormula = "";
  }
  if (state.attrMap.until_formula === undefined) {
    state.attrMap.until_formula = defaultAttrMap.until_formula;
  }
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

      // migrate the existing interactive state or create a new one if it doesn't exist
      const newGlobalState = migrateOrCreateInteractiveState(interactiveState, getDefaultState());

      if (interactiveState === undefined) {
        // if this is a new document use the initial dimensions
        await setDimensions(kInitialDimensions);
      } else {
        // otherwise ensure that the plugin in the loaded document has the minimum dimensions
        await ensureMinimumDimensions(kInitialDimensions);
      }

      // ensure there is a experiment hash on existing documents created before that attribute was added
      if (!newGlobalState.attrMap.experimentHash) {
        newGlobalState.attrMap.experimentHash = {...defaultAttrMap.experimentHash};
      }

      // remove any devices that don't exist from formulas (to fix bug in previous saved documents)
      removeMissingDevicesFromFormulas(newGlobalState.model);

      // set the default values for any new attributes
      migrateState(newGlobalState);

      if (isCollectorOnlyModel(newGlobalState.model)) {
        newGlobalState.enableRunButton = newGlobalState.collectorContextName !== "";
      }

      setGlobalState(newGlobalState);
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
