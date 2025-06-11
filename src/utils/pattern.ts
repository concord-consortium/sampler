import { ISampleResults } from "../types";

export const isPattern = (untilFormulaOrPattern: string): boolean => {
  const isSingleValue = /^[a-zA-Z0-9_.]+$/.test(untilFormulaOrPattern);
  const hasComma = untilFormulaOrPattern.includes(",");
  const hasParentheses = untilFormulaOrPattern.includes("(") || untilFormulaOrPattern.includes(")");
  return isSingleValue || (hasComma && !hasParentheses);
};

export const evaluatePattern = (untilPattern: string, outputs: ISampleResults[]): boolean => {
  const desiredValues = untilPattern
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const keys = Object.keys(outputs[0]);

  // short circuit if we don't have enough outputs
  if ((desiredValues.length > outputs.length) || (keys.length === 0)) {
    return false;
  }

  // check if the desired values match any sequence in the outputs
  for (const key of keys) {
    const testValues = outputs.map((output) => output[key]);
    for (let i = 0; i <= testValues.length - desiredValues.length; i++) {
      let match = true;
      for (let j = 0; j < desiredValues.length; j++) {
        if (testValues[i + j] !== desiredValues[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return true;
      }
    }
  }

  return false;
};


