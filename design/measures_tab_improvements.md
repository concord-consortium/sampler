# Measures Tab Improvements

## Problem Statement

The current Measures tab has limitations in how it handles device variables, attribute types, and formula variable renaming. These issues can lead to inconsistent behavior when creating and calculating measures, especially when working with complex data structures or when device variables are renamed. Users need a more robust Measures tab that can seamlessly integrate with device variables, handle various attribute types correctly, and maintain formula integrity when variables are renamed.

Additionally, the Measures tab currently makes incorrect assumptions about how users want to compare attribute values, and it has limitations when working with the Collector device.

## Requirements

1. Improve device variable usage in measure formulas
2. Enhance attribute type handling for consistent calculations
3. Implement proper variable renaming propagation to maintain formula integrity
4. Support complex measures with nested calculations
5. Maintain backward compatibility with existing documents
6. Provide clear feedback to users about formula validity and calculation status
7. Ensure consistent behavior across different device types
8. Implement device-specific behavior, especially for Collector mode
9. Support specific measure types (Sum, Mean, Median, Count, Percent) with appropriate UI

## User Stories

1. As a user, I want to use device variables in my measure formulas, so that I can create calculations based on device outputs.
2. As a user, I want attribute types to be handled correctly in calculations, so that numeric, categorical, and date values are processed appropriately.
3. As a user, I want my formulas to remain valid when I rename device variables, so that I don't have to recreate my measures after making changes to my model.
4. As a user, I want to create complex measures that reference other measures, so that I can build sophisticated analyses.
5. As a user, I want clear feedback when my formula has errors, so that I can correct them easily.
6. As a user, I want to select values directly from the model for measures like Count and Percent, so that I can easily create measures without typing complex formulas.
7. As a user, I want appropriate guidance when using the Collector device, so that I understand the limitations and alternatives.

## Specific Measure Types

The Measures tab should support the following measure types, which are added at the Sample level in the table:

1. **Sum**: `sum(Age)` - Sum of values for a numeric attribute
2. **Mean**: `mean(Age)` - Average of values for a numeric attribute
3. **Median**: `median(Age)` - Median of values for a numeric attribute
4. **Count**: `count(Sex = "male")` - Count of items matching a condition
   - Options should include value from model & attribute name
   - User should be able to select an attribute from a list (e.g., Sex)
   - User should be able to select a value from a list of possible values generated from the model
   - For example, the list might consist of ["male", "female"] as possible values
5. **Percent**: `100 * count(Sex = "male")/count()` - Percentage of items matching a condition
   - Options should include value from model & attribute name
   - Similar UI to Count, but with percentage calculation

## Technical Design

### Device Variable Usage Improvements

1. **Variable Reference System**
   - Implement a robust variable reference tracking system
   - Create a registry of device variables with their current names and IDs
   - Update formula parsing to use variable IDs internally for stability
   - Add validation to ensure referenced variables exist

2. **Device-Specific Variable Handling**
   - Add support for device-specific variable formats
   - Implement special handling for Collector device attributes
   - Create consistent variable access patterns across device types
   - Add context-aware variable suggestions

### Attribute Type Handling

1. **Type Detection and Conversion**
   - Enhance type detection for formula inputs
   - Implement automatic type conversion where appropriate
   - Add validation for type compatibility in operations
   - Create type-specific calculation functions

2. **Type-Specific UI**
   - Update UI to indicate attribute types
   - Add type-specific input controls
   - Provide guidance for type-compatible operations
   - Implement type-aware formula suggestions

### Formula Variable Renaming

1. **Reference Tracking**
   - Create a bidirectional mapping between variables and formulas
   - Implement an observer pattern for variable name changes
   - Add event listeners for rename operations
   - Create a formula update mechanism

2. **Formula Updating**
   - Implement formula parsing that preserves structure
   - Create a variable replacement algorithm
   - Add validation to ensure updated formulas remain valid
   - Implement transaction-based updates to prevent partial changes

### Complex Measure Support

1. **Nested Calculation Engine**
   - Enhance the calculation engine to support measure references
   - Implement dependency tracking for measures
   - Add cycle detection to prevent infinite recursion
   - Create a topological sort for calculation order

2. **UI Enhancements**
   - Add visual indicators for measure dependencies
   - Implement drag-and-drop for measure references
   - Create a measure browser for easy reference
   - Add validation for circular references

### Device-Specific Behavior

1. **Collector Mode Handling**
   - Detect when the Sampler is in Collector mode
   - Display appropriate guidance message in the Measures tab
   - Provide links to alternative approaches for computing measures
   - Example message:
     ```
     We are sorry, but at this time you cannot use this feature to add common measures for each sample. You can however, create a new attribute in the Sampler Data Table at the Sample level to compute a measure for a sample. For help see:
     - Add a New Attribute to a Table (link to https://codap.concord.org/how-to/add-a-new-attribute-to-a-table/)
     - Enter a Formula for an Attribute (link to https://codap.concord.org/how-to/enter-a-formula-for-an-attribute/)
     ```

2. **Mixer and Spinner Mode Enhancements**
   - Implement specialized UI for selecting model values
   - Generate lists of possible values from the model
   - Provide attribute selection dropdowns
   - Support comparison operators (=, >, <, etc.)

## Implementation Plan

### Phase 1: Device Variable Usage

1. Update the variable reference system
   - Create a variable registry component
   - Implement variable tracking
   - Update formula parsing to use variable IDs
   - Add validation for variable existence

2. Enhance device-specific variable handling
   - Add support for Collector device attributes
   - Implement consistent variable access patterns
   - Create context-aware variable suggestions
   - Add validation for device-specific constraints

### Phase 2: Attribute Type Handling

1. Improve type detection and conversion
   - Enhance type detection for formula inputs
   - Implement automatic type conversion
   - Add validation for type compatibility
   - Create type-specific calculation functions

2. Update UI for type awareness
   - Add type indicators to the UI
   - Implement type-specific input controls
   - Add guidance for type-compatible operations
   - Create type-aware formula suggestions

### Phase 3: Formula Variable Renaming

1. Implement reference tracking
   - Create bidirectional mapping
   - Implement observer pattern
   - Add event listeners for rename operations
   - Create formula update mechanism

2. Develop formula updating
   - Implement structure-preserving formula parsing
   - Create variable replacement algorithm
   - Add validation for updated formulas
   - Implement transaction-based updates

### Phase 4: Complex Measure Support

1. Enhance calculation engine
   - Implement measure references
   - Add dependency tracking
   - Implement cycle detection
   - Create topological sort for calculation order

2. Update UI for complex measures
   - Add dependency indicators
   - Implement drag-and-drop for measure references
   - Create measure browser
   - Add validation for circular references

### Phase 5: Device-Specific Behavior

1. Implement Collector mode handling
   - Add detection for Collector mode
   - Create guidance message component
   - Add links to help resources
   - Implement UI for alternative approaches

2. Enhance Mixer and Spinner mode
   - Create model value selection UI
   - Implement attribute selection dropdowns
   - Generate value lists from model data
   - Support comparison operators

## Testing Strategy

### Unit Testing

1. **Variable Reference System**
   - Test variable registry creation and updates
   - Test formula parsing with variable IDs
   - Test validation for variable existence
   - Test handling of edge cases (deleted variables, duplicates)

2. **Attribute Type Handling**
   - Test type detection for various inputs
   - Test automatic type conversion
   - Test validation for type compatibility
   - Test type-specific calculation functions

3. **Formula Variable Renaming**
   - Test bidirectional mapping
   - Test observer pattern implementation
   - Test formula updates after variable renaming
   - Test validation of updated formulas

4. **Complex Measure Support**
   - Test measure references in formulas
   - Test dependency tracking
   - Test cycle detection
   - Test calculation order determination

5. **Device-Specific Behavior**
   - Test Collector mode detection
   - Test guidance message display
   - Test Mixer and Spinner mode UI
   - Test model value selection

### Integration Testing

1. **Device Integration**
   - Test integration with different device types
   - Test handling of device-specific variables
   - Test behavior when devices are added/removed
   - Test interaction with the animation system

2. **UI Integration**
   - Test UI updates when variables change
   - Test formula editor integration
   - Test error display and handling
   - Test measure creation workflow

3. **CODAP Integration**
   - Test data export to CODAP
   - Test formula evaluation using CODAP API
   - Test attribute type consistency with CODAP
   - Test handling of CODAP-specific functions

### End-to-End Testing

1. **Complete Workflows**
   - Test creating and using measures in experiments
   - Test renaming variables and verifying formula updates
   - Test complex measure chains
   - Test error recovery scenarios

2. **Performance Testing**
   - Test with large numbers of measures
   - Test with complex formulas
   - Test with large datasets
   - Test calculation performance

## Acceptance Criteria

1. Device variables can be used reliably in measure formulas
2. Attribute types are handled correctly in calculations
3. Formulas remain valid when variables are renamed
4. Complex measures with nested calculations work correctly
5. Clear feedback is provided for formula errors
6. All tests pass
7. Backward compatibility is maintained
8. Performance is acceptable with large datasets and complex formulas
9. Functionality works in both CODAP V2 & V3
10. For measures like Count and Percent, users can select a value from the model and an attribute
11. Appropriate guidance is provided when using the Collector device

## Potential Risks and Mitigations

1. **Risk**: Complex formula parsing could introduce bugs
   **Mitigation**: Implement comprehensive tests and use established parsing libraries

2. **Risk**: Performance issues with complex measure dependencies
   **Mitigation**: Implement caching and optimize calculation order

3. **Risk**: Backward compatibility challenges
   **Mitigation**: Ensure robust state migration and fallback mechanisms

4. **Risk**: UI complexity for advanced features
   **Mitigation**: Conduct usability testing and implement progressive disclosure

5. **Risk**: Measures tab functionality limitations with Collector device
   **Mitigation**: Provide clear guidance and alternative approaches for users

## Implementation Notes

- Use a formal grammar for formula parsing to ensure robustness
- Consider using a directed acyclic graph (DAG) for dependency tracking
- Implement a transaction-based update system to prevent inconsistent states
- Use TypeScript interfaces and type guards to ensure type safety
- Add comprehensive logging for debugging complex scenarios
- Consider implementing an undo/redo system for formula changes
- Ensure proper handling of attribute types in CODAP API calls (use 'numeric' instead of 'numerical') 