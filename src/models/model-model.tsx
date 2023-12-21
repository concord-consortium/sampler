import { IDevice } from "./device-model";

export interface IColumn {
  devices: IDevice[];
}

export interface IModel {
  columns: IColumn[];
}

// as model runs, new key-value pairs are added to the result object
export interface IRunResult {
  [attr: string]: string | number;
}
