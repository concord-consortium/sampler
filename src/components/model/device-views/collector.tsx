import React, { useEffect, useState } from "react";
import { ClippingDef, IDevice } from "../../../models/device-model";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";
import { Speed } from "../../../types";

interface ICollector {
  device: IDevice;
  isRunning: boolean;
  speed: Speed;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, isRunning, speed, handleAddDefs,
  handleSetSelectedVariable, handleSetEditingVarName}: ICollector) => {
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
      <MixerFrame withReplacement={false}/>
      { ballsArray.length &&
        <Balls
          ballsArray={ballsArray}
          deviceId={deviceId}
          isRunning={isRunning}
          speed={speed}
          handleAddDefs={handleAddDefs}
          handleSetSelectedVariable={handleSetSelectedVariable}
          handleSetEditingVarName={handleSetEditingVarName}
        />
      }
    </>
  );
};
