import React from "react";
import { ClippingDef, IDevice } from "../../../models/device-model";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";

interface IMixer {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Mixer = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IMixer) => {
  const { variables, id: deviceId } = device;
  return (
    <>
      <MixerFrame withReplacement={false}/>
      <Balls
        ballsArray={variables}
        deviceId={deviceId}
        handleAddDefs={handleAddDefs}
        handleSetSelectedVariable={handleSetSelectedVariable}
        handleSetEditingVarName={handleSetEditingVarName}
      />
    </>
  );
};
