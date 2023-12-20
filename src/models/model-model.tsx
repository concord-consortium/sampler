import { IDevice } from "./device-model";

export interface IColumn {
  devices: IDevice[];
}

export interface IModel {
  columns: IColumn[];
}
