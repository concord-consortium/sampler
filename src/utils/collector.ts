import { ViewType, type ICollectorVariables, type IModel } from "../types";

export const getCollectorCaseIndexVariables = (collectorVariables: ICollectorVariables): string[] => {
  return Array.from({ length: collectorVariables.length }, (_, i) => `${i + 1}`);
};

export const isCollectorOnlyModel = (model: IModel): boolean => {
  return model.columns.length === 1 && model.columns[0].devices.length === 1 && model.columns[0].devices[0].viewType === ViewType.Collector;
};

export const getCollectorAttrs = (model: IModel): string[] => {
  if (isCollectorOnlyModel(model)) {
    return [model.columns[0].name, ...Object.keys(model.columns[0].devices[0].collectorVariables[0])];
  }
  return [];
};
