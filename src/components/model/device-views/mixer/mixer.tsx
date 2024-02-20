import React from "react";
import { ClippingDef, IVariables } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";
import { Balls } from "../shared/balls";

interface IMixer {
  variables: IVariables;
  deviceId: string;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Mixer = ({variables, deviceId, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IMixer) => {
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
