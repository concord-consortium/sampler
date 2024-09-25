import { IModel, IDevice, Id, DeviceMap } from "../types";

export const getNumDevices = (model: IModel): number => {
  return getDevices(model).length;
};

export const getDevices = (model: IModel): IDevice[] => {
  return model.columns.reduce<IDevice[]>((acc, column) => {
    return column.devices.reduce((acc2, device) => {
      acc2.push(device);
      return acc2;
    }, acc);
  }, []);
};

export const getDeviceIds = (model: IModel): Id[] => {
  return getDevices(model).map(device => device.id);
};

export const getDeviceMap = (model: IModel): DeviceMap => {
  return getDevices(model).reduce<DeviceMap>((acc, device) => {
    acc[device.id] = device;
    return acc;
  }, {});
};

export const getDeviceColumnIndex = (model: IModel, device: IDevice) => {
  return model.columns.findIndex(c => c.devices.find(d => d.id === device.id));
};

export const getDeviceIndex = (devices: IDevice[], device: IDevice): number => {
  return devices.findIndex(d => d.id === device.id);
};

// returns an array of devices flowing into the passed device
export const getSourceDevices = (model: IModel, device: IDevice): IDevice[] => {
  return getMatchingDevices(model, device, -1);
};

// returns an array of devices flowing out the passed device
export const getTargetDevices = (model: IModel, device: IDevice): IDevice[] => {
  return getMatchingDevices(model, device, +1);
};

// returns an array of sibling devices of the passed device
export const getSiblingDevices = (model: IModel, device: IDevice): IDevice[] => {
  const columnIndex = getDeviceColumnIndex(model, device);
  if (columnIndex !== -1) {
    return model.columns[columnIndex].devices.filter(d => d.id !== device.id);
  }
  return [];
};

// "private" methods

const getMatchingDevices = (model: IModel, device: IDevice, columnDelta: number): IDevice[] => {
  const columnIndex = getDeviceColumnIndex(model, device);
  const matchingColumnIndex = columnIndex + columnDelta;
  if (matchingColumnIndex < 0 || matchingColumnIndex >= model.columns.length) {
    return [];
  }

  const devices = model.columns[columnIndex].devices;
  const matchingDevices = model.columns[matchingColumnIndex].devices;

  // one source or target device so all flow in our out of the device
  if (devices.length === 1 || matchingDevices.length === 1) {
    return matchingDevices;
  }

  // match up the device by index
  const deviceIndex = getDeviceIndex(devices, device);
  if (matchingDevices[deviceIndex]) {
    return [matchingDevices[deviceIndex]];
  }

  // we should not get into this state, but just in case
  return [];
};

export const getDeviceById = (model: IModel, id: Id) => {
  return getDevices(model).find(device => device.id === id) as IDevice;
};

