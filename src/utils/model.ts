import { IModel } from "../types";

export const getModelAttrs = (model: IModel): string[] => model.columns.map(column => column.name);
