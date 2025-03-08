import { FormulaParser } from './FormulaParser';

/**
 * Interface representing a reference to a variable in a formula
 */
export interface FormulaReference {
  /** Unique identifier for the formula */
  formulaId: string;
  /** Name of the variable referenced in the formula */
  variableName: string;
  /** New name for the variable if it has been renamed */
  newName?: string;
}

/**
 * Utility class for tracking and managing formula references to variables
 */
export class FormulaReferenceTracker {
  /** Map of variable names to their references in formulas */
  private references: Map<string, FormulaReference[]>;
  /** Map of formula IDs to their original formula strings */
  private formulas: Map<string, string>;
  /** Map of formula IDs to their current formula strings (after variable renames) */
  private currentFormulas: Map<string, string>;

  constructor() {
    this.references = new Map();
    this.formulas = new Map();
    this.currentFormulas = new Map();
  }

  /**
   * Track a formula and its variable references
   * 
   * @param formulaId - Unique identifier for the formula
   * @param formula - The formula string to track
   */
  trackFormula(formulaId: string, formula: string): void {
    // Remove any existing references to this formula
    this.removeFormula(formulaId);

    // Store the original formula
    this.formulas.set(formulaId, formula);
    this.currentFormulas.set(formulaId, formula);

    // Extract variable references from the formula
    const variableNames = FormulaParser.parseVariableReferences(formula);

    // Add references for each variable
    variableNames.forEach(variableName => {
      const reference: FormulaReference = {
        formulaId,
        variableName
      };

      if (!this.references.has(variableName)) {
        this.references.set(variableName, []);
      }

      this.references.get(variableName)?.push(reference);
    });
  }

  /**
   * Update all references to a variable with a new name
   * 
   * @param oldName - The current variable name
   * @param newName - The new variable name
   * @returns Array of affected formula references
   */
  updateVariableName(oldName: string, newName: string): FormulaReference[] {
    const affectedReferences = this.references.get(oldName) || [];
    const result: FormulaReference[] = [];

    // Update each reference
    affectedReferences.forEach(reference => {
      // Create a new reference without the newName property
      const updatedReference: FormulaReference = {
        formulaId: reference.formulaId,
        variableName: newName
      };

      // Add to result with the newName property for tracking the change
      result.push({
        ...reference,
        newName
      });

      // Update the current formula
      const currentFormula = this.currentFormulas.get(reference.formulaId);
      if (currentFormula) {
        const updatedFormula = FormulaParser.replaceVariableReferences(
          currentFormula,
          oldName,
          newName
        );
        this.currentFormulas.set(reference.formulaId, updatedFormula);
      }

      // Remove the old reference
      this.removeVariableReference(oldName, reference.formulaId);

      // Add the new reference
      if (!this.references.has(newName)) {
        this.references.set(newName, []);
      }
      this.references.get(newName)?.push(updatedReference);
    });

    return result;
  }

  /**
   * Get the updated formula string for a formula ID
   * 
   * @param formulaId - The formula ID
   * @returns The updated formula string, or null if not found
   */
  getUpdatedFormula(formulaId: string): string | null {
    return this.currentFormulas.get(formulaId) || null;
  }

  /**
   * Remove a formula from tracking
   * 
   * @param formulaId - The formula ID to remove
   */
  removeFormula(formulaId: string): void {
    // Remove from formulas maps
    this.formulas.delete(formulaId);
    this.currentFormulas.delete(formulaId);

    // Remove all references to this formula
    this.references.forEach((references, variableName) => {
      const updatedReferences = references.filter(ref => ref.formulaId !== formulaId);
      
      if (updatedReferences.length === 0) {
        this.references.delete(variableName);
      } else {
        this.references.set(variableName, updatedReferences);
      }
    });
  }

  /**
   * Get all formula IDs that reference a variable
   * 
   * @param variableName - The variable name
   * @returns Array of formula IDs
   */
  getFormulasReferencingVariable(variableName: string): string[] {
    const references = this.references.get(variableName) || [];
    return references.map(ref => ref.formulaId);
  }

  /**
   * Get the current references map (for testing)
   * 
   * @returns The references map
   */
  getReferences(): Map<string, FormulaReference[]> {
    return this.references;
  }

  /**
   * Remove a specific variable reference from a formula
   * 
   * @param variableName - The variable name
   * @param formulaId - The formula ID
   */
  private removeVariableReference(variableName: string, formulaId: string): void {
    const references = this.references.get(variableName) || [];
    const updatedReferences = references.filter(ref => ref.formulaId !== formulaId);
    
    if (updatedReferences.length === 0) {
      this.references.delete(variableName);
    } else {
      this.references.set(variableName, updatedReferences);
    }
  }
} 