import { Id } from "../utils/id";

export interface IDevice {
  id: Id;
  name: string;
  deviceType: "mixer" | "spinner" | "collector";
  variables: IVariables | ICollectorVariables;
}

// mixer / spinner
// input: IVariables
// output: {[nameOfAttr]: randomly-selected variable}
export interface IVariables {
  [variableName: string]: number;
}

// collector
// input: ICollectorVariables
// output: randomly-selected ICollectorVariable
export interface ICollectorVariable {
  [attr: string]: string | number;
}

export type ICollectorVariables = Array<ICollectorVariable>;