import { Updater } from "use-immer";

export type Id = string;

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

export interface IAttrForMap {
  codapID: string | null;
  name: string;
}

export interface AttrMap {
  experiment: IAttrForMap;
  description: IAttrForMap;
  sample_size: IAttrForMap;
  until_formula: IAttrForMap;
  experimentHash: IAttrForMap;
  sample: IAttrForMap;
  [key: string]: IAttrForMap;
}

export enum Speed {
  Slow = 0,
  Medium = 1,
  Fast = 2,
  Fastest = 3
}

export const speedLabels: Record<Speed, string> = {
  [Speed.Slow]: "Slow",
  [Speed.Medium]: "Medium",
  [Speed.Fast]: "Fast",
  [Speed.Fastest]: "Fastest"
};

export type ModelChangedAnimationStep = {
  kind: "modelChanged"
};
export type StartExperimentAnimationStep = {
  kind: "startExperiment",
  numSamples: number
  numItems: number
};
export type EndExperimentAnimationStep = {
  kind: "endExperiment"
};
export type StartSampleAnimationStep = {
  kind: "startSample"
  sampleIndex: number;
};
export type EndSampleAnimationStep = {
  kind: "endSample"
};
export type StartSelectItemAnimationStep = {
  kind: "startSelectItem"
};
export type EndSelectItemAnimationStep = {
  kind: "endSelectItem";
  variables: string[];
};
export type CollectVariablesAnimationStep = {
  kind: "collectVariables";
  variables: string[];
};
export type PushVariablesAnimationStep = {
  kind: "pushVariables";
};

export type DeviceAnimationStep = {
  kind: "animateDevice";
  deviceId: Id;
  selectedVariable: string;
  selectedVariableIndex: number;
  hideAfter: boolean;
};

export type ArrowAnimationStep = {
  kind: "animateArrow"
  sourceDeviceId: Id;
  targetDeviceId: Id;
};

export type LabelAnimationStep = {
  kind: "showLabel";
  columnIndex: number;
  selectedVariable: string;
};


export type AnimationStep = {
  onComplete?: (() => Promise<void>) | (() => void),
} & (
  ModelChangedAnimationStep |
  StartExperimentAnimationStep |
  EndExperimentAnimationStep |
  StartSampleAnimationStep |
  EndSampleAnimationStep |
  StartSelectItemAnimationStep |
  EndSelectItemAnimationStep |
  DeviceAnimationStep |
  ArrowAnimationStep |
  LabelAnimationStep |
  CollectVariablesAnimationStep |
  PushVariablesAnimationStep
);

export interface IAnimationStepSettings {
  t: number;
  speed: Speed;
}

export type AnimationCallback = (step: AnimationStep, settings?: IAnimationStepSettings) => void;
export type UnregisterAnimationCallbackFn = () => void;
export type RegisterAnimationCallbackFn = (animationCallback: AnimationCallback) => UnregisterAnimationCallbackFn;

export interface ITPSamplerPluginState {
  experimentNumber: number,
  mostRecentRunNumber: number,
  variables: string[],
  draw: string,
  repeat: string,
  speed: number,
  device: string,
  deviceName: string,
  withReplacement: boolean,
  hidden: boolean,
  password: string|null,
  dataSetName: string,
  previousExperimentDescription: string,
  previousSampleSize: string
}

export interface IGlobalState {
  model: IModel;
  selectedDeviceId: Id | undefined;
  selectedTab: NavTab;
  repeat: boolean;
  replacement: boolean;
  sampleSize: string;
  numSamples: string;
  enableRunButton: boolean;
  attrMap: AttrMap;
  dataContextName: string;
  collectorContextName: string;
  samplerContext: IDataContext | undefined;
  isRunning: boolean;
  isPaused: boolean;
  speed: Speed;
  untilFormula: string;
}

export interface ITransientState {
  dataContexts: Array<IDataContext>;
}

export type ISampleAnimationResults = {
  sampleNumber: number;
  results: ISampleResults;
  resultsVariableIndex: ISampleVariableIndexes;
};
export type IExperimentAnimationResults = ISampleAnimationResults[][];
export type ISampleResults = {[key: string]: any};
export type ISampleVariableIndexes = Record<Id, number>;
export type IExperimentResults = ISampleResults[];

export interface ICollection {
  areParentChildLinksConfigured: boolean,
  attrs: Array<any>,
  caseName: string,
  cases: Array<any>,
  childAttrName: string,
  collapseChildren: boolean,
  defaults: any,
  guid: number,
  id: number,
  labels: any,
  name: string,
  parent: number,
  title: string,
  type: string
}

export interface IAttribute {
  name: string;
  formula?: string;
  description?: string;
  type?: string;
  cid?: string;
  precision?: string;
  unit?: string;
  editable?: boolean;
  renameable?: boolean;
  deleteable?: boolean;
  hidden?: boolean;
}

export interface IVariableLocation {
  lastPercent: number;
  currPercent: number;
}

export interface ITextBackerPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IAnimationContext {
  handleStartRun: () => Promise<void>
  handleTogglePauseRun: (pause: boolean) => Promise<void>
  handleStopRun: () => Promise<void>
  registerAnimationCallback: RegisterAnimationCallbackFn
}

export interface IAnimationRuntime {
  frame: number,
  steps: AnimationStep[],
  stepIndex: number,
  elapsed?: number,
  lastTimestamp?: number,
  mode: "running"|"paused"|"stopped"
}

export enum ViewType {
  Mixer = "mixer",
  Spinner = "spinner",
  Collector = "collector"
}

export type View = ViewType.Mixer | ViewType.Spinner | ViewType.Collector;

export interface IDevice {
  id: Id;
  viewType: View;
  variables: IVariables;
  collectorVariables: ICollectorVariables;
  formulas: Record<string, string>;
  hidden: boolean;
  lockPassword: string;
}

// a map of variables to their percentages
// i.e.: { a: 50, b: 50 }
// the view (mixer / spinner) decides how to best represent these percentages
export type IVariables = Array<string>;
// a map of attributes to their values
// { "Mammal": "Dog", "Color": "Brown"}
export interface ICollectorItem {
  [attr: string]: string | number;
}

// an array of items that come from a linked dataset
// i.e.: [ { "Mammal": "Dog", "Color": "Brown"}, { "Mammal": "Cat", "Color": "Black"} ]
// the collector view will represent the values of the first key-value pair of each object in the array
// i.e., one ball for "Dog", one ball for "Cat"
// if "Dog" is selected by the collector, the entire item is sent to CODAP
export type ICollectorVariables = Array<ICollectorItem>;
export interface IDataContext {
  guid: number;
  id: number;
  name: string;
  title: string;
}

export interface IItem {
  id: number;
  values: ICollectorItem;
}

export type IItems = Array<IItem>;

export type ClippingDef = { id: string, element: JSX.Element };

export interface IColumn {
  name: string;
  id: Id;
  devices: IDevice[];
}

export interface IModel {
  columns: IColumn[];
}

export interface IExperiment {
  experimentAttr: number;
  descriptionAttr: string;
  sampleSizeAttr: number;
}

export interface ISample {
  [sampleAttr: string]: number;
}
// as model runs, new key-value pairs are added to the result object
export interface IRunResult {
  [attr: string]: string | number;
}

export type DeviceMap = Record<Id,IDevice>;

export interface IGlobalStateContext {
  globalState: IGlobalState;
  setGlobalState: Updater<IGlobalState>;
}

export interface ITransientStateContext {
  globalState: ITransientState;
  setTransientState: Updater<ITransientState>;
}

export type ResizerListener = () => void;

export interface IBallPosition {
  x: number;
  y: number;
  vy: number;
  vx: number;
  transform: string;
  visibility: "visible" | "hidden";
}

export interface IFinalPosition {
  x: number;
  y: number;
  vy: number;
  vx: number;
  radius: number;
}
export interface IFinalPositionInput extends IFinalPosition {
  dx: number;
  dy: number;
}

export interface IPoint {
  x: number
  y: number;
}

export interface IGetNewPcts {
  newPct: number;
  oldPct: number;
  selectedVar: string;
  variables: IVariables;
  updateNext?: boolean;
}

export type AvailableDeviceVariables = Record<Id, IVariables>;
export type AvailableDeviceVariableIndexes = Record<Id, number[]>;
