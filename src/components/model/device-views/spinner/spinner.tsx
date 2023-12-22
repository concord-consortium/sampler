import React from "react";
import { IVariables } from "../../../../models/device-model";

interface ISpinner {
  variables: IVariables;
}

export const Spinner = ({variables}: ISpinner) => (

  // spinner will need to take variables map and turn it into
  // a pie chart with wedges
  // ie: {a: 100} => one wedge
  // ie: {a: 50, b: 50} => two wedges
  // ie: {a: 25, b: 25, c: 25, d: 25} => four wedges

  <div className="spinner">
    Spinner
  </div>
);
