# Sampler Tool Design Document

## 1. Introduction

### 1.1 Purpose
This document outlines the design and implementation plan for replicating and extending the Sampler tool, an educational application for probability and statistics education. The goal is to create a codebase that allows for easy forking and improvements while maintaining compatibility with the original tool's functionality.

### 1.2 Scope
The project will implement all core features of the Sampler tool as identified in our analysis, with a focus on maintainability, extensibility, and educational value. This includes the three device types (Mixer, Spinner, Collector), simulation capabilities, data collection, and integration with CODAP.

### 1.3 References
- Original Sampler tool codebase
- Feature summary document (`design/feature-summary.md`)
- Sampler understanding document (`design/sampler-understanding.md`)
- User stories from Orange Team (`design/__orange_team_20250304_201207.csv`)
- Commit history (`design/commit-history.txt`)
- Project plan (`design/project-plan.md`)
- Test plan (`design/test-plan.md`)

## 2. System Architecture

### 2.1 High-Level Architecture
The Sampler tool will be implemented as a React application with TypeScript, following a component-based architecture. The system will consist of:

1. **Core Components**: UI elements and device implementations
2. **State Management**: Global context for application state
3. **Animation System**: For visualizing sampling processes
4. **Data Management**: For collecting and organizing simulation results
5. **CODAP Integration**: For data analysis and visualization

### 2.2 Technology Stack
- **Frontend Framework**: React 18.2.0 with TypeScript 5.0.4
- **State Management**: React Context API with use-immer 0.9.0
- **Styling**: SCSS modules
- **Visualization**: SVG for interactive elements
- **Testing**: Jest 29.5.0 and React Testing Library 14.0.0
- **End-to-End Testing**: Cypress 12.13.0
- **Build System**: Webpack 5.84.1
- **Package Management**: npm
- **CODAP Integration**: @concord-consortium/codap-plugin-api 0.1.5

### 2.3 System Dependencies
- React 18+
- TypeScript 4.9+
- CODAP API integration
- SVG rendering capabilities
- Modern browser support (Chrome, Firefox, Safari, Edge)

## 3. Component Design

### 3.1 Core Components

#### 3.1.1 App Component
- Entry point for the application
- Manages navigation between tabs
- Initializes global state
- Handles CODAP plugin initialization

#### 3.1.2 Model Tab
- Container for device management
- Handles device connections and simulation controls
- Manages model visibility and locking
- Implements scrolling functionality for overflow content

#### 3.1.3 Measures Tab
- Interface for defining statistical measures
- Manages formula creation and editing
- Connects to simulation results
- Supports different measure types (mean, median, sum, etc.)

#### 3.1.4 About Tab
- Provides information about the tool
- Includes documentation and help resources
- Displays version information

### 3.2 Device Components

#### 3.2.1 Device Base
- Abstract base for all device types
- Manages common device properties and behaviors
- Handles device connections
- Implements enhanced device name input

#### 3.2.2 Mixer Device
- Implements ball-based sampling
- Manages variable definitions and percentages
- Visualizes selection process
- Supports variable editing and color customization

#### 3.2.3 Spinner Device
- Implements wheel-based sampling
- Manages wedges and needle animation
- Visualizes spinning and selection
- Supports variable editing and wedge customization

#### 3.2.4 Collector Device
- Implements dataset-based sampling
- Connects to CODAP data contexts
- Manages attribute selection and sampling
- Handles different data types from CODAP datasets

### 3.3 Animation System

#### 3.3.1 Animation Controller
- Manages animation steps and timing
- Implements different speed settings
- Handles animation skipping for "Fastest" mode
- Controls start, pause, and resume functionality

#### 3.3.2 Animation Steps
- Defines different types of animation steps
- Implements transitions between states
- Manages visual feedback during simulation
- Supports step-by-step execution

### 3.4 Data Management

#### 3.4.1 Data Structure
- Defines hierarchical data organization
- Manages experiment, sample, and item levels
- Implements data export to CODAP
- Handles attribute mapping between Sampler and CODAP

#### 3.4.2 Formula Engine
- Parses and evaluates statistical formulas
- Supports "Repeat Until" conditions
- Handles variable references in formulas
- Manages variable renaming propagation

## 4. State Management

### 4.1 Global State
- Application-wide state using React Context with use-immer
- Manages devices, simulation state, and settings
- Handles undo/redo functionality
- Implements state migration for backward compatibility

### 4.2 Device State
- Per-device state management
- Tracks variables, selections, and connections
- Manages device-specific settings
- Handles device ID generation and uniqueness

### 4.3 Simulation State
- Tracks current simulation progress
- Manages animation state
- Records simulation results
- Controls speed and timing of animations

### 4.4 Security State
- Manages model visibility settings
- Handles password protection
- Implements secure storage mechanisms
- Controls access to protected features

## 5. User Interface Design

### 5.1 Layout
- Responsive design with scrolling capability
- Tab-based navigation
- Device connection visualization
- Support for different screen sizes

### 5.2 Interactive Elements
- Drag-and-drop for device management
- Interactive controls for simulation parameters
- Editable fields for variable properties
- Enhanced speed slider with improved usability

### 5.3 Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- WCAG 2.1 AA standards compliance

## 6. Implementation Plan

### 6.1 Phase 1: Core Infrastructure
1. Set up project structure and build system
2. Implement basic state management
3. Create navigation and tab structure
4. Establish CODAP integration foundation

### 6.2 Phase 2: Device Implementation
1. Implement Device base component
2. Develop Mixer device with basic functionality
3. Implement Spinner device with animation
4. Create Collector device with dataset connection

### 6.3 Phase 3: Simulation and Data Collection
1. Implement animation system
2. Develop data collection and organization
3. Create simulation controls
4. Implement "Repeat Until" functionality

### 6.4 Phase 4: UI Enhancements and Advanced Features
1. Add model hiding and locking
2. Implement scrolling functionality
3. Enhance speed slider behavior
4. Add support for multiple samplers

### 6.5 Phase 5: Testing and Refinement
1. Implement comprehensive test suite
2. Optimize performance for large samples
3. Ensure backward compatibility
4. Polish UI and fix edge cases

## 7. Testing Strategy

### 7.1 Unit Testing
- Component-level tests for all major components
- State management tests
- Formula engine tests
- Coverage target of 80% for critical areas

### 7.2 Integration Testing
- Device interaction tests
- Animation system tests
- CODAP integration tests
- Focus on key workflows and interactions

### 7.3 End-to-End Testing
- Complete simulation workflow tests
- Data collection and export tests
- Multiple device interaction tests
- Cross-browser compatibility tests

### 7.4 Performance Testing
- Large sample performance
- Animation optimization
- Memory usage
- Rendering efficiency
- State update performance

## 8. Feature Implementation Details

### 8.1 UI/UX Enhancements

#### 8.1.1 Scrolling Functionality
- Implement scrollable containers in the main application component
- Add event listeners for mouse wheel, keyboard, and trackpad
- Ensure proper overflow handling in CSS
- Maintain scroll position during state updates

#### 8.1.2 Device Name Input Enhancement
- Modify the device component to use a resizable input field
- Implement auto-sizing based on content length
- Ensure proper styling for focus and hover states
- Add validation for device name uniqueness

#### 8.1.3 Speed Slider Improvements
- Enhance the slider component to respond to clicks
- Implement snap-to-nearest functionality
- Increase the clickable area for better usability
- Add keyboard accessibility for slider control

### 8.2 Model Visibility and Security

#### 8.2.1 Hide and Lock Model
- Add toggle controls for model visibility
- Implement password protection system
- Create UI indicators for locked/hidden state
- Store password securely in application state
- Implement password strength validation

### 8.3 Simulation and Sampling Enhancements

#### 8.3.1 "Repeat Until" Condition
- Extend the simulation controller to support conditional sampling
- Implement formula evaluation for conditions
- Create UI for defining and editing conditions
- Add support for pattern matching in conditions
- Handle edge cases and error conditions

#### 8.3.2 Skip Animation in "Fastest" Speed
- Modify animation controller to bypass animation steps in fastest mode
- Implement direct state transitions for immediate results
- Optimize performance for large sample sizes
- Maintain result accuracy in skipped mode

### 8.4 Data Collection and Analysis

#### 8.4.1 Collector Device
- Implement CODAP dataset connection
- Create UI for selecting attributes to sample
- Develop visualization for sampled items
- Handle attribute type conversion
- Support different data types from CODAP

#### 8.4.2 Measures Tab Improvements
- Update measure creation to use device variables
- Fix attribute type handling
- Implement formula variable renaming propagation
- Support complex statistical measures

### 8.5 Multi-Device and Formula Handling

#### 8.5.1 Multiple Samplers Support
- Implement unique identifiers for each sampler instance
- Isolate data contexts to prevent interference
- Handle state management for multiple instances
- Ensure resource sharing efficiency

#### 8.5.2 Formula Variable Renaming
- Create a reference tracking system for variables in formulas
- Implement propagation of name changes to all references
- Update formula parsing to handle renamed variables
- Provide clear error messages for invalid formulas

## 9. CODAP Integration

### 9.1 Data Context Management
- Create and manage data contexts in CODAP
- Handle attribute mapping between Sampler and CODAP
- Support data export to CODAP
- Implement data context naming conventions

### 9.2 Formula Evaluation
- Utilize CODAP's formula engine for evaluation
- Handle formula parsing and validation
- Support complex statistical formulas
- Manage formula variable references

### 9.3 Plugin Communication
- Implement communication with CODAP through plugin API
- Handle plugin initialization and configuration
- Support plugin state persistence
- Manage plugin lifecycle events

## 10. Backward Compatibility

### 10.1 State Migration
- Implement state migration strategies for older document versions
- Handle missing or changed properties
- Provide fallbacks for deprecated features
- Ensure data preservation during migration

### 10.2 Feature Degradation
- Design features to degrade gracefully in older versions
- Implement feature detection and adaptation
- Provide clear user feedback for unsupported features
- Maintain core functionality across versions

## 11. Risks and Mitigations

### 11.1 Performance Risks
- **Risk**: Large sample sizes causing performance issues
- **Mitigation**: Optimize animation system, implement batching for large operations, skip animation in "Fastest" mode

### 11.2 Compatibility Risks
- **Risk**: Breaking changes affecting backward compatibility
- **Mitigation**: Implement state translation layer, thorough testing with saved documents, feature detection

### 11.3 Technical Complexity Risks
- **Risk**: Complex formula evaluation system
- **Mitigation**: Modular design, comprehensive testing, clear documentation, error handling

### 11.4 Integration Risks
- **Risk**: Changes in CODAP API affecting integration
- **Mitigation**: Abstraction layer for CODAP integration, version checking, fallback mechanisms

## 12. Conclusion

This design document outlines a comprehensive plan for implementing the Sampler tool with all its core features and enhancements. By following this structured approach, we aim to create a maintainable, extensible, and educational tool that builds upon the strengths of the original while addressing its limitations.

The implementation will be carried out in phases, with regular testing and refinement to ensure quality and performance. The resulting codebase will be well-documented and structured to facilitate future extensions and improvements.

## 13. Appendix

### 13.1 Key Dependencies
- React 18.2.0
- TypeScript 5.0.4
- use-immer 0.9.0
- @concord-consortium/codap-plugin-api 0.1.5

### 13.2 Testing Framework
- Jest 29.5.0
- React Testing Library 14.0.0
- Cypress 12.13.0

### 13.3 Build Tools
- Webpack 5.84.1
- Sass 1.62.1
- ESLint 8.41.0 