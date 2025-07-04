import { IVariables, IDevice, ViewType } from "../types";
import { createId } from "../utils/id";

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
export const createDefaultDevice = (viewType: ViewType = ViewType.Mixer): IDevice => {
  return {id: createId(), viewType, variables: kDefaultVars, collectorVariables: [], formulas: {}, hidden: false, lockPassword: "", itemLabels: "", replacement: true};
};

interface ICreateDeviceOptions {
  viewType: ViewType,
  variables: IVariables,
  hidden: boolean,
  replacement: boolean,
  lockPassword: string
  itemLabels: string;
}
export const createDevice = ({viewType, variables, hidden, lockPassword, itemLabels, replacement}: ICreateDeviceOptions): IDevice => {
  return {id: createId(), viewType, variables, collectorVariables: [], formulas: {}, hidden, lockPassword, itemLabels, replacement};
};
