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

export type DeviceAnimationStep = {
  kind: "device",
  duration: number,
  id: Id,
  selectedVariable: string,
};

export type ArrowAnimationStep = {
  kind: "arrow"
};

export type FinalAnimationStep = {
  kind: "final"
};

export type AnimationStep = {
  duration: number,
  onComplete?: (() => Promise<void>) | (() => void),
} & (DeviceAnimationStep | ArrowAnimationStep | FinalAnimationStep);

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
