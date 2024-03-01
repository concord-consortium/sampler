import { Id, createId } from "../utils/id";

export enum ViewType {
  Mixer = "mixer",
  Spinner = "spinner",
  Collector = "collector"
}

export type View = ViewType.Mixer | ViewType.Spinner | ViewType.Collector;

export interface IDevice {
  id: Id;
  viewType: View;
  variables: IVariables;
  collectorVariables: ICollectorVariables;
  formulas: Record<string, string>;
}

// a map of variables to their percentages
// i.e.: { a: 50, b: 50 }
// the view (mixer / spinner) decides how to best represent these percentages
export type IVariables = Array<string>;
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
export interface IDataContext {
  guid: number;
  id: number;
  name: string;
  title: string;
}

export interface IItem {
  id: number;
  values: ICollectorItem;
}

export type IItems = Array<IItem>;

export type ClippingDef = { id: string, element: JSX.Element };

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}


export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function isOneThirdOrTwoThirds(value: number): boolean {
  return value === 33 || value === 67;
}

export function percentageToFraction (percentage: number) {
  const numerator = percentage;
  const denominator = 100;
  const commonFactor = gcd(numerator, denominator);
  return [numerator / commonFactor, denominator / commonFactor];
}

export function findCommonDenominator (percentages: number[]): number {
  const fractions = percentages.map((p) => percentageToFraction(p));
  const denominators = fractions.map((f) => { return f[1];});
  const lcdDenominator = denominators.reduce((accumulator, currentDenominator) => lcm(accumulator, currentDenominator));
  return lcdDenominator;
}

export function findEquivNum(n: number, lcd: number) {
  return (n * (lcd / 100));
}

export const kDefaultVars: IVariables = ["a", "a", "b"];
export const createDefaultDevice = (): IDevice => {
  return {id: createId(), viewType: ViewType.Mixer, variables: kDefaultVars, collectorVariables: [], formulas: {}};
};
