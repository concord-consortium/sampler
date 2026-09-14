import { ExpressionNode, parseExpression, tokenize } from "./formula-parser";

const parse = (expression: string): ExpressionNode => {
  // every name the tests use is a known attribute, so nothing is wrapped in an implicit comparison
  const replacements = ["a", "b", "c", "output"];
  return parseExpression(tokenize(expression), { value: 0, columnName: "output", replacements });
};

const binary = (node: ExpressionNode) => {
  if (node.type !== "BinaryExpression") {
    throw new Error(`Expected a BinaryExpression, got a ${node.type}`);
  }
  return node;
};

describe("tokenize", () => {
  it("keeps two-character comparison operators together", () => {
    expect(tokenize("a <= 1")).toEqual(["a", "<=", "1"]);
    expect(tokenize("a >= 1")).toEqual(["a", ">=", "1"]);
    expect(tokenize("a != 1")).toEqual(["a", "!=", "1"]);
  });

  it("does not take a word operator out of the front of a longer name", () => {
    expect(tokenize("orange")).toEqual(["orange"]);
    expect(tokenize("android")).toEqual(["android"]);
    expect(tokenize("a and b")).toEqual(["a", "and", "b"]);
  });

  it("reads a minus that follows a value as subtraction", () => {
    expect(tokenize("5-3")).toEqual(["5", "-", "3"]);
    expect(tokenize("a-1")).toEqual(["a", "-", "1"]);
    expect(tokenize("(a)-1")).toEqual(["(", "a", ")", "-", "1"]);
  });

  it("still reads a minus that begins a value as a sign", () => {
    expect(tokenize("-1")).toEqual(["-1"]);
    expect(tokenize("a > -1")).toEqual(["a", ">", "-1"]);
    expect(tokenize("max(a, -1)")).toEqual(["max", "(", "a", ",", "-1", ")"]);
  });
});

describe("parseExpression precedence", () => {
  it("binds comparison more tightly than and", () => {
    const tree = binary(parse("a = b and c"));
    expect(tree.operator).toBe("and");
    expect(binary(tree.left).operator).toBe("=");
  });

  it("binds and more tightly than or", () => {
    const tree = binary(parse("a and b or c"));
    expect(tree.operator).toBe("or");
    expect(binary(tree.left).operator).toBe("and");
  });

  it("binds arithmetic more tightly than comparison", () => {
    const tree = binary(parse("a = b + 1"));
    expect(tree.operator).toBe("=");
    expect(binary(tree.right).operator).toBe("+");
  });

  it("binds multiplication more tightly than addition", () => {
    const tree = binary(parse("a = b * 2 + 1"));
    const sum = binary(tree.right);
    expect(sum.operator).toBe("+");
    expect(binary(sum.left).operator).toBe("*");
  });

  it("binds exponentiation more tightly than multiplication", () => {
    const tree = binary(parse("a = b * 2 ^ 3"));
    const product = binary(tree.right);
    expect(product.operator).toBe("*");
    expect(binary(product.right).operator).toBe("^");
  });

  it("lets parentheses override precedence", () => {
    const tree = binary(parse("a = (b or c)"));
    expect(tree.operator).toBe("=");
    expect(tree.right.type).toBe("GroupingExpression");
  });
});
