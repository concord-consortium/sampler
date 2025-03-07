import { parseCondition, evaluateCondition, ConditionType } from '.';

describe('Condition Parser', () => {
  describe('parseCondition', () => {
    it('should parse a formula condition', () => {
      const condition = '=x > 5';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.FORMULA);
      expect(result.value).toBe('x > 5');
    });

    it('should parse a pattern condition', () => {
      const condition = 'apple,banana,orange';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.PATTERN);
      expect(result.value).toBe('apple,banana,orange');
    });

    it('should handle empty conditions', () => {
      const condition = '';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.NONE);
      expect(result.value).toBe('');
    });

    it('should trim whitespace in patterns', () => {
      const condition = '  apple, banana, orange  ';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.PATTERN);
      expect(result.value).toBe('apple, banana, orange');
    });

    it('should trim whitespace in formulas', () => {
      const condition = '  =x > 5  ';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.FORMULA);
      expect(result.value).toBe('x > 5');
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate a formula condition as true', () => {
      const condition = parseCondition('=true');
      const result = evaluateCondition(condition, []);
      expect(result).toBe(true);
    });

    it('should evaluate a formula condition as false', () => {
      const condition = parseCondition('=false');
      const result = evaluateCondition(condition, []);
      expect(result).toBe(false);
    });

    it('should evaluate a pattern condition with matching pattern', () => {
      const condition = parseCondition('apple');
      const sampleData = [
        { fruit: 'apple', count: 5 },
        { fruit: 'banana', count: 3 }
      ];
      const result = evaluateCondition(condition, sampleData);
      expect(result).toBe(true);
    });

    it('should evaluate a pattern condition with non-matching pattern', () => {
      const condition = parseCondition('grape');
      const sampleData = [
        { fruit: 'apple', count: 5 },
        { fruit: 'banana', count: 3 }
      ];
      const result = evaluateCondition(condition, sampleData);
      expect(result).toBe(false);
    });

    it('should handle null condition', () => {
      const result = evaluateCondition(null, []);
      expect(result).toBe(false);
    });

    it('should handle empty condition', () => {
      const condition = parseCondition('');
      const result = evaluateCondition(condition, []);
      expect(result).toBe(false);
    });
  });
}); 
