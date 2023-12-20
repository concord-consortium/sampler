import { Id } from "../utils/id";
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

export type DeviceMap = Record<Id,IDevice>;

export const getDeviceIds = (model: IModel): Id[] => {
  return model.columns.reduce<Id[]>((acc, column) => {
    return column.devices.reduce((acc2, device) => {
      acc2.push(device.id);
      return acc2;
    }, acc);
  }, []);
};

export const getDeviceMap = (model: IModel): DeviceMap => {
  return model.columns.reduce<DeviceMap>((acc, column) => {
    return column.devices.reduce((acc2, device) => {
      acc2[device.id] = device;
      return acc2;
    }, acc);
  }, {});
};

export const getDeviceColumnIndex = (model: IModel, device: IDevice) => {
  return model.columns.findIndex(c => c.devices.find(d => d.id === device.id));
};

// returns an array of devices flowing into the passed device
export const getSourceDevices = (model: IModel, device: IDevice): IDevice[] => {
  const columnIndex = getDeviceColumnIndex(model, device);
  const prevColumnIndex = columnIndex - 1;
  if (prevColumnIndex < 0) {
    return [];
  }

  const devices = model.columns[columnIndex].devices;
  const prevDevices = model.columns[prevColumnIndex].devices;

  if (devices.length === 1 || prevDevices.length === 1) {
    // one source or target device so all flow into the device
    return model.columns[prevColumnIndex].devices;
  }

  if (devices.length === prevDevices.length) {
    // match up the device by index
    const deviceIndex = devices.findIndex(d => d.id === device.id);
    if (deviceIndex !== -1) {
      return [prevDevices[deviceIndex]];
    }
  }

  // we should not get into this state, but just in case
  return [];
};
