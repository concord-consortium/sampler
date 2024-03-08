import React from "react";
import { ClippingDef, IDevice } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";
import { Balls } from "../shared/balls";
import { Speed } from "../../../../types";

interface IMixer {
  device: IDevice;
  isRunning: boolean;
  speed: Speed;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Mixer = ({device, isRunning, speed, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IMixer) => {
  const { variables, id: deviceId } = device;
  return (
    <>
      <MixerFrame withReplacement={false}/>
      <Balls
        ballsArray={variables}
        deviceId={deviceId}
        isRunning={isRunning}
        speed={speed}
        handleAddDefs={handleAddDefs}
        handleSetSelectedVariable={handleSetSelectedVariable}
        handleSetEditingVarName={handleSetEditingVarName}
      />
    </>
  );
};
