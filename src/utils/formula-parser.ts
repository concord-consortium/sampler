export type ExpressionNode =
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Variable
  | FunctionCall
  | GroupingExpression;

interface BinaryExpression {
  type: "BinaryExpression";
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

interface UnaryExpression {
  type: "UnaryExpression";
  operator: string;
  argument: ExpressionNode;
}

interface Literal {
  type: "Literal";
  value: number | string | boolean;
}

interface Variable {
  type: "Variable";
  name: string;
}

interface FunctionCall {
  type: "FunctionCall";
  callee: string;
  arguments: ExpressionNode[];
}

interface GroupingExpression {
  type: "GroupingExpression";
  expression: ExpressionNode;
}

interface ParseState {
  value: number;
  columnName: string;
  replacements: string[];
}

// A "-" directly after a value is subtraction, but the number rule has already taken it for a sign,
// so "5-3" arrives as ["5", "-3"]. Hand the operator back to the parser.
const splitSubtraction = (tokens: string[]): string[] => {
  return tokens.reduce<string[]>((acc, token) => {
    const previous = acc[acc.length - 1];
    const followsValue = previous !== undefined && (previous === ")" || /^-?\w/.test(previous));
    if (followsValue && /^-\d/.test(token)) {
      acc.push("-", token.slice(1));
    } else {
      acc.push(token);
    }
    return acc;
  }, []);
};

export const tokenize = (input: string): string[] => {
  // Order matters: the two-character comparisons must precede the single-character class, and the
  // word operators come from the identifier rule so a name such as "orange" is not read as "or" + "ange".
  const regex = /(-?\d+(\.\d+)?|<=|>=|!=|[()+\-*/%^<>=!&|,]|≠|≤|≥|÷|\s+|[a-zA-Z_]\w*)/g;
  const tokens = (input.match(regex) || []).filter(t => t.trim().length > 0);
  return splitSubtraction(tokens);
};

const peek = (tokens: string[], state: ParseState): string => {
  return tokens[state.value];
};

const consume = (tokens: string[], state: ParseState): string => {
  return tokens[state.value++];
};

const expect = (tokens: string[], state: ParseState, value: string): void => {
  if (consume(tokens, state) !== value) {
      throw new Error(`Expected ${value}`);
  }
};

const containsReplacements = (node: ExpressionNode, state: ParseState): boolean => {
  switch (node.type) {
    case "BinaryExpression":
      return containsReplacements(node.left, state) || containsReplacements(node.right, state);
    case "UnaryExpression":
      return containsReplacements(node.argument, state);
    case "FunctionCall":
      return node.arguments.reduce((acc, cur) => acc || containsReplacements(cur, state), false);
    case "GroupingExpression":
      return containsReplacements(node.expression, state);
    case "Variable":
      return state.replacements.includes(node.name);
    default:
      return false;
  }
};

export const parseExpression = (tokens: string[], state: ParseState): ExpressionNode => {
  const operators = ["=", "+", "-", "*", "/", "%", "^", "&", "|", "<", ">", "!", "<=", ">=", "!=",
                     "≠", "≤", "≥", "and", "or", "AND", "OR"];

  let tree: ExpressionNode;

  // allow for expressions to start with operators
  if (operators.includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    tree = {
      type: "BinaryExpression",
      operator,
      left: { type: "Variable", name: state.columnName },
      right: parseLogicalOr(tokens, state),
    };
  } else {
    tree = parseLogicalOr(tokens, state);
  }

  // leftover tokens mean the input did not parse as written
  if (state.value < tokens.length) {
    throw new Error(`Unexpected token: ${peek(tokens, state)}`);
  }

  if ((tree.type !== "BinaryExpression") || !containsReplacements(tree.left, state)) {
    tree = {
      type: "BinaryExpression",
      operator: "=",
      left: { type: "Variable", name: state.columnName },
      right: tree,
    };
  }

  return tree;
};

// Each of the functions below handles one level of precedence, loosest first: or, and, comparison,
// addition, multiplication, exponentiation, unary, primary.
const parseLogicalOr = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseLogicalAnd(tokens, state);

  while (["|", "or", "OR"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseLogicalAnd(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseLogicalAnd = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseComparison(tokens, state);

  while (["&", "and", "AND"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseComparison(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseComparison = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseAddition(tokens, state);

  while (["=", "!=", "≠", "<", ">", "<=", "≥", "≤", ">="].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseAddition(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseAddition = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseMultiplication(tokens, state);

  while (["+", "-"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseMultiplication(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseMultiplication = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseExponentiation(tokens, state);

  while (["*", "/", "÷", "%"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseExponentiation(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseExponentiation = (tokens: string[], state: ParseState): ExpressionNode => {
  let node = parseUnary(tokens, state);

  while (["^"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const right = parseUnary(tokens, state);
    node = {
      type: "BinaryExpression",
      operator,
      left: node,
      right,
    };
  }

  return node;
};

const parseUnary = (tokens: string[], state: ParseState): ExpressionNode => {
  if (["-", "!"].includes(peek(tokens, state))) {
    const operator = consume(tokens, state);
    const argument = parsePrimary(tokens, state);
    return {
      type: "UnaryExpression",
      operator,
      argument,
    };
  }

  return parsePrimary(tokens, state);
};

const parsePrimary = (tokens: string[], state: ParseState): ExpressionNode => {
  const token = consume(tokens, state);

  if (token === undefined) {
    throw new Error("Unexpected end of expression");
  }

  if (token === "(") {
    const expr = parseLogicalOr(tokens, state);
    expect(tokens, state, ")");
    return {
      type: "GroupingExpression",
      expression: expr,
    };
  }

  if (token.match(/^-?\d+(\.\d+)?$/)) {
    return { type: "Literal", value: parseFloat(token) };
  }

  if (token.match(/^[a-zA-Z_]\w*$/)) {
    if (peek(tokens, state) === "(") {
      return parseFunctionCall(tokens, state, token);
    }
    return { type: "Variable", name: token };
  }

  throw new Error(`Unexpected token: ${token}`);
};

const parseFunctionCall = (tokens: string[], state: ParseState, callee: string): FunctionCall => {
  expect(tokens, state, "(");
  const args: ExpressionNode[] = [];
  if (peek(tokens, state) !== ")") {
    do {
      args.push(parseLogicalOr(tokens, state));
    } while (peek(tokens, state) === "," && consume(tokens, state));
  }
  expect(tokens, state, ")");
  return {
    type: "FunctionCall",
    callee,
    arguments: args,
  };
};

export const stringify = (node: ExpressionNode, replace: string[]): string => {
  switch (node.type) {
    case "BinaryExpression":
      return `${stringify(node.left, replace)} ${node.operator} ${stringify(node.right, replace)}`;
    case "UnaryExpression":
      return `${node.operator}${stringify(node.argument, replace)}`;
    case "Literal":
      return node.value.toString();
    case "Variable":
      if (replace.includes(node.name)) {
        return node.name;
      } else {
        return `'${node.name}'`;
      }
    case "FunctionCall":
      return `${node.callee}(${node.arguments.map(arg => stringify(arg, replace)).join(", ")})`;
    case "GroupingExpression":
      // Stringify the expression inside the parentheses and wrap it in parentheses
      return `(${stringify(node.expression, replace)})`;
    default:
      throw new Error("Unknown node type");
  }
};

const extractVariables = (node: ExpressionNode, variableSet: Set<string>) => {
  switch (node.type) {
    case "BinaryExpression":
      extractVariables(node.left, variableSet);
      extractVariables(node.right, variableSet);
      break;
    case "UnaryExpression":
      extractVariables(node.argument, variableSet);
      break;
    case "Literal":
      // no-op
      break;
    case "Variable":
      variableSet.add(node.name);
      break;
    case "FunctionCall":
      node.arguments.forEach(arg => extractVariables(arg, variableSet));
      break;
    case "GroupingExpression":
      extractVariables(node.expression, variableSet);
      break;
  }
};

export const getVariables = (parsedFormula: ExpressionNode): string[] => {
  const variableSet = new Set<string>();
  extractVariables(parsedFormula, variableSet);
  return Array.from(variableSet);
};

export const renameVariable = (parsedFormula: ExpressionNode, oldName: string, newName: string): ExpressionNode => {
  switch (parsedFormula.type) {
    case "BinaryExpression":
      return {
        type: "BinaryExpression",
        operator: parsedFormula.operator,
        left: renameVariable(parsedFormula.left, oldName, newName),
        right: renameVariable(parsedFormula.right, oldName, newName),
      };
    case "UnaryExpression":
      return {
        type: "UnaryExpression",
        operator: parsedFormula.operator,
        argument: renameVariable(parsedFormula.argument, oldName, newName),
      };
    case "Literal":
      return parsedFormula;
    case "Variable":
      return {
        type: "Variable",
        name: parsedFormula.name === oldName ? newName : parsedFormula.name,
      };
    case "FunctionCall":
      return {
        type: "FunctionCall",
        callee: parsedFormula.callee,
        arguments: parsedFormula.arguments.map(arg => renameVariable(arg, oldName, newName)),
      };
    case "GroupingExpression":
      return {
        type: "GroupingExpression",
        expression: renameVariable(parsedFormula.expression, oldName, newName),
      };
  }
};

