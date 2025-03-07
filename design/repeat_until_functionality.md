# "Repeat Until" Condition Feature Design Document

## 1. Introduction

### 1.1 Purpose
This document outlines the design and implementation plan for the "Repeat Until" condition feature in the Sampler tool. This feature enhances the simulation capabilities by allowing users to define conditions that will cause the experiment to stop running when met, rather than running a fixed number of iterations.

### 1.2 Scope
The feature will implement a condition parser, evaluation logic, and UI components to enable users to specify and use "Repeat Until" conditions in their simulations. This includes support for both formula-based conditions and pattern-matching conditions, with formula evaluation leveraging the CODAP plugin API.

### 1.3 References
- Main design document (`design/design_doc.md`)
- Feature summary document (`design/feature-summary.md`)
- Project plan (`design/project-plan.md`)
- Test plan (`design/test-plan.md`)
- CODAP Plugin API documentation

## 2. Feature Overview

### 2.1 Problem Statement
Currently, the Sampler tool allows users to run a fixed number of samples in an experiment. However, in many statistical simulations, it's more useful to continue sampling until a specific condition is met (e.g., until a certain pattern appears or a statistical threshold is reached). This feature addresses this limitation by allowing users to define conditions that will cause the experiment to stop when met.

### 2.2 User Stories
1. As a user, I want to specify a condition that will cause the experiment to stop when met, so that I can model real-world scenarios more accurately.
2. As a user, I want to use pattern matching to stop the experiment when a specific sequence of outcomes occurs, so that I can simulate events like "run until we get three heads in a row."
3. As a user, I want to use formulas to stop the experiment when a statistical threshold is reached, so that I can simulate events like "run until the average is greater than 10."
4. As a user, I want to leverage the full power of CODAP's formula syntax, so I can create complex conditions using the same syntax I'm familiar with from other parts of CODAP.

### 2.3 Key Requirements
1. Add a "Repeat Until" condition input to the UI when the "Repeat" option is selected
2. Support two types of conditions:
   - Pattern matching: Simple text patterns to match against sample results
   - Formula-based: Mathematical expressions that evaluate to true/false using CODAP's formula syntax
3. Integrate with the CODAP plugin API to evaluate formula conditions
4. Integrate with the animation system to check conditions during simulation runs
5. Provide clear feedback when a condition is met and when formula errors occur
6. Ensure backward compatibility with existing documents

## 3. Technical Design

### 3.1 Data Model Changes

#### 3.1.1 Global State
Add a new property to the global state:
```typescript
repeatUntilCondition: string
```

This property will store the user-defined condition as a string. The condition will be parsed and evaluated during the simulation run.

#### 3.1.2 Condition Parser
Create a new utility module for parsing and evaluating conditions:

```typescript
// Condition types
enum ConditionType {
  FORMULA = 'formula',
  PATTERN = 'pattern',
  NONE = 'none'
}

// Parsed condition interface
interface IParsedCondition {
  type: ConditionType;
  value: string;
}

// Parse a condition string
function parseCondition(condition: string): IParsedCondition {
  // Implementation details
}

// Evaluate a condition against sample data
async function evaluateCondition(condition: IParsedCondition, sampleData: any[]): Promise<boolean> {
  // Implementation details - uses CODAP API for formula evaluation
}
```

### 3.2 UI Components

#### 3.2.1 RepeatUntil Component
Create a dedicated RepeatUntil component to handle the condition input:

```tsx
export const RepeatUntil: React.FC = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { repeat, repeatUntilCondition, modelLocked } = globalState;
  
  // If repeat is not enabled, don't render the component
  if (!repeat) {
    return null;
  }
  
  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value;
    setGlobalState(draft => {
      draft.repeatUntilCondition = newCondition;
    });
  };
  
  return (
    <div className="repeat-until-container">
      <label htmlFor="repeat-until-condition">Repeat Until:</label>
      <input
        id="repeat-until-condition"
        type="text"
        value={repeatUntilCondition}
        onChange={handleConditionChange}
        placeholder="Enter condition (e.g. =x > 5 or heads,tails,heads)"
        disabled={modelLocked}
      />
      <button 
        className="help-button" 
        title="Help with conditions"
        onClick={showHelpModal}
      >
        ?
      </button>
    </div>
  );
};
```

#### 3.2.2 Help Modal
Add a help modal to provide guidance on formula syntax:

```tsx
export const ConditionHelpModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Condition Syntax Help</h2>
        
        <h3>Formula Conditions</h3>
        <p>Start with an equals sign (=) followed by a CODAP formula that evaluates to true/false:</p>
        <ul>
          <li><code>=count(output="a") > 3</code> - Stop when more than 3 "a" values are selected</li>
          <li><code>=mean(Age) > 30</code> - Stop when the mean age exceeds 30</li>
          <li><code>=sum(Score) >= 100</code> - Stop when the sum of scores reaches 100</li>
        </ul>
        
        <h3>Pattern Matching</h3>
        <p>Enter a comma-separated list of values to match in sequence:</p>
        <ul>
          <li><code>heads,heads,heads</code> - Stop when three heads occur in sequence</li>
          <li><code>a,b,a</code> - Stop when the pattern a,b,a occurs</li>
        </ul>
        
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

### 3.3 CODAP API Integration

#### 3.3.1 Formula Evaluation
Use the CODAP plugin API to evaluate formula conditions:

```typescript
async function evaluateFormulaCondition(formula: string, sampleData: any[]): Promise<boolean> {
  try {
    // Use the CODAP API to evaluate the formula
    const result = await codapInterface.sendRequest({
      action: 'get',
      resource: 'formulaEngine/evalExpression',
      values: {
        expression: formula,
        context: { sampleData }
      }
    });
    
    // Check if the result is a boolean or can be coerced to a boolean
    return Boolean(result.success && result.values);
  } catch (error) {
    console.error('Error evaluating formula condition:', error);
    return false;
  }
}
```

### 3.4 Animation System Integration

#### 3.4.1 Animation Hook
Update the animation hook to check the condition after each sample:

```typescript
// In the useAnimation hook
const checkRepeatUntilCondition = async (sampleData: any[]): Promise<boolean> => {
  if (!globalState.repeat || !globalState.repeatUntilCondition) {
    return false;
  }
  
  const parsedCondition = parseCondition(globalState.repeatUntilCondition);
  return await evaluateCondition(parsedCondition, sampleData);
};

// After each sample is collected
useEffect(() => {
  const checkConditionAndContinue = async () => {
    if (await checkRepeatUntilCondition(currentSampleData)) {
      // Stop the current experiment
      handleStopExperiment();
    } else if (currentSampleIndex < totalSamples - 1) {
      // Continue to the next sample
      setCurrentSampleIndex(prev => prev + 1);
    } else {
      // All samples completed
      handleExperimentComplete();
    }
  };
  
  checkConditionAndContinue();
}, [currentSampleData]);
```

### 3.5 Condition Evaluation Logic

#### 3.5.1 Pattern Matching
For pattern matching conditions, the system will check if the pattern exists in the sample data:

```typescript
function evaluatePatternCondition(pattern: string, sampleData: any[]): boolean {
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
}
```

#### 3.5.2 Formula Evaluation
For formula-based conditions, the system will use the CODAP plugin API to evaluate the formula:

```typescript
async function evaluateFormulaCondition(formula: string, sampleData: any[]): Promise<boolean> {
  // Implementation using CODAP API as described in section 3.3.1
}
```

## 4. Implementation Plan

### 4.1 Phase 1: Core Functionality
1. Add `repeatUntilCondition` property to the global state
2. Create the RepeatUntil component with UI for condition input
3. Create condition parser utility
4. Write tests for condition parsing and UI components

### 4.2 Phase 2: CODAP API Integration
1. Implement CODAP API integration for formula evaluation
2. Implement pattern matching evaluation
3. Add error handling for API responses
4. Write tests for API integration

### 4.3 Phase 3: Animation Integration
1. Update animation hook to check conditions
2. Implement stopping behavior when conditions are met
3. Add feedback for condition status
4. Write tests for animation integration

### 4.4 Phase 4: Testing and Refinement
1. Test with various condition types
2. Fix any issues with condition evaluation
3. Optimize performance for complex conditions
4. Ensure backward compatibility

## 5. Testing Strategy

### 5.1 Unit Testing
1. Test condition parser functionality
   - Test parsing different condition types
   - Test handling of edge cases (empty conditions, invalid syntax)
2. Test condition evaluation logic
   - Test pattern matching with various patterns
   - Test formula evaluation with different formulas
   - Test CODAP API integration
3. Test UI components
   - Test rendering of condition input
   - Test handling of user input
   - Test help modal functionality

### 5.2 Integration Testing
1. Test integration with animation system
   - Test condition checking during simulation runs
   - Test stopping behavior when conditions are met
2. Test with different device types
   - Test with Mixer device
   - Test with Spinner device
   - Test with Collector device
3. Test CODAP API error handling
   - Test behavior when API returns errors
   - Test behavior when network issues occur

### 5.3 End-to-End Testing
1. Test complete workflows
   - Test creating and running experiments with conditions
   - Test saving and loading documents with conditions
2. Test edge cases
   - Test with very complex conditions
   - Test with very large sample sizes
   - Test with invalid formulas

## 6. Risks and Mitigations

### 6.1 Performance Risks
- **Risk**: Complex conditions could slow down the simulation
- **Mitigation**: Optimize condition evaluation, cache results when possible, implement debouncing for API calls

### 6.2 Compatibility Risks
- **Risk**: Changes could affect backward compatibility
- **Mitigation**: Ensure proper state migration, thorough testing with saved documents

### 6.3 Technical Complexity Risks
- **Risk**: CODAP API integration could be complex
- **Mitigation**: Implement robust error handling, fallback to simpler evaluation when needed

### 6.4 API Availability Risks
- **Risk**: The required CODAP API endpoints might not be available in all versions
- **Mitigation**: Implement feature detection, graceful degradation when API is unavailable

## 7. Conclusion

The "Repeat Until" condition feature will significantly enhance the Sampler tool's capabilities by allowing users to define conditions that will cause the experiment to stop when met. By leveraging the CODAP plugin API for formula evaluation, we can provide users with the full power of CODAP's formula syntax, making the tool more flexible and powerful for educational purposes.

This implementation approach ensures that users have a consistent experience across CODAP, using the same formula syntax they're familiar with from other parts of the application. The integration with the CODAP API also allows for more complex and powerful conditions than would be possible with a custom formula evaluator.

By following this design document, we will implement the feature in a structured and testable way, ensuring high quality and performance while maintaining backward compatibility with existing documents. 