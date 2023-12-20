export interface IDevice {
  id: number;
  deviceType: "mixer" | "spinner" | "collector";
  variables: "string" | "number";
}


