import React, { useEffect, useState } from "react";
import { ClippingDef, ICollectorVariables } from "../../../models/device-model";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";

interface ICollector {
  collectorVariables: ICollectorVariables;
  handleAddDefs: (defs: ClippingDef[]) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
}

export const Collector = ({collectorVariables, handleAddDefs, handleSetSelectedVariable}: ICollector) => {
  const [ballsArray, setBallsArray] = useState<Array<string>>([]);

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
        <Balls ballsArray={ballsArray} handleAddDefs={handleAddDefs} handleSetSelectedVariable={handleSetSelectedVariable}/>
      }
    </>
  );
};
