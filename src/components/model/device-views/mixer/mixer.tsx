import React from "react";
import { ClippingDef, IVariables } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";
import { Balls } from "../shared/balls";

import "./mixer.scss";

interface IMixer {
  variables: IVariables;
  handleAddDefs: (defs: ClippingDef[]) => void;
}

export const Mixer = ({variables, handleAddDefs}: IMixer) => {
  return (
    <>
      <MixerFrame withReplacement={false}/>
      <Balls ballsArray={variables} handleAddDefs={handleAddDefs}/>
    </>
  );
};
