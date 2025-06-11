import { ISampleResults } from "../types";

export const getUniqueValues = (values: any[]): any[] => {
  const uniqueValues = new Set(values);
  return Array.from(uniqueValues);
};

export const evaluateUniqueValues = (numUniqueValues: number, outputs: ISampleResults[]): boolean => {
  const keys = Object.keys(outputs[0]);

  // short circuit if we don't have enough outputs
  if ((numUniqueValues > outputs.length) || (keys.length === 0)) {
    return false;
  }

  // check if the number of unique values match any sequence in the outputs
  for (const key of keys) {
    const testValues = outputs.map((output) => output[key]);
    const uniqueTestValues = getUniqueValues(testValues);
    if (uniqueTestValues.length === numUniqueValues) {
      return true;
    }
  }

  return false;
};


