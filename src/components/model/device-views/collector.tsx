import React, { useEffect, useState } from "react";
import { ClippingDef, IDevice } from "../../../models/device-model";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";

interface ICollector {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: ICollector) => {
  const [ballsArray, setBallsArray] = useState<Array<string>>([]);
  const { collectorVariables, id: deviceId } = device;

  useEffect(() => {
    if (collectorVariables.length) {
      const firstKey = Object.keys(collectorVariables[0])[0];
      const onlyFirstKeyValues = collectorVariables.map((item) => item[firstKey].toString());
      setBallsArray(onlyFirstKeyValues);
    }
  }, [collectorVariables]);

  return (
    <>
      <MixerFrame/>
      { ballsArray.length &&
        <Balls
          ballsArray={ballsArray}
          deviceId={deviceId}
          handleAddDefs={handleAddDefs}
          handleSetSelectedVariable={handleSetSelectedVariable}
          handleSetEditingVarName={handleSetEditingVarName}
        />
      }
    </>
  );
};
