import { getAllItems } from "@concord-consortium/codap-plugin-api";
import { ICollectorItem, IItem, ViewType, type ICollectorVariables, type IModel } from "../types";
import { defaultAttrMap } from "./attr-map";

export const getCollectorFirstNameVariables = (collectorVariables: ICollectorVariables): string[] => {
  if (collectorVariables.length) {
    const firstKey = Object.keys(collectorVariables[0])[0];
    return collectorVariables.map((item) => item[firstKey].toString());
  }
  return [];
};

export const getCollectorAttrNames = (model: IModel): string[] => {
  if (isCollectorOnlyModel(model)) {
    return Object.keys(model.columns[0].devices[0].collectorVariables[0]);
  }
  return [];
};

export const isCollectorOnlyModel = (model: IModel): boolean => {
  return model.columns.length === 1 && model.columns[0].devices.length === 1 && model.columns[0].devices[0].viewType === ViewType.Collector;
};

export const getDefaultAttrCounts = (): Record<string, number> => {
  const attrCount: Record<string, number> = {};
  Object.keys(defaultAttrMap).forEach((attr) => {
    attrCount[attr] = 1;
  });
  return attrCount;
};

export const renameBuiltInVariables = (attrs: string[]): string[] => {
  const attrCount = getDefaultAttrCounts();

  return attrs.map((attr) => {
    if (attrCount[attr] > 0) {
      attrCount[attr]++;
      return `${attr}${attrCount[attr]}`;
    }
    return attr;
  });
};

export const maybeRenameCollectorItem = (collectorItem: ICollectorItem): ICollectorItem => {
  const attrCount = getDefaultAttrCounts();
  const renamedItem: ICollectorItem = {};
  Object.keys(collectorItem).forEach((key) => {
    if (attrCount[key] > 0) {
      attrCount[key]++;
      const newKey = `${key}${attrCount[key]}`;
      renamedItem[newKey] = collectorItem[key];
    } else {
      renamedItem[key] = collectorItem[key];
    }
  });
  return renamedItem;
};

export const getCollectorAttrs = (model: IModel): string[] => {
  const collectorAttrs = Object.keys(model.columns?.[0].devices?.[0].collectorVariables[0] ?? []);
  const renamedAttrs = renameBuiltInVariables(collectorAttrs);
  return renamedAttrs;
};

export const getCollectorItemValues = async (dataContextName: string): Promise<any> => {
  const items = await getAllItems(dataContextName);
  const itemValues = items.values.map((item: IItem) => item.values);
  return itemValues;
};
