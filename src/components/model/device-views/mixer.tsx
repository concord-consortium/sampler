import React from "react";
import { MixerFrame } from "./shared/mixer-frame";
import { Balls } from "./shared/balls";
import { ClippingDef, IDevice } from "../../../types";

interface IProps {
  device: IDevice;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Mixer = ({device, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IProps) => {
  const { variables, id: deviceId } = device;
  return (
    <>
      <MixerFrame/>
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
