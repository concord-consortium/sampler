import { formatFormula, validateFormula } from "./utils";

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

  it("should handle function calls", () => {
    const expression = "max(a, b)";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = max('a', 'b')";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should handle parenthesis", () => {
    const expression = "(a or b) & (d | (foo and bar))";
    const columnName = "output";
    const replacements = ["output", "foo", "bar"];
    const expected = "output = ('a' or 'b') & ('d' | (foo and bar))";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should handle numeric comparison", () => {
    const expression = "1=1";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 1 = 1";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should handle negative numbers", () => {
    const expression = "-1";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = -1";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should handle two-character comparison operators", () => {
    const columnName = "output";
    const replacements = ["output"];
    expect(formatFormula("output <= 5", columnName, replacements)).toBe("output <= 5");
    expect(formatFormula("output >= 5", columnName, replacements)).toBe("output >= 5");
    expect(formatFormula("output != 5", columnName, replacements)).toBe("output != 5");
  });

  it("should supply the left-hand side of a two-character comparison operator", () => {
    const columnName = "output";
    const replacements = ["output"];
    expect(formatFormula("<= 5", columnName, replacements)).toBe("output <= 5");
    expect(formatFormula("!= 5", columnName, replacements)).toBe("output != 5");
  });

  it("should handle subtraction that is not surrounded by spaces", () => {
    const expression = "output = 5-3";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 5 - 3";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

  it("should not split values that begin with a word operator", () => {
    const columnName = "output";
    const replacements = ["output"];
    expect(formatFormula("orange", columnName, replacements)).toBe("output = 'orange'");
    expect(formatFormula("output = android", columnName, replacements)).toBe("output = 'android'");
  });

  it("should reject an expression it cannot parse in full rather than ignoring the rest", () => {
    expect(() => formatFormula("output = 5 6", "output", ["output"])).toThrow("Unexpected token: 6");
  });

  it("should reject an expression that ends where a value was expected", () => {
    expect(() => formatFormula("output >=", "output", ["output"])).toThrow("Unexpected end of expression");
    expect(() => formatFormula("output +", "output", ["output"])).toThrow("Unexpected end of expression");
  });

  it("should see an attribute that is inside parentheses", () => {
    const columnName = "output";
    const replacements = ["output"];
    expect(formatFormula("(output) = 5", columnName, replacements)).toBe("(output) = 5");
    expect(formatFormula("(output + 1) > 5", columnName, replacements)).toBe("(output + 1) > 5");
  });

  it("should supply the left-hand side around a comparison that follows a word operator", () => {
    const expression = "b and output = c";
    const columnName = "output";
    const replacements = ["output"];
    const expected = "output = 'b' and output = 'c'";
    expect(formatFormula(expression, columnName, replacements)).toBe(expected);
  });

});

describe("validateFormula", () => {
  it("should report an expression the parser cannot read as invalid", () => {
    expect(validateFormula("output >=")).toBe(false);
    expect(validateFormula("output = 5 6")).toBe(false);
  });

  it("should report a parsable expression as valid", () => {
    expect(validateFormula("output >= 5")).toBe(true);
    expect(validateFormula("*")).toBe(true);
  });
});
