import { parseCondition, evaluateCondition, ConditionType } from '.';
import codapInterface from '../lib/codap-interface';

// Mock the CODAP interface
jest.mock('../lib/codap-interface', () => ({
  sendRequest: jest.fn()
}));

describe('Condition Parser', () => {
  describe('parseCondition', () => {
    it('should parse a formula condition', () => {
      const condition = '=x > 5';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.FORMULA);
      expect(result.value).toBe('x > 5');
    });

    it('should parse a pattern condition', () => {
      const condition = 'heads,tails,heads';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.PATTERN);
      expect(result.value).toBe('heads,tails,heads');
    });

    it('should handle empty conditions', () => {
      const condition = '';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.NONE);
      expect(result.value).toBe('');
    });

    it('should handle whitespace in conditions', () => {
      const condition = '  =  x > 5  ';
      const result = parseCondition(condition);
      expect(result.type).toBe(ConditionType.FORMULA);
      expect(result.value).toBe('x > 5');
    });
  });

  describe('evaluateCondition', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return false for null or empty conditions', async () => {
      const result1 = await evaluateCondition(null, []);
      expect(result1).toBe(false);

      const result2 = await evaluateCondition({ type: ConditionType.NONE, value: '' }, []);
      expect(result2).toBe(false);
    });

    it('should evaluate formula conditions using CODAP API', async () => {
      // Mock successful API response
      (codapInterface.sendRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        values: true
      });

      const condition = { type: ConditionType.FORMULA, value: 'count(output="a")' };
      const sampleData = [{ output: 'a' }];
      
      const result = await evaluateCondition(condition, sampleData);
      
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: 'formulaEngine',
        resource: 'evalExpression',
        values: {
          expression: 'count(output="a")',
          context: { sampleData }
        }
      });
      
      expect(result).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      (codapInterface.sendRequest as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      const condition = { type: ConditionType.FORMULA, value: 'invalid formula' };
      const sampleData = [{ output: 'a' }];
      
      const result = await evaluateCondition(condition, sampleData);
      
      expect(result).toBe(false);
    });

    it('should evaluate pattern conditions correctly', async () => {
      const condition = { type: ConditionType.PATTERN, value: 'a,b,a' };
      const sampleData = [{ output: 'c' }, { output: 'a' }, { output: 'b' }, { output: 'a' }];
      
      const result = await evaluateCondition(condition, sampleData);
      
      expect(result).toBe(true);
    });

    it('should return false when pattern is not found', async () => {
      const condition = { type: ConditionType.PATTERN, value: 'a,b,c' };
      const sampleData = [{ output: 'a' }, { output: 'b' }, { output: 'a' }];
      
      const result = await evaluateCondition(condition, sampleData);
      
      expect(result).toBe(false);
    });
  });
}); 
