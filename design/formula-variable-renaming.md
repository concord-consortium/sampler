# Formula Variable Renaming

## Overview

The Formula Variable Renaming feature enhances the user experience by automatically updating formulas when variable names change. This ensures that formulas remain valid and functional even after variables are renamed, preventing broken references and reducing manual maintenance.

## Problem Statement

Currently, when users rename variables in the Sampler tool, formulas that reference those variables do not automatically update to reflect the new names. This leads to broken formulas, unexpected behavior, and requires manual updates by users, which is error-prone and time-consuming.

## Requirements

1. **Reference Tracking**
   - Track which formulas reference which variables
   - Maintain a dependency graph between variables and formulas

2. **Name Propagation**
   - Automatically update formulas when variable names change
   - Preserve formula structure and functionality

3. **Formula Parsing**
   - Parse formulas to identify variable references
   - Handle complex formulas with multiple variable references

4. **Error Handling**
   - Provide clear feedback when variable renaming affects formulas
   - Handle edge cases such as name conflicts or invalid references

## Design

### 1. Formula Reference Tracker

We will implement a `FormulaReferenceTracker` utility that:
- Scans formulas to identify variable references
- Maintains a mapping of variables to the formulas that reference them
- Provides methods to update formulas when variables are renamed

```typescript
interface FormulaReference {
  formulaId: string;
  variableName: string;
  newName?: string;
}

class FormulaReferenceTracker {
  private references: Map<string, FormulaReference[]>;
  
  constructor() {
    this.references = new Map();
  }
  
  trackFormula(formulaId: string, formula: string): void {
    // Parse formula and extract variable references
    // Add to references map
  }
  
  updateVariableName(oldName: string, newName: string): FormulaReference[] {
    // Find all formulas referencing the old name
    // Return list of affected formulas
  }
  
  getUpdatedFormula(formulaId: string): string {
    // Generate updated formula with new variable names
  }
}
```

### 2. Formula Parser

We will implement a `FormulaParser` utility that:
- Parses formula strings to identify variable references
- Handles different formula patterns and syntax
- Supports complex expressions with multiple variables

```typescript
class FormulaParser {
  static parseVariableReferences(formula: string): string[] {
    // Use regex or parsing logic to extract variable references
    // Return array of variable names found in the formula
  }
  
  static replaceVariableReferences(formula: string, oldName: string, newName: string): string {
    // Replace all occurrences of oldName with newName
    // Ensure only valid variable references are replaced
  }
}
```

### 3. Integration with Global State

We will extend the global state to:
- Store formula references
- Trigger formula updates when variables are renamed
- Maintain consistency between variable names and formula references

```typescript
// In global state update logic
const handleVariableRename = (deviceId: string, oldName: string, newName: string) => {
  // Update the variable name in the device
  setGlobalState(draft => {
    // Find and update the variable name
    
    // Get affected formulas
    const affectedFormulas = formulaReferenceTracker.updateVariableName(oldName, newName);
    
    // Update each affected formula
    affectedFormulas.forEach(ref => {
      // Find and update the formula in the state
    });
  });
};
```

### 4. User Interface Updates

We will enhance the UI to:
- Provide feedback when variable renaming affects formulas
- Show which formulas will be updated
- Allow users to review changes before applying them

## Implementation Plan

1. **Phase 1: Core Utilities**
   - Implement FormulaParser
   - Implement FormulaReferenceTracker
   - Write comprehensive tests for both utilities

2. **Phase 2: State Integration**
   - Extend global state to track formula references
   - Implement variable rename handler
   - Update state management to propagate name changes

3. **Phase 3: UI Enhancements**
   - Add feedback mechanism for formula updates
   - Implement review UI for formula changes
   - Enhance error handling and user guidance

## Testing Strategy

1. **Unit Tests**
   - Test FormulaParser with various formula patterns
   - Test FormulaReferenceTracker for tracking and updating
   - Test state management for proper propagation

2. **Integration Tests**
   - Test end-to-end variable renaming flow
   - Verify formula updates across different components
   - Test with complex formulas and multiple variables

3. **Edge Cases**
   - Test name conflicts and resolution
   - Test invalid formulas and error handling
   - Test performance with large numbers of formulas

## Considerations and Limitations

1. **Performance**
   - Formula parsing and updating should be efficient
   - Consider caching parsed formulas to improve performance

2. **Backward Compatibility**
   - Ensure compatibility with existing documents
   - Provide fallback for older document versions

3. **Error Handling**
   - Gracefully handle parsing errors
   - Provide clear feedback for invalid formulas

## Conclusion

The Formula Variable Renaming feature will significantly improve the user experience by maintaining formula integrity when variables are renamed. By automatically updating formula references, we reduce manual maintenance and prevent errors, making the Sampler tool more robust and user-friendly. 