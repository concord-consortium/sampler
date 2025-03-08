/**
 * Utility class for parsing and manipulating formulas with variable references.
 * This class is designed to work with CODAP formula syntax.
 */
export class FormulaParser {
  // List of reserved keywords that should not be treated as variables
  private static readonly RESERVED_KEYWORDS = [
    // Logical operators
    'if', 'then', 'else', 'and', 'or', 'not', 'true', 'false',
    // Mathematical functions
    'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'round', 'floor', 'ceil',
    // Statistical functions
    'mean', 'median', 'mode', 'sum', 'count', 'min', 'max', 'stddev', 'variance',
    // String functions
    'concat', 'left', 'right', 'mid', 'len', 'lower', 'upper', 'trim',
    // Date functions
    'date', 'day', 'month', 'year', 'today'
  ];

  /**
   * Extracts variable references from a formula string.
   * 
   * @param formula - The formula string to parse
   * @returns An array of unique variable names found in the formula
   */
  static parseVariableReferences(formula: string): string[] {
    if (!formula) {
      return [];
    }

    // Handle special case for wildcard formula
    if (formula === "*") {
      return [];
    }

    // Remove string literals to avoid parsing variables inside strings
    const formulaWithoutStrings = formula.replace(/"([^"\\]|\\.)*"/g, '""');
    
    // Match potential variable names (alphanumeric + underscore, not starting with a digit)
    // Also handle CODAP's backtick-quoted attribute names
    
    // Extract regular variable names
    const regularVars = formulaWithoutStrings.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    
    // Extract backtick-quoted attribute names
    const quotedVarMatches = formulaWithoutStrings.match(/`([^`]+)`/g) || [];
    const quotedVars = quotedVarMatches.map(match => match.slice(1, -1)); // Remove backticks
    
    // Combine and filter out reserved keywords and duplicates
    const allVars = [...regularVars, ...quotedVars];
    const uniqueVars = [...new Set(allVars)].filter(
      varName => !this.RESERVED_KEYWORDS.includes(varName.toLowerCase())
    );
    
    return uniqueVars;
  }

  /**
   * Replaces all occurrences of a variable name in a formula with a new name.
   * 
   * @param formula - The formula string to modify
   * @param oldName - The variable name to replace
   * @param newName - The new variable name
   * @returns The updated formula string
   */
  static replaceVariableReferences(formula: string, oldName: string, newName: string): string {
    if (!formula || !oldName) {
      return formula;
    }

    // Handle special case for wildcard formula
    if (formula === "*") {
      return formula;
    }

    let result = formula;
    
    // Replace regular variable references (not quoted)
    const regularRegex = new RegExp(`\\b${this.escapeRegExp(oldName)}\\b(?![\`'])`, 'g');
    result = this.replaceOutsideStringLiterals(result, regularRegex, newName);
    
    // Replace backtick-quoted attribute names
    const quotedRegex = new RegExp(`\`${this.escapeRegExp(oldName)}\``, 'g');
    result = this.replaceOutsideStringLiterals(result, quotedRegex, `\`${newName}\``);
    
    return result;
  }

  /**
   * Replaces text in a formula, but only outside of string literals.
   * 
   * @param formula - The formula string
   * @param regex - The regex pattern to replace
   * @param replacement - The replacement string
   * @returns The updated formula string
   */
  private static replaceOutsideStringLiterals(formula: string, regex: RegExp, replacement: string): string {
    // Split the formula by string literals
    const parts = this.splitByStringLiterals(formula);
    
    // Replace variables only in code parts (not in string literals)
    for (let i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(regex, replacement);
    }
    
    // Rejoin the formula
    return parts.join('');
  }

  /**
   * Escapes special characters in a string for use in a regular expression.
   * 
   * @param string - The string to escape
   * @returns The escaped string
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Splits a formula string by string literals, preserving the literals.
   * 
   * @param formula - The formula string to split
   * @returns An array where even indices contain code and odd indices contain string literals
   */
  private static splitByStringLiterals(formula: string): string[] {
    const result: string[] = [];
    let currentPart = '';
    let inString = false;
    
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      
      // Handle string literal boundaries
      if (char === '"' && (i === 0 || formula[i - 1] !== '\\')) {
        // Add the current part to the result
        result.push(currentPart);
        currentPart = '"';
        inString = !inString;
      } else {
        currentPart += char;
      }
      
      // If we're at the end of the string, add the last part
      if (i === formula.length - 1) {
        result.push(currentPart);
      }
    }
    
    return result;
  }
} 
