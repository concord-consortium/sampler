import { FormulaParser } from './FormulaParser';

describe('FormulaParser', () => {
  describe('parseVariableReferences', () => {
    it('should extract variable references from a simple formula', () => {
      const formula = 'x + y';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y']);
    });

    it('should extract variable references from a complex formula', () => {
      const formula = 'x * (y + z) / 2';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y', 'z']);
    });

    it('should handle formulas with function calls', () => {
      const formula = 'sin(x) + cos(y)';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y']);
    });

    it('should handle formulas with numeric literals', () => {
      const formula = '2 * x + 3.5 * y';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y']);
    });

    it('should handle formulas with string literals', () => {
      const formula = 'x + "test" + y';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y']);
    });

    it('should handle formulas with variable names containing underscores', () => {
      const formula = 'first_var + second_var';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['first_var', 'second_var']);
    });

    it('should return an empty array for formulas without variables', () => {
      const formula = '2 + 3 * 4';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual([]);
    });

    it('should handle empty formulas', () => {
      const formula = '';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual([]);
    });

    it('should not extract reserved keywords as variables', () => {
      const formula = 'if x > 10 then y else z';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y', 'z']);
      expect(result).not.toContain('if');
      expect(result).not.toContain('then');
      expect(result).not.toContain('else');
    });

    it('should handle formulas with repeated variable references', () => {
      const formula = 'x + x + y';
      const result = FormulaParser.parseVariableReferences(formula);
      expect(result).toEqual(['x', 'y']);
    });
  });

  describe('replaceVariableReferences', () => {
    it('should replace all occurrences of a variable in a simple formula', () => {
      const formula = 'x + y';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('newX + y');
    });

    it('should replace all occurrences of a variable in a complex formula', () => {
      const formula = 'x * (y + z) / 2';
      const result = FormulaParser.replaceVariableReferences(formula, 'y', 'newY');
      expect(result).toBe('x * (newY + z) / 2');
    });

    it('should handle formulas with function calls', () => {
      const formula = 'sin(x) + cos(y)';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('sin(newX) + cos(y)');
    });

    it('should not replace substrings of variable names', () => {
      const formula = 'xy + yx';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('xy + yx');
    });

    it('should handle formulas with variable names containing underscores', () => {
      const formula = 'first_var + second_var';
      const result = FormulaParser.replaceVariableReferences(formula, 'first_var', 'new_var');
      expect(result).toBe('new_var + second_var');
    });

    it('should not modify the formula if the variable is not found', () => {
      const formula = 'x + y';
      const result = FormulaParser.replaceVariableReferences(formula, 'z', 'newZ');
      expect(result).toBe('x + y');
    });

    it('should handle empty formulas', () => {
      const formula = '';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('');
    });

    it('should replace all occurrences of a variable', () => {
      const formula = 'x + x + y';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('newX + newX + y');
    });

    it('should handle variable names that are substrings of other variable names', () => {
      const formula = 'x + x1 + x2';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('newX + x1 + x2');
    });

    it('should not replace variables inside string literals', () => {
      const formula = 'x + "x" + y';
      const result = FormulaParser.replaceVariableReferences(formula, 'x', 'newX');
      expect(result).toBe('newX + "x" + y');
    });
  });
}); 
