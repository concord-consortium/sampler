import { FormulaParser } from './FormulaParser';
import { FormulaReferenceTracker } from './FormulaReferenceTracker';

describe('Formula Variable Renaming Integration', () => {
  let tracker: FormulaReferenceTracker;

  beforeEach(() => {
    tracker = new FormulaReferenceTracker();
  });

  it('should correctly track and update formulas with variable references', () => {
    // Track multiple formulas with variable references
    tracker.trackFormula('formula1', 'x + y');
    tracker.trackFormula('formula2', 'x * z');
    tracker.trackFormula('formula3', 'a + b');

    // Verify initial tracking
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(2);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('z')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('a')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('b')).toHaveLength(1);

    // Update a variable name
    const affectedFormulas = tracker.updateVariableName('x', 'newX');

    // Verify affected formulas
    expect(affectedFormulas).toHaveLength(2);
    expect(affectedFormulas.map(f => f.formulaId)).toContain('formula1');
    expect(affectedFormulas.map(f => f.formulaId)).toContain('formula2');

    // Verify updated formulas
    expect(tracker.getUpdatedFormula('formula1')).toBe('newX + y');
    expect(tracker.getUpdatedFormula('formula2')).toBe('newX * z');
    expect(tracker.getUpdatedFormula('formula3')).toBe('a + b');

    // Verify updated tracking
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('newX')).toHaveLength(2);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(1);
  });

  it('should handle complex formulas with multiple variable references', () => {
    // Track a complex formula
    const complexFormula = 'x * (y + z) / 2 + `Variable with spaces`';
    tracker.trackFormula('complex', complexFormula);

    // Verify initial tracking
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('z')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('Variable with spaces')).toHaveLength(1);

    // Update multiple variable names
    tracker.updateVariableName('x', 'newX');
    tracker.updateVariableName('y', 'newY');
    tracker.updateVariableName('Variable with spaces', 'New Variable');

    // Verify updated formula
    expect(tracker.getUpdatedFormula('complex')).toBe('newX * (newY + z) / 2 + `New Variable`');

    // Verify updated tracking
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('Variable with spaces')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('newX')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('newY')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('New Variable')).toHaveLength(1);
  });

  it('should handle removing and re-tracking formulas', () => {
    // Track formulas
    tracker.trackFormula('formula1', 'x + y');
    tracker.trackFormula('formula2', 'x * z');

    // Remove a formula
    tracker.removeFormula('formula1');

    // Verify tracking after removal
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('z')).toHaveLength(1);

    // Re-track with different variables
    tracker.trackFormula('formula1', 'a + b');

    // Verify tracking after re-tracking
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('z')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('a')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('b')).toHaveLength(1);

    // Update a variable name
    tracker.updateVariableName('x', 'newX');

    // Verify only formula2 was updated
    expect(tracker.getUpdatedFormula('formula1')).toBe('a + b');
    expect(tracker.getUpdatedFormula('formula2')).toBe('newX * z');
  });

  it('should handle CODAP-specific formula syntax', () => {
    // Track formulas with CODAP-specific syntax
    tracker.trackFormula('formula1', 'mean(`Sample Size`)');
    tracker.trackFormula('formula2', 'count(`Sample Size` > 10)');
    tracker.trackFormula('formula3', '`First Variable` + `Second Variable`');

    // Verify initial tracking
    expect(tracker.getFormulasReferencingVariable('Sample Size')).toHaveLength(2);
    expect(tracker.getFormulasReferencingVariable('First Variable')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('Second Variable')).toHaveLength(1);

    // Update variable names
    tracker.updateVariableName('Sample Size', 'Sample Count');
    tracker.updateVariableName('First Variable', 'Primary Variable');

    // Verify updated formulas
    expect(tracker.getUpdatedFormula('formula1')).toBe('mean(`Sample Count`)');
    expect(tracker.getUpdatedFormula('formula2')).toBe('count(`Sample Count` > 10)');
    expect(tracker.getUpdatedFormula('formula3')).toBe('`Primary Variable` + `Second Variable`');
  });

  it('should handle special cases like wildcard formulas', () => {
    // Track a wildcard formula
    tracker.trackFormula('wildcard', '*');

    // Verify no variables are tracked
    expect(tracker.getFormulasReferencingVariable('*')).toHaveLength(0);

    // Update the formula
    tracker.trackFormula('wildcard', 'x + y');

    // Verify variables are now tracked
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(1);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(1);

    // Change back to wildcard
    tracker.trackFormula('wildcard', '*');

    // Verify no variables are tracked again
    expect(tracker.getFormulasReferencingVariable('x')).toHaveLength(0);
    expect(tracker.getFormulasReferencingVariable('y')).toHaveLength(0);
  });
}); 
