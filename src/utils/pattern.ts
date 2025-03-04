import { ISampleResults } from "../types";

export const isPattern = (untilFormulaOrPattern: string): boolean => {
  const isSingleValue = /^[a-zA-Z0-9_.]+$/.test(untilFormulaOrPattern);
  const hasComma = untilFormulaOrPattern.includes(",");
  const hasParentheses = untilFormulaOrPattern.includes("(") || untilFormulaOrPattern.includes(")");
  return isSingleValue || (hasComma && !hasParentheses);
};

export const evaluatePattern = (untilPattern: string, outputs: ISampleResults): boolean => {
  const desired = untilPattern
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const actual = Object.values(outputs);

  if (desired.length !== actual.length) {
    throw new Error(`Evaluating "until" pattern: ${untilPattern}.\n\nThe number of desired items does not match the number of actual items.`);
  }

  if (!desired.every((item, index) => item === actual[index])) {
    return false;
  }

  return true;
};


