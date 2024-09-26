import { Id, IGlobalState, IModel } from "../types";

export const modelHasSpinner = (model: IModel) => {
  return model.columns.reduce<boolean>((acc, column) => {
    return column.devices.reduce<boolean>((acc2, device) => {
      return acc2 || device.viewType === "spinner";
    }, acc);
  }, false);
};

export const computeExperimentHash = async (globalState: IGlobalState): Promise<string> => {
  const {model, repeat, replacement, sampleSize, numSamples} = globalState;

  const signature = model.columns.reduce<string[]>((acc, column) => {
    acc.push(JSON.stringify(column));
    return acc;
  }, [])
  .concat(JSON.stringify({repeat, replacement, sampleSize, numSamples}))
  .join("+");

  const encoder = new TextEncoder();
  const data = encoder.encode(signature);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

export const removeDeviceFromFormulas = (model: IModel, deviceId: Id) => {
  model.columns.forEach(column => {
    column.devices.forEach(d => {
      if (d.formulas?.[deviceId]) {
        delete d.formulas[deviceId];
      }
    });
  });
};

export const removeMissingDevicesFromFormulas = (model: IModel) => {
  const deviceIds = model.columns.reduce<string[]>((acc, column) => {
    return column.devices.reduce<string[]>((acc2, device) => {
      acc2.push(device.id);
      return acc2;
    }, acc);
  }, []);

  model.columns.forEach(column => {
    column.devices.forEach(d => {
      d.formulas = Object.keys(d.formulas).reduce<Record<string,string>>((acc, key) => {
        if (deviceIds.includes(key)) {
          acc[key] = d.formulas[key];
        }
        return acc;
      }, {});
    });
  });
};

