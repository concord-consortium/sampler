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

// internal functions, not exported
const createRenameSet = () => new Set<string>(Object.keys(defaultAttrMap));
const maybeRenameAttr = (attr: string, renameSet: Set<string>): string => {
  if (!renameSet.has(attr)) {
    renameSet.add(attr);
    return attr;
  }

  let suffix = 2;
  while (renameSet.has(`${attr}${suffix}`)) {
    suffix++;
  }
  renameSet.add(`${attr}${suffix}`);
  return `${attr}${suffix}`;
};

export const renameBuiltInVariables = (attrs: string[]): string[] => {
  const renameSet = createRenameSet();
  return attrs.map((attr) => maybeRenameAttr(attr, renameSet));
};

export const maybeRenameCollectorItem = (collectorItem: ICollectorItem): ICollectorItem => {
  const renameSet = createRenameSet();
  const renamedItem: ICollectorItem = {};
  Object.keys(collectorItem).forEach((key) => {
    const maybeNewKey = maybeRenameAttr(key, renameSet);
    renamedItem[maybeNewKey] = collectorItem[key];
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
