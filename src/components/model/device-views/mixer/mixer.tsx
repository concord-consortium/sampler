import React from "react";
import { ClippingDef, IVariables } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";
import { Balls } from "../shared/balls";

interface IMixer {
  variables: IVariables;
  handleAddDefs: (def: ClippingDef) => void;
  handleSetSelectedVariable: (variableIdx: number) => void;
  handleSetEditingVarName: (variableIdx: number) => void;
}

export const Mixer = ({variables, handleAddDefs, handleSetSelectedVariable, handleSetEditingVarName}: IMixer) => {
  return (
    <>
      <MixerFrame withReplacement={false}/>
      <Balls
        ballsArray={variables}
        handleAddDefs={handleAddDefs}
        handleSetSelectedVariable={handleSetSelectedVariable}
        handleSetEditingVarName={handleSetEditingVarName}
      />
    </>
  );
};
