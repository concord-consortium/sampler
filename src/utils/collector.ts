import { ViewType, type ICollectorVariables, type IModel } from "../types";

export const getCollectorFirstNameVariables = (collectorVariables: ICollectorVariables): string[] => {
  if (collectorVariables.length) {
    const firstKey = Object.keys(collectorVariables[0])[0];
    return collectorVariables.map((item) => item[firstKey].toString());
  }
  return [];
};

export const isCollectorOnlyModel = (model: IModel): boolean => {
  return model.columns.length === 1 && model.columns[0].devices.length === 1 && model.columns[0].devices[0].viewType === ViewType.Collector;
};

export const getCollectorAttrs = (model: IModel): string[] => {
  if (isCollectorOnlyModel(model)) {
    return Object.keys(model.columns[0].devices[0].collectorVariables[0]);
  }
  return [];
};
