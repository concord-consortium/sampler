import React, { useMemo } from "react";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";
import { IDevice, ClippingDef } from "../../../types";
import { getCollectorCaseIndexVariables } from "../../../utils/collector";

interface IProps {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Collector = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  const { collectorVariables, id: deviceId, hidden } = device;

  const ballsArray = useMemo(() => {
    return getCollectorCaseIndexVariables(collectorVariables);
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
