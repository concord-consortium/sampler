import { FormulaReferenceTracker } from './FormulaReferenceTracker';

describe('FormulaReferenceTracker', () => {
  let tracker: FormulaReferenceTracker;

  beforeEach(() => {
    tracker = new FormulaReferenceTracker();
  });

  describe('trackFormula', () => {
    it('should track a formula with variable references', () => {
      tracker.trackFormula('formula1', 'x + y');
      const references = tracker.getReferences();
      
      expect(references.get('x')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'x'
      });
      
      expect(references.get('y')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'y'
      });
    });

    it('should track multiple formulas with the same variable', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.trackFormula('formula2', 'x * z');
      
      const references = tracker.getReferences();
      
      expect(references.get('x')).toHaveLength(2);
      expect(references.get('x')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'x'
      });
      expect(references.get('x')).toContainEqual({
        formulaId: 'formula2',
        variableName: 'x'
      });
    });

    it('should update tracking when a formula is re-tracked', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.trackFormula('formula1', 'a + b');
      
      const references = tracker.getReferences();
      
      expect(references.get('x')).toBeUndefined();
      expect(references.get('y')).toBeUndefined();
      
      expect(references.get('a')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'a'
      });
      
      expect(references.get('b')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'b'
      });
    });

    it('should handle formulas with no variable references', () => {
      tracker.trackFormula('formula1', '2 + 3');
      const references = tracker.getReferences();
      
      expect(references.size).toBe(0);
    });

    it('should handle empty formulas', () => {
      tracker.trackFormula('formula1', '');
      const references = tracker.getReferences();
      
      expect(references.size).toBe(0);
    });

    it('should handle CODAP backtick-quoted attribute names', () => {
      tracker.trackFormula('formula1', '`Variable 1` + `Variable 2`');
      const references = tracker.getReferences();
      
      expect(references.get('Variable 1')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'Variable 1'
      });
      
      expect(references.get('Variable 2')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'Variable 2'
      });
    });
  });

  describe('updateVariableName', () => {
    it('should update variable references in tracked formulas', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.trackFormula('formula2', 'x * z');
      
      const affectedFormulas = tracker.updateVariableName('x', 'newX');
      
      expect(affectedFormulas).toHaveLength(2);
      expect(affectedFormulas).toContainEqual({
        formulaId: 'formula1',
        variableName: 'x',
        newName: 'newX'
      });
      expect(affectedFormulas).toContainEqual({
        formulaId: 'formula2',
        variableName: 'x',
        newName: 'newX'
      });
    });

    it('should return an empty array if no formulas reference the variable', () => {
      tracker.trackFormula('formula1', 'a + b');
      
      const affectedFormulas = tracker.updateVariableName('x', 'newX');
      
      expect(affectedFormulas).toHaveLength(0);
    });

    it('should update the internal references map', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.updateVariableName('x', 'newX');
      
      const references = tracker.getReferences();
      
      expect(references.get('x')).toBeUndefined();
      expect(references.get('newX')).toContainEqual({
        formulaId: 'formula1',
        variableName: 'newX'
      });
    });
  });

  describe('getUpdatedFormula', () => {
    it('should return the updated formula with new variable names', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.updateVariableName('x', 'newX');
      
      const updatedFormula = tracker.getUpdatedFormula('formula1');
      
      expect(updatedFormula).toBe('newX + y');
    });

    it('should handle multiple variable renames in the same formula', () => {
      tracker.trackFormula('formula1', 'x + y + z');
      tracker.updateVariableName('x', 'newX');
      tracker.updateVariableName('y', 'newY');
      
      const updatedFormula = tracker.getUpdatedFormula('formula1');
      
      expect(updatedFormula).toBe('newX + newY + z');
    });

    it('should return the original formula if no variables were renamed', () => {
      tracker.trackFormula('formula1', 'a + b');
      tracker.updateVariableName('x', 'newX');
      
      const updatedFormula = tracker.getUpdatedFormula('formula1');
      
      expect(updatedFormula).toBe('a + b');
    });

    it('should return null if the formula is not tracked', () => {
      const updatedFormula = tracker.getUpdatedFormula('nonexistent');
      
      expect(updatedFormula).toBeNull();
    });

    it('should handle CODAP backtick-quoted attribute names', () => {
      tracker.trackFormula('formula1', '`Variable 1` + `Variable 2`');
      tracker.updateVariableName('Variable 1', 'New Variable');
      
      const updatedFormula = tracker.getUpdatedFormula('formula1');
      
      expect(updatedFormula).toBe('`New Variable` + `Variable 2`');
    });
  });

  describe('removeFormula', () => {
    it('should remove a formula from tracking', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.trackFormula('formula2', 'x * z');
      
      tracker.removeFormula('formula1');
      
      const references = tracker.getReferences();
      
      expect(references.get('x')).toHaveLength(1);
      expect(references.get('x')).toContainEqual({
        formulaId: 'formula2',
        variableName: 'x'
      });
      
      expect(references.get('y')).toBeUndefined();
    });

    it('should do nothing if the formula is not tracked', () => {
      tracker.trackFormula('formula1', 'x + y');
      
      tracker.removeFormula('nonexistent');
      
      const references = tracker.getReferences();
      
      expect(references.get('x')).toHaveLength(1);
      expect(references.get('y')).toHaveLength(1);
    });
  });

  describe('getFormulasReferencingVariable', () => {
    it('should return all formulas referencing a variable', () => {
      tracker.trackFormula('formula1', 'x + y');
      tracker.trackFormula('formula2', 'x * z');
      tracker.trackFormula('formula3', 'a + b');
      
      const formulas = tracker.getFormulasReferencingVariable('x');
      
      expect(formulas).toHaveLength(2);
      expect(formulas).toContain('formula1');
      expect(formulas).toContain('formula2');
    });

    it('should return an empty array if no formulas reference the variable', () => {
      tracker.trackFormula('formula1', 'a + b');
      
      const formulas = tracker.getFormulasReferencingVariable('x');
      
      expect(formulas).toHaveLength(0);
    });
  });
}); 
