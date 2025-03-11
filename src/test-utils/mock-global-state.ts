import { 
  AttrMap, 
  IAttrForMap, 
  IGlobalState,
  NavTab, 
  Speed, 
  ViewType 
} from "../types";

/**
 * Extended global state interface for testing
 */
export interface IMockGlobalState extends IGlobalState {
  instanceId?: string;
  dataContextName?: string;
}

/**
 * Creates a mock attribute for the attribute map
 * @param name The name of the attribute
 * @returns A mock attribute
 */
const createMockAttr = (name: string): IAttrForMap => ({
  codapID: null,
  name
});

/**
 * Creates a mock attribute map
 * @returns A mock attribute map
 */
const createMockAttrMap = (): AttrMap => ({
  experiment: createMockAttr("experiment"),
  description: createMockAttr("description"),
  sample_size: createMockAttr("sample_size"),
  experimentHash: createMockAttr("experimentHash"),
  sample: createMockAttr("sample"),
  output: createMockAttr("output")
});

/**
 * Creates a mock global state for testing
 * @returns A mock global state
 */
export const createMockGlobalState = (options?: Partial<IMockGlobalState>): IMockGlobalState => {
  const state: IMockGlobalState = {
    model: {
      columns: [{
        name: "Column 1",
        id: "column1",
        devices: [{
          id: "device1",
          viewType: ViewType.Mixer,
          variables: ["a", "b"],
          collectorVariables: [],
          formulas: {},
          hidden: false,
          lockPassword: ""
        }]
      }]
    },
    selectedDeviceId: "device1",
    selectedTab: "Model" as NavTab,
    repeat: false,
    replacement: true,
    sampleSize: "5",
    numSamples: "10",
    enableRunButton: true,
    attrMap: createMockAttrMap(),
    dataContexts: [],
    collectorContext: undefined,
    samplerContext: undefined,
    isRunning: false,
    isPaused: false,
    speed: Speed.Medium,
    isModelHidden: false,
    modelLocked: false,
    modelPassword: "",
    showPasswordModal: false,
    passwordModalMode: "set",
    repeatUntilCondition: "",
    dataContextName: "Sampler Data",
    instanceId: "sampler-test",
    reduceMotion: false
  };
  
  // Override with any provided options
  return { ...state, ...options };
}; 
