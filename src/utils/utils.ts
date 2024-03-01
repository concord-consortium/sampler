function bothStringsWithSameCaps(s1: string, s2: string) {
  if (typeof s1 !== "string" || typeof s2 !== "string") return false;
  const isCaps1 = s1 === s1.toUpperCase();
  const isCaps2 = s2 === s2.toUpperCase();
  return isCaps1 === isCaps2;
}

export function getDecimalPlaces(str: string) {
  const i = str.indexOf(".");
  if (i < 0) {
    return 0;
  }
  return str.length - i - 1;
}

export function parseSequence(seq: string, rangeWord: string) {
  // strip all spaces
  seq = seq.replace(/ /g, "");
  const m = new RegExp(`^(-?[\\d.]+|\\w)(-|${rangeWord})(-?[\\d.]+|\\w)$`,"g").exec(seq);
  if (!m || m.length < 4) {
    return null;
  }
  const v1 = m[1];
  const v2 = m[3];
  const f1 = parseFloat(v1);
  const f2 = parseFloat(v2);
  let arr;
  if (!isNaN(f1) && !isNaN(f2) && f1 !== f2) {
    const dec1 = getDecimalPlaces(v1);
    const dec2 = getDecimalPlaces(v2);
    const dec = Math.max(dec1, dec2);
    const multiplier = Math.pow(10, dec);
    const F1 = f1 * multiplier;
    const F2 = f2 * multiplier;
    arr = [...Array(Math.abs(F2 - F1) + 1)].map((value, index) => {
      const multipliedVal = f1 < f2 ? F1 + index : F1 - index;
      return (multipliedVal / multiplier).toFixed(dec);
    });

  } else if (bothStringsWithSameCaps(v1, v2) && v1 !== v2) {
    let c1 = v1.charCodeAt(0);
    let c2 = v2.charCodeAt(0);
    let increasing = c2 > c1;

    arr = [...Array(Math.abs(c1 - c2) + 1)].map((value, index) => {
      const nextChar = increasing ? (c1 + index) : (c1 - index);
      return String.fromCharCode(nextChar);
    });
  }
  return arr;
}

export function parseSpecifier(spec: string, rangeWord: string) {
  rangeWord = rangeWord || "to";
  let list = spec.split(",");
  let arr: string[] = [];
  let seq: string[] | null | undefined;
  list.forEach(function (item) {
    if (new RegExp(`^.+(-| ${rangeWord} ).+`).test(item)) {
      seq = parseSequence(item, rangeWord);
      if (seq) {
        arr = arr.concat(seq);
      }
    } else {
      if (item !== "") {
        if (item !== " ") {
          arr.push(item.trim());
        }
      }
    }
  });
  return arr.length? arr : null;
}

export const formatFormula = (expression: string, replacement: string): string => {
  // Function to wrap variable names in single quotes, except the replacement string
  const wrapVariables = (match: string) => {
    // If the match is the replacement string, do not wrap it in single quotes
    return match === replacement ? match : `'${match}'`;
  };

  // Pattern to detect variable names and operators
  const variableAndOperatorPattern = /([a-zA-Z_]\w*)|([\+\-\*\/%<>=!]+)/g;

  // Replace variable names with their wrapped versions and handle operators
  const formattedExpression = expression.replace(variableAndOperatorPattern, (match, variable) => {
    if (variable) {
      // Wrap variable names in single quotes, except the replacement string
      return wrapVariables(variable);
    } else {
      // Directly return operators without modification
      return match;
    }
  });

  // Check if the entire expression is just a single variable equal to the replacement
  if (formattedExpression.trim() === replacement) {
    // If so, return the expression as is, without further modification
    return formattedExpression;
  }

  // Check if the expression contains any operators
  const containsOperators = /[+\-*/%<>=!]/.test(formattedExpression);

  // If the expression does not contain operators, format it as an equality with the replacement string
  if (!containsOperators) {
    return `${replacement} = ${formattedExpression}`;
  }

  // For expressions with operators, ensure the replacement string is correctly positioned
  return formattedExpression.includes(replacement) ? formattedExpression : `${replacement} ${formattedExpression}`;
};

export const extractVariablesFromFormula = (formula: string): string[] => {
  const variablePattern = /[a-zA-Z_]\w*/g;
  const variables = formula.match(variablePattern);
  return variables ? Array.from(new Set(variables)) : [];
};

