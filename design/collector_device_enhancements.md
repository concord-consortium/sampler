# Collector Device Enhancements

## Problem Statement

The current Collector device has limitations in how it connects to datasets, handles attributes, and processes different data types. This can lead to inefficient sampling, limited data representation, and potential errors when working with complex datasets. Users need a more robust Collector device that can seamlessly integrate with CODAP datasets, handle various attribute types, and optimize the sampling process.

## Requirements

1. Improve dataset connection to make it more reliable and user-friendly
2. Enhance attribute handling to support a wider range of attribute types and formats
3. Add proper data type conversion to ensure consistency between the Sampler and CODAP
4. Optimize the sampling process for better performance with large datasets
5. Maintain backward compatibility with existing documents
6. Provide clear feedback to users about the connection status and available attributes
7. Support sampling from existing CODAP datasets with proper visualization
8. Handle large datasets efficiently, including those with hierarchical structures

## User Story and Specific Behaviors

As defined in the feature history (ID: 188848421), the Collector device should:

* Be available as a device type when there is only one device in the model
* Automatically select the available dataset if there is only one (different from the current sampler dataset)
* Display the dataset name in a popup menu below the device
* Show a message when no datasets are available
* Populate the device with a ball for each case in the dataset, labeled with values from the first attribute column
* Remove any device-derived attributes (like "output") from the Sampler Data dataset if there are no cases with those values
* Replace the "output" label above the mixer box with the name of the chosen dataset (making it non-editable)
* Revert to default state with editable "output" label if the user switches from Collector to Spinner or Mixer
* Create samples of cases from the dataset when the Start button is pressed, treating the device as a mixer

## Technical Design

### Dataset Connection Enhancements

1. **Improved Connection UI**
   - Add a more intuitive interface for connecting to CODAP datasets
   - Provide visual feedback about connection status
   - Allow users to easily switch between connected datasets
   - Automatically detect and select available datasets
   - Display clear messages when no datasets are available

2. **Reliable Connection Management**
   - Implement robust error handling for dataset connections
   - Add automatic reconnection capabilities when datasets change
   - Provide clear error messages when connection issues occur
   - Handle dataset name changes and updates

### Attribute Handling Improvements

1. **Attribute Type Support**
   - Enhance support for various attribute types (numeric, text, boolean, date)
   - Add proper validation for each attribute type
   - Implement appropriate display formats for different types
   - Use the first attribute column for ball labels by default

2. **Attribute Selection**
   - Improve the attribute selection interface
   - Add filtering and sorting options for attributes
   - Provide attribute metadata and preview
   - Handle attribute name changes properly

### Data Type Conversion

1. **Type Detection and Conversion**
   - Implement automatic type detection for dataset attributes
   - Add conversion utilities for different data types
   - Ensure consistent data representation between Sampler and CODAP
   - Handle hierarchical data structures appropriately

2. **Type-Specific Sampling**
   - Customize sampling behavior based on attribute types
   - Add special handling for categorical vs. continuous data
   - Implement appropriate visualization for different data types
   - Support sampling from hierarchical datasets

### Sampling Optimization

1. **Performance Improvements**
   - Optimize data retrieval from CODAP
   - Implement batching for large datasets
   - Add caching mechanisms for frequently accessed data
   - Ensure efficient handling of large datasets (as verified in QA testing)

2. **Sampling Algorithms**
   - Improve sampling algorithms for better performance
   - Add stratified sampling options
   - Implement weighted sampling capabilities
   - Treat the Collector device as a mixer when sampling

### UI Enhancements

1. **Device Visualization**
   - Populate the device with a ball for each case in the dataset
   - Label balls with values from the first attribute column
   - Update the device visualization when the dataset changes
   - Provide visual feedback about the connection status

2. **Label Management**
   - Replace "output" label with the dataset name
   - Make the dataset name non-editable when in Collector mode
   - Revert to default state when switching to other device types
   - Handle attribute name changes properly

## Implementation Plan

1. **Phase 1: Connection Enhancements**
   - Improve the dataset connection UI
   - Implement robust connection management
   - Add connection status indicators
   - Implement automatic dataset detection and selection

2. **Phase 2: Attribute Handling**
   - Enhance attribute type support
   - Improve attribute selection interface
   - Add attribute metadata display
   - Implement proper ball labeling

3. **Phase 3: Type Conversion**
   - Implement type detection and conversion
   - Add type-specific sampling behavior
   - Ensure consistent data representation
   - Support hierarchical data structures

4. **Phase 4: Optimization**
   - Optimize data retrieval and processing
   - Implement caching mechanisms
   - Improve sampling algorithms
   - Ensure efficient handling of large datasets

## Testing Strategy

1. **Unit Tests**
   - Test dataset connection functions
   - Test attribute handling utilities
   - Test type conversion functions
   - Test sampling optimization

2. **Integration Tests**
   - Test interaction with CODAP API
   - Test end-to-end sampling process
   - Test with various dataset types and sizes
   - Verify behavior when switching between device types

3. **Performance Tests**
   - Measure sampling performance with large datasets
   - Compare optimized vs. non-optimized implementations
   - Test with various attribute types and configurations
   - Stress test with large hierarchical datasets (like Mammals and Four Seals)

## Acceptance Criteria

1. Dataset connections are reliable and provide clear feedback
2. All attribute types are properly supported and displayed
3. Data type conversion is accurate and consistent
4. Sampling performance is improved for large datasets
5. Backward compatibility is maintained
6. All tests pass
7. The Collector device correctly populates with balls for each case in the dataset
8. The device properly handles large and hierarchical datasets
9. The UI correctly updates when switching between device types
10. The Measures tab provides appropriate guidance for Collector mode

## Potential Risks and Mitigations

1. **Risk**: Changes might break existing functionality
   **Mitigation**: Implement comprehensive tests and ensure backward compatibility

2. **Risk**: Performance issues with very large datasets
   **Mitigation**: Implement progressive loading and optimize critical code paths

3. **Risk**: CODAP API limitations
   **Mitigation**: Design fallback mechanisms and clear error handling

4. **Risk**: Measures tab functionality limitations
   **Mitigation**: Provide clear guidance to users about alternative approaches for computing measures

## Notes on Measures Tab

As noted by Hollylynne Lee in the feature history, the Measures tab functionality is limited when in Collector mode. Consider adding a message to the Measures tab when in Collector mode:

"We are sorry, but at this time you cannot use this feature to add common measures for each sample. You can however, create a new attribute in the Sampler Data Table at the Sample level to compute a measure for a sample. For help see:
- Add a New Attribute to a Table (link to https://codap.concord.org/how-to/add-a-new-attribute-to-a-table/)
- Enter a Formula for an Attribute (link to https://codap.concord.org/how-to/enter-a-formula-for-an-attribute/)"

## Completed Work

As of March 8, 2025, we have successfully implemented the following enhancements to the Collector device:

1. **Dataset Connection**
   - Improved the dataset connection UI to display available datasets
   - Added clear messaging when no datasets are available
   - Implemented automatic dataset selection when only one dataset is available

2. **Attribute Handling**
   - Enhanced support for dataset attributes
   - Implemented proper display of dataset items in the collector device
   - Added support for displaying dataset items in the output table

3. **Sampling Process**
   - Fixed the sampling process to correctly handle collector device data
   - Ensured proper display of sampled items in the output table
   - Added logging for better debugging and monitoring

4. **Bug Fixes**
   - Fixed issue where collector component displayed "No datasets available" despite successful data fetching
   - Fixed issue where collector output showed mixer data instead of dataset items
   - Fixed issue where the output column in the sample table remained empty

### Implementation Details

1. **Collector Component Enhancements**
   - Added proper state management for dataset contexts
   - Implemented UI for dataset selection
   - Added visual feedback for dataset loading and selection

2. **Animation System Updates**
   - Modified `getExperimentSample` function to properly handle collector devices
   - Updated `getAllExperimentSamples` function to use appropriate arrays for collector devices
   - Added proper column name handling for collector output

3. **Data Integration**
   - Improved integration with CODAP datasets
   - Enhanced data type handling for dataset attributes
   - Ensured consistent data representation between Sampler and CODAP

All changes have been committed to the `feature/collector-device-enhancements` branch with the message "Fix collector component to properly display dataset items in output table". 