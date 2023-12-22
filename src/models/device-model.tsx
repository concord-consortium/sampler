import { Id } from "../utils/id";

export interface IDevice {
  id: Id;
  deviceType: "mixer" | "spinner" | "collector";
  variables: "string" | "number";
}


