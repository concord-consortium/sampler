import React from "react";
import { IVariables } from "../../../../models/device-model";
import { MixerFrame } from "../shared/mixer-frame";

import "./mixer.scss";

interface IMixer {
  variables: IVariables;
}

export const Mixer = ({variables}: IMixer) => (

  // mixer will need to take variables map and turn it into
  // an array of variables
  // ie: {a: 100} => ["a"]
  // ie: {a: 50, b: 50} => ["a", "b"]
  // ie: {a: 25, b: 25, c: 25, d: 25} => ["a", "b", "c", "d"]
  // each variable will be represented by a ball

  <div className="mixer">
    <MixerFrame withReplacement={false} />
  </div>
);
