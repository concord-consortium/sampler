import { Id, IGlobalState, IModel } from "../types";

export const modelHasSpinner = (model: IModel) => {
  return model.columns.reduce<boolean>((acc, column) => {
    return column.devices.reduce<boolean>((acc2, device) => {
      return acc2 || device.viewType === "spinner";
    }, acc);
  }, false);
};

export const computeExperimentHash = async (globalState: IGlobalState): Promise<string> => {
  const {model, repeat, replacement, sampleSize, numSamples, untilFormula} = globalState;

  const signature = model.columns.reduce<string[]>((acc, column) => {
    acc.push(JSON.stringify(column));
    return acc;
  }, [])
  .concat(JSON.stringify({repeat, replacement, sampleSize, numSamples, untilFormula}))
  .join("+");

  const encoder = new TextEncoder();
  const data = encoder.encode(signature);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

export const removeDeviceFromFormulas = (model: IModel, deviceId: Id) => {
  model.columns.forEach((column, columnIndex) => {
    column.devices.forEach(d => {
      if (d.formulas?.[deviceId]) {
        const formula = d.formulas[deviceId];
        delete d.formulas[deviceId];

        // move the formula to the next device in the next column if we are not
        // in the last column and there is more than one device in the next column
        if (columnIndex < model.columns.length - 1) {
          const nextColumn = model.columns[columnIndex + 1];
          if (nextColumn.devices.length > 1) {
            const deviceIndex = nextColumn.devices.findIndex(d2 => d2.id === deviceId);
            const newDeviceIndex = deviceIndex > 0 ? deviceIndex - 1 : 1;
            const newDeviceId = nextColumn.devices[newDeviceIndex].id;
            d.formulas[newDeviceId] = formula;
          }
        }
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


