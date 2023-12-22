import { Id } from "../utils/id";

export interface IDevice {
  id: Id;
  name: string;
  deviceType: "mixer" | "spinner" | "collector";
  variables: IVariables;
  collectorVariables: ICollectorVariables;
}

// a map of variables to their percentages
// i.e.: { a: 50, b: 50 }
// the view (mixer / spinner) decides how to best represent these percentages
export interface IVariables {
  [variableName: string]: number;
}

// a map of attributes to their values
// { "Mammal": "Dog", "Color": "Brown"}
export interface ICollectorItem {
  [attr: string]: string | number;
}

// an array of items that come from a linked dataset
// i.e.: [ { "Mammal": "Dog", "Color": "Brown"}, { "Mammal": "Cat", "Color": "Black"} ]
// the collector view will represent the values of the first key-value pair of each object in the array
// i.e., one ball for "Dog", one ball for "Cat"
// if "Dog" is selected by the collector, the entire item is sent to CODAP
export type ICollectorVariables = Array<ICollectorItem>;
