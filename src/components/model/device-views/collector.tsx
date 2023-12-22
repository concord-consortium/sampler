import React from "react";
import { ICollectorVariables } from "../../../models/device-model";

interface ICollector {
  collectorVariables: ICollectorVariables;
}

export const Collector = ({collectorVariables}: ICollector) => (
  <div className="collector">
    Collector
  </div>
);
