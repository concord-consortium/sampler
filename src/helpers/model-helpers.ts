import { IModel } from "../types";

export const modelHasSpinner = (model: IModel) => {
  return model.columns.reduce<boolean>((acc, column) => {
    return column.devices.reduce<boolean>((acc2, device) => {
      return acc2 || device.viewType === "spinner";
    }, acc);
  }, false);
};
