import {
  calcPct,
  gcd,
  lcm,
  isOneThirdOrTwoThirds,
  percentageToFraction,
  findCommonDenominator,
  findEquivNum,
  fewestNumbersToSum,
  getNextVariable,
  getNewVariable,
  getProportionalVars,
  getVariableCount,
  getPercentOfVar,
  getFirstAndLastIndexOfVar,
  getNewPcts,
  createNewVarArray,
  getRandomElement,
  getNewColumnName
} from './helpers';
import { IColumn, IVariables } from '../types';

describe('helpers.ts', () => {
  // Basic math functions
  describe('calcPct', () => {
    it('calculates percentage correctly', () => {
      expect(calcPct(25, 100)).toBe(25);
      expect(calcPct(1, 3)).toBe(33);
      expect(calcPct(2, 3)).toBe(67);
      expect(calcPct(0, 100)).toBe(0);
    });
  });

  describe('gcd', () => {
    it('calculates greatest common divisor correctly', () => {
      expect(gcd(12, 8)).toBe(4);
      expect(gcd(17, 5)).toBe(1);
      expect(gcd(0, 5)).toBe(5);
      expect(gcd(5, 0)).toBe(5);
      expect(gcd(48, 18)).toBe(6);
    });
  });

  describe('lcm', () => {
    it('calculates least common multiple correctly', () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(3, 5)).toBe(15);
      expect(lcm(2, 8)).toBe(8);
      expect(lcm(7, 13)).toBe(91);
    });
  });

  describe('isOneThirdOrTwoThirds', () => {
    it('returns true for 33 and 67', () => {
      expect(isOneThirdOrTwoThirds(33)).toBe(true);
      expect(isOneThirdOrTwoThirds(67)).toBe(true);
    });

    it('returns false for other values', () => {
      expect(isOneThirdOrTwoThirds(50)).toBe(false);
      expect(isOneThirdOrTwoThirds(0)).toBe(false);
      expect(isOneThirdOrTwoThirds(100)).toBe(false);
    });
  });

  describe('percentageToFraction', () => {
    it('converts percentage to simplified fraction', () => {
      expect(percentageToFraction(50)).toEqual([1, 2]);
      expect(percentageToFraction(25)).toEqual([1, 4]);
      expect(percentageToFraction(75)).toEqual([3, 4]);
      expect(percentageToFraction(33)).toEqual([33, 100]);
      expect(percentageToFraction(100)).toEqual([1, 1]);
    });
  });

  describe('findCommonDenominator', () => {
    it('finds common denominator for array of percentages', () => {
      expect(findCommonDenominator([50, 50])).toBe(2);
      expect(findCommonDenominator([25, 75])).toBe(4);
      expect(findCommonDenominator([33, 67])).toBe(100);
      expect(findCommonDenominator([20, 30, 50])).toBe(10);
    });
  });

  describe('findEquivNum', () => {
    it('finds equivalent number based on least common denominator', () => {
      expect(findEquivNum(50, 10)).toBe(5);
      expect(findEquivNum(25, 20)).toBe(5);
      expect(findEquivNum(33, 300)).toBe(99);
      expect(findEquivNum(10, 50)).toBe(5);
    });
  });

  describe('fewestNumbersToSum', () => {
    it('distributes target sum among count numbers as evenly as possible', () => {
      expect(fewestNumbersToSum(10, 2)).toEqual([5, 5]);
      expect(fewestNumbersToSum(11, 2)).toEqual([6, 5]);
      expect(fewestNumbersToSum(10, 3)).toEqual([4, 3, 3]);
      expect(fewestNumbersToSum(7, 3)).toEqual([3, 2, 2]);
      expect(fewestNumbersToSum(5, 1)).toEqual([5]);
    });
  });

  // Variable-related functions
  describe('getNextVariable', () => {
    it('returns the next unique variable in the array', () => {
      const variables: IVariables = ['a', 'b', 'b', 'c', 'd'];
      expect(getNextVariable(0, variables)).toBe('b');
      expect(getNextVariable(1, variables)).toBe('c');
      expect(getNextVariable(2, variables)).toBe('c');
      expect(getNextVariable(3, variables)).toBe('d');
    });

    it('returns undefined if there is no next variable', () => {
      const variables: IVariables = ['a', 'b', 'c'];
      expect(getNextVariable(2, variables)).toBeUndefined();
    });
  });

  describe('getNewVariable', () => {
    it('returns next numeric variable when variables are numeric', () => {
      const variables: IVariables = ['1', '2', '3'];
      expect(getNewVariable(variables)).toBe('4');
    });

    it('returns next alphabetic variable when variables are alphabetic', () => {
      const variables: IVariables = ['a', 'b', 'c'];
      expect(getNewVariable(variables)).toBe('d');
    });

    it('returns next alphabetic variable when variables are mixed', () => {
      const variables: IVariables = ['a', '1', 'b'];
      expect(getNewVariable(variables)).toBe('c');
    });

    it('handles uppercase letters', () => {
      const variables: IVariables = ['A', 'B', 'C'];
      expect(getNewVariable(variables)).toBe('D');
    });

    it('handles empty arrays', () => {
      const variables: IVariables = [];
      expect(getNewVariable(variables)).toBe('-Infinity');
    });
  });

  describe('getVariableCount', () => {
    it('counts occurrences of a variable in the array', () => {
      const variables: IVariables = ['a', 'b', 'a', 'c', 'a', 'b'];
      expect(getVariableCount('a', variables)).toBe(3);
      expect(getVariableCount('b', variables)).toBe(2);
      expect(getVariableCount('c', variables)).toBe(1);
      expect(getVariableCount('d', variables)).toBe(0);
    });
  });

  describe('getPercentOfVar', () => {
    it('calculates the percentage of a variable in the array', () => {
      const variables: IVariables = ['a', 'b', 'a', 'c', 'a', 'b'];
      expect(getPercentOfVar('a', variables)).toBe(50); // 3/6 = 50%
      expect(getPercentOfVar('b', variables)).toBe(33); // 2/6 = 33.33% (rounded)
      expect(getPercentOfVar('c', variables)).toBe(17); // 1/6 = 16.67% (rounded)
      expect(getPercentOfVar('d', variables)).toBe(0);  // 0/6 = 0%
    });
  });

  describe('getFirstAndLastIndexOfVar', () => {
    it('finds the first and last index of a variable in the array', () => {
      const variables: IVariables = ['a', 'b', 'a', 'c', 'a', 'b'];
      
      // The function calculates lastIndexOfVar as:
      // firstIndexOfVar + (count of variable - 1)
      
      // For 'a': firstIndex = 0, count = 3, so lastIndex = 0 + (3-1) = 2
      expect(getFirstAndLastIndexOfVar('a', variables)).toEqual({
        firstIndexOfVar: 0,
        lastIndexOfVar: 2
      });
      
      // For 'b': firstIndex = 1, count = 2, so lastIndex = 1 + (2-1) = 2
      expect(getFirstAndLastIndexOfVar('b', variables)).toEqual({
        firstIndexOfVar: 1,
        lastIndexOfVar: 2
      });
      
      // For 'c': firstIndex = 3, count = 1, so lastIndex = 3 + (1-1) = 3
      expect(getFirstAndLastIndexOfVar('c', variables)).toEqual({
        firstIndexOfVar: 3,
        lastIndexOfVar: 3
      });
    });

    it('handles variables not in the array', () => {
      const variables: IVariables = ['a', 'b', 'c'];
      expect(getFirstAndLastIndexOfVar('d', variables)).toEqual({
        firstIndexOfVar: -1,
        lastIndexOfVar: -2
      });
    });
  });

  describe('getProportionalVars', () => {
    it('creates a new array with proportional variables including a new variable', () => {
      const variables: IVariables = ['a', 'a', 'b', 'b'];
      const result = getProportionalVars(variables);
      
      // Check that the result has the expected length
      expect(result.length).toBeGreaterThan(0);
      
      // Check that the result contains the original variables plus a new one
      const uniqueVars = [...new Set(result)];
      expect(uniqueVars).toContain('a');
      expect(uniqueVars).toContain('b');
      expect(uniqueVars.length).toBe(3); // a, b, and a new variable
      
      // Check that the proportions are roughly correct
      const aCount = result.filter(v => v === 'a').length;
      const bCount = result.filter(v => v === 'b').length;
      const newVarCount = result.filter(v => v !== 'a' && v !== 'b').length;
      
      expect(aCount).toBeLessThan(result.length / 2); // Less than 50%
      expect(bCount).toBeLessThan(result.length / 2); // Less than 50%
      expect(newVarCount).toBeGreaterThan(0); // At least one
      
      // Sum of all counts should equal total length
      expect(aCount + bCount + newVarCount).toBe(result.length);
    });
  });

  describe('getNewPcts', () => {
    it('updates percentages when updateNext is true', () => {
      const variables: IVariables = ['a', 'a', 'a', 'b', 'b', 'c'];
      const result = getNewPcts({
        newPct: 60,
        oldPct: 50,
        selectedVar: 'a',
        variables,
        updateNext: true
      });
      
      // Check that the result has the expected structure
      expect(result).toHaveProperty('newPcts');
      expect(result).toHaveProperty('newPctsMap');
      
      // The difference of 10% should be subtracted from the adjacent variable 'b'
      expect(result.newPctsMap['b']).toBe(23); // 33% - 10% = 23%
      expect(result.newPctsMap['c']).toBe(17); // Unchanged
    });

    it('updates percentages when updateNext is false', () => {
      const variables: IVariables = ['a', 'a', 'a', 'b', 'b', 'c'];
      const result = getNewPcts({
        newPct: 60,
        oldPct: 50,
        selectedVar: 'a',
        variables,
        updateNext: false
      });
      
      // Check that the result has the expected structure
      expect(result).toHaveProperty('newPcts');
      expect(result).toHaveProperty('newPctsMap');
      
      // The difference of 10% should be distributed among unselected variables
      const totalUnselectedPct = result.newPcts.reduce((sum, pct) => sum + pct, 0);
      expect(totalUnselectedPct).toBe(40); // 100% - 60% = 40%
      
      // Sum of all percentages should be 100%
      const totalPct = result.newPcts.reduce((sum, pct) => sum + pct, 0) + 60;
      expect(totalPct).toBe(100);
    });
  });

  describe('createNewVarArray', () => {
    it('creates a new array with updated variable percentages', () => {
      const variables: IVariables = ['a', 'a', 'a', 'b', 'b', 'b'];
      const result = createNewVarArray('a', variables, 33);
      
      // Check that the result has the expected length
      expect(result.length).toBeGreaterThan(0);
      
      // Check that the result contains the original variables
      const uniqueVars = [...new Set(result)];
      expect(uniqueVars).toContain('a');
      expect(uniqueVars).toContain('b');
      
      // Check that the proportions are correct
      const aCount = result.filter(v => v === 'a').length;
      const bCount = result.filter(v => v === 'b').length;
      
      expect(aCount).toBe(1); // 33% = 1/3
      expect(bCount).toBe(2); // 67% = 2/3
      
      // Sum of all counts should equal total length
      expect(aCount + bCount).toBe(result.length);
    });

    it('handles the special case of 33% and 67%', () => {
      const variables: IVariables = ['a', 'a', 'a', 'a', 'b', 'b'];
      const result = createNewVarArray('a', variables, 33);
      
      // Check that the result has the expected length
      expect(result.length).toBe(3);
      
      // Check that the proportions are correct
      const aCount = result.filter(v => v === 'a').length;
      const bCount = result.filter(v => v === 'b').length;
      
      expect(aCount).toBe(1); // 33% = 1/3
      expect(bCount).toBe(2); // 67% = 2/3
    });

    it('handles updateNext parameter', () => {
      const variables: IVariables = ['a', 'a', 'b', 'b', 'c', 'c'];
      const result = createNewVarArray('a', variables, 50, true);
      
      // Check that the result has the expected length
      expect(result.length).toBeGreaterThan(0);
      
      // Check that the proportions are correct
      const aCount = result.filter(v => v === 'a').length;
      const bCount = result.filter(v => v === 'b').length;
      const cCount = result.filter(v => v === 'c').length;
      
      // 'a' should be 50%, and the change should primarily affect 'b' (the adjacent variable)
      expect(aCount / result.length).toBeCloseTo(0.5, 1);
      
      // Sum of all counts should equal total length
      expect(aCount + bCount + cCount).toBe(result.length);
    });
  });

  describe('getRandomElement', () => {
    it('returns an element from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = getRandomElement(array);
      expect(array).toContain(result);
    });

    it('works with string arrays', () => {
      const array = ['a', 'b', 'c'];
      const result = getRandomElement(array);
      expect(array).toContain(result);
    });

    it('works with empty arrays', () => {
      const array: number[] = [];
      const result = getRandomElement(array);
      expect(result).toBeUndefined();
    });
  });

  describe('getNewColumnName', () => {
    it('returns the proposed name if it is unique', () => {
      const columns: IColumn[] = [
        { name: 'Column1', id: '1', devices: [] },
        { name: 'Column2', id: '2', devices: [] }
      ];
      expect(getNewColumnName('Column3', columns)).toBe('Column3');
    });

    it('appends a number if the name is not unique', () => {
      const columns: IColumn[] = [
        { name: 'Column', id: '1', devices: [] },
        { name: 'Column2', id: '2', devices: [] }
      ];
      expect(getNewColumnName('Column', columns)).toBe('Column3');
    });

    it('finds the next available number if sequential numbers are used', () => {
      const columns: IColumn[] = [
        { name: 'Column', id: '1', devices: [] },
        { name: 'Column2', id: '2', devices: [] },
        { name: 'Column3', id: '3', devices: [] },
        { name: 'Column5', id: '5', devices: [] }
      ];
      expect(getNewColumnName('Column', columns)).toBe('Column4');
    });

    it('handles columns with the same name but different IDs', () => {
      const columns: IColumn[] = [
        { name: 'Column', id: '1', devices: [] },
        { name: 'Column', id: '2', devices: [] }
      ];
      expect(getNewColumnName('Column', columns, '2')).toBe('Column2');
    });
  });
}); 