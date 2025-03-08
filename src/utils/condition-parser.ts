/**
 * Condition parser utility for the Repeat Until feature
 * Handles parsing and evaluating conditions for determining when to stop repeating
 */

import codapInterface from '../lib/codap-interface';

/**
 * Enum for condition types
 */
export enum ConditionType {
  FORMULA = 'formula',
  PATTERN = 'pattern',
  NONE = 'none'
}

/**
 * Interface for parsed condition
 */
export interface IParsedCondition {
  type: ConditionType;
  value: string;
}

/**
 * Parses a condition string into a structured condition object
 * @param condition - The condition string to parse
 * @returns A parsed condition object with type and value
 */
export const parseCondition = (condition: string): IParsedCondition => {
  // Handle empty conditions
  if (!condition || condition.trim() === '') {
    return {
      type: ConditionType.NONE,
      value: ''
    };
  }

  const trimmedCondition = condition.trim();
  
  // Check if it's a formula (starts with =)
  if (trimmedCondition.startsWith('=')) {
    return {
      type: ConditionType.FORMULA,
      value: trimmedCondition.substring(1).trim() // Remove the = and trim
    };
  }
  
  // Otherwise, it's a pattern
  return {
    type: ConditionType.PATTERN,
    value: trimmedCondition
  };
};

/**
 * Evaluates a pattern condition against sample data
 * @param pattern - The pattern to match
 * @param sampleData - Array of sample data objects to evaluate against
 * @returns Boolean indicating if the pattern is found
 */
const evaluatePatternCondition = (pattern: string, sampleData: Array<Record<string, any>>): boolean => {
  const patternValues = pattern.toLowerCase().split(',').map(p => p.trim());
  
  // Extract values from sample data
  const sampleValues = sampleData.map(item => 
    item.output ? item.output.toString().toLowerCase() : ''
  );
  
  // Check if the pattern exists in the sequence
  for (let i = 0; i <= sampleValues.length - patternValues.length; i++) {
    let match = true;
    for (let j = 0; j < patternValues.length; j++) {
      if (sampleValues[i + j] !== patternValues[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  
  return false;
};

/**
 * Evaluates a formula condition using the CODAP API
 * @param formula - The formula to evaluate
 * @param sampleData - Array of sample data objects to evaluate against
 * @returns Promise resolving to a boolean indicating if the condition is met
 */
const evaluateFormulaCondition = async (
  formula: string, 
  sampleData: Array<Record<string, any>>
): Promise<boolean> => {
  try {
    const result = await codapInterface.sendRequest({
      action: 'formulaEngine',
      resource: 'evalExpression',
      values: {
        expression: formula,
        context: { sampleData }
      }
    });
    
    // Check if the result is a boolean or can be coerced to a boolean
    return Boolean(result.success && result.values);
  } catch (error) {
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error evaluating formula condition:', error);
    }
    return false;
  }
};

/**
 * Evaluates a condition against sample data
 * @param condition - The parsed condition to evaluate
 * @param sampleData - Array of sample data objects to evaluate against
 * @returns Promise resolving to a boolean indicating if the condition is met
 */
export const evaluateCondition = async (
  condition: IParsedCondition | null,
  sampleData: Array<Record<string, any>>
): Promise<boolean> => {
  // Handle null or empty conditions
  if (!condition || condition.type === ConditionType.NONE) {
    return false;
  }

  if (condition.type === ConditionType.FORMULA) {
    return await evaluateFormulaCondition(condition.value, sampleData);
  }

  if (condition.type === ConditionType.PATTERN) {
    return evaluatePatternCondition(condition.value, sampleData);
  }

  return false;
}; 
