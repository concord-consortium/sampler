import { IDataContext } from "./models/device-model";
import { IModel } from "./models/model-model";
import { Id } from "./utils/id";

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
  kind: "startExperiment"
};
export type EndExperimentAnimationStep = {
  kind: "endExperiment"
};
export type StartSampleAnimationStep = {
  kind: "startSample"
};
export type EndSampleAnimationStep = {
  kind: "endSample"
};
export type StartSelectItemAnimationStep = {
  kind: "startSelectItem"
};
export type EndSelectItemAnimationStep = {
  kind: "endSelectItem"
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

export interface IGlobalState {
  model: IModel;
  selectedDeviceId: Id | undefined;
  selectedTab: NavTab;
  repeat: boolean;
  replacement: boolean;
  sampleSize: string;
  numSamples: string;
  createNewExperiment: boolean;
  enableRunButton: boolean;
  attrMap: AttrMap;
  dataContexts: Array<IDataContext>;
  collectorContext: IDataContext | undefined;
  samplerContext: IDataContext | undefined;
  isRunning: boolean;
  isPaused: boolean;
  speed: Speed;
}

export type ISampleResultsForAnimation = {
  sampleNumber: number,
  results: ISampleResults
};
export type IExperimentResultsForAnimation = ISampleResultsForAnimation[][];
export type ISampleResults = {[key: string]: any};
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
