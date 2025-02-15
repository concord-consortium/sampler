import React, { useEffect, useState } from "react";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";
import { IDevice, ClippingDef } from "../../../types";

interface IProps {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  const [ballsArray, setBallsArray] = useState<Array<string>>([]);
  const { collectorVariables, id: deviceId, hidden } = device;

  useEffect(() => {
    if (collectorVariables.length) {
      const firstKey = Object.keys(collectorVariables[0])[0];
      const onlyFirstKeyValues = collectorVariables.map((item) => item[firstKey].toString());
      setBallsArray(onlyFirstKeyValues);
    }
  }, [collectorVariables]);

  return (
    <>
      <MixerFrame hidden={hidden} />
      { ballsArray.length &&
        <Balls
          ballsArray={ballsArray}
          deviceId={deviceId}
          handleAddDefs={handleAddDefs}
          handleSetSelectedVariable={handleSetSelectedVariable}
          handleSetEditingVarName={handleSetEditingVarName}
          hidden={hidden}
        />
      }
    </>
  );
};
