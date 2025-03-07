/**
 * Condition parser utility for the Repeat Until feature
 * Handles parsing and evaluating conditions for determining when to stop repeating
 */

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
 * Evaluates a condition against sample data
 * @param condition - The parsed condition to evaluate
 * @param sampleData - Array of sample data objects to evaluate against
 * @returns Boolean indicating if the condition is met
 */
export const evaluateCondition = (
  condition: IParsedCondition | null,
  sampleData: Array<Record<string, any>>
): boolean => {
  // Handle null or empty conditions
  if (!condition || condition.type === ConditionType.NONE) {
    return false;
  }

  if (condition.type === ConditionType.FORMULA) {
    try {
      // Simple evaluation for basic formulas
      // In a real implementation, this would need to be more sophisticated
      // to handle variables and context from sampleData
      return eval(condition.value) === true;
    } catch (error) {
      console.error('Error evaluating formula condition:', error);
      return false;
    }
  }

  if (condition.type === ConditionType.PATTERN) {
    // Check if any sample data contains the pattern
    const patternString = condition.value.toLowerCase();
    const patterns = patternString.split(',').map(p => p.trim());
    
    // Convert sample data to string for pattern matching
    const sampleString = JSON.stringify(sampleData).toLowerCase();
    
    // Check if any pattern is found in the sample data
    return patterns.some(pattern => sampleString.includes(pattern));
  }

  return false;
}; 
