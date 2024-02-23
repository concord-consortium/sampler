import { IModel } from "./models/model-model";
import { Id } from "./utils/id";

const navTabs = ["Model", "Measures", "About"] as const;
type NavTab = typeof navTabs[number];

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
}
