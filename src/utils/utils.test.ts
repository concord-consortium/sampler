import { formatFormula } from "./utils";

describe("formatFormula", () => {
  it("should wrap string values that are not in the replacements array with single quotes", () => {
    const expression = "output = a";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 'a'";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it ("should not wrap string values in extra quotes", () => {
    const expected = "output = 'a'";

    const expression = "output = 'a'";
    const columnName = "output";
    const replacements = ["output"];
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);

    const expression2 = '"output" = "a"';
    const columnName2 = "output";
    const replacements2 = ["output"];
    expect(formatFormula(expression2, columnName2, replacements2)).toBe(expected);
  });

  it("should not wrap numbers in single quotes", () => {
    const expression = "output = 6";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 6";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should return a basic equality expression if no operator is present", () => {
    const expression = "a";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 'a'";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should handle expressions where the left-hand side argument is missing", () => {
    const expression = "= a";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 'a'";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);

    const expression2 = "+ output > 6";
    const columnName2 = "output2";
    const replacements2 = ["output", "output2"];
    const expected2 = "output2 + output > 6";
    expect(formatFormula(expression2, columnName2, replacements2)).toBe(expected2);

    const expression3 = "+ output2 > 6";
    const columnName3 = "output2";
    const replacements3 = ["output", "output2"];
    const expected3 = "output2 + output2 > 6";
    expect(formatFormula(expression3, columnName3, replacements3)).toBe(expected3);
  });

  it("should handle boolean word operators", () => {
    const expression = "a and b or c and rand or ror";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 'a' and 'b' or 'c' and 'rand' or 'ror'";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });
});

