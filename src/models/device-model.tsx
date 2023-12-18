export interface IDevice {
  id: string;
  deviceType: "mixer" | "spinner" | "collector";
  variables: "string" | "number";
  children?: string[] // array of device ids
}


