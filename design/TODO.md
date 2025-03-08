# Sampler Tool Development TODO

This document provides a detailed, step-by-step checklist for implementing the Sampler tool using Test-Driven Development (TDD). Each feature is broken down into granular tasks following our TDD process: write tests, implement code, verify tests pass, and resolve errors.

## Phase 0: Development Environment Setup

- [ ] **Project Initialization**
  - [ ] Create React application with TypeScript
  - [ ] Set up ESLint and Prettier
  - [ ] Configure Jest and React Testing Library
  - [ ] Set up Cypress for end-to-end testing
  - [ ] Configure SCSS modules
  - [ ] Set up Webpack configuration
  - [ ] Create project structure

- [ ] **CODAP Integration Setup**
  - [ ] Install CODAP plugin API
  - [ ] Create plugin initialization module
  - [ ] Write tests for plugin initialization
  - [ ] Implement basic CODAP communication

- [ ] **State Management Setup**
  - [ ] Install use-immer
  - [ ] Create global state context
  - [ ] Write tests for state context
  - [ ] Implement basic state management

## Phase 1: Core Components

### 1.1 App Component

- [x] **Tests**
  - [x] Test app initialization
  - [x] Test tab navigation
  - [x] Test CODAP plugin initialization
  - [x] Test global state initialization

- [ ] **Implementation**
  - [ ] Create App component structure
  - [ ] Implement tab navigation
  - [ ] Connect to global state
  - [ ] Initialize CODAP plugin

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 1.2 Model Tab

- [x] **Tests**
  - [x] Test model tab rendering
  - [x] Test device management
  - [x] Test simulation controls
  - [x] Test scrolling functionality

- [ ] **Implementation**
  - [ ] Create ModelTab component
  - [ ] Implement device container
  - [ ] Add simulation controls
  - [ ] Implement scrolling container

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 1.3 Measures Tab

- [x] **Tests**
  - [x] Test measures tab rendering
  - [x] Test measure creation
  - [x] Test formula editing
  - [x] Test measure calculation

- [ ] **Implementation**
  - [ ] Create MeasuresTab component
  - [ ] Implement measure creation UI
  - [ ] Add formula editing
  - [ ] Connect to simulation results

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 1.4 About Tab

- [x] **Tests**
  - [x] Test about tab rendering
  - [x] Test version information display

- [ ] **Implementation**
  - [ ] Create AboutTab component
  - [ ] Add documentation content
  - [ ] Display version information

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

## Phase 2: Device Components

### 2.1 Device Base

- [x] **Tests**
  - [x] Test device base rendering
  - [x] Test device name editing
  - [x] Test device connection handling
  - [x] Test device deletion

- [ ] **Implementation**
  - [ ] Create Device base component
  - [ ] Implement device name input
  - [ ] Add connection handling
  - [ ] Implement device deletion

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 2.2 Mixer Device

- [x] **Tests**
  - [x] Test mixer rendering
  - [x] Test variable management
  - [x] Test ball visualization
  - [x] Test selection animation

- [ ] **Implementation**
  - [ ] Create Mixer component
  - [ ] Implement variable management
  - [ ] Add ball visualization
  - [ ] Implement selection animation

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 2.3 Spinner Device

- [ ] **Tests**
  - [ ] Test spinner rendering
  - [ ] Test wedge management
  - [ ] Test spinner animation
  - [ ] Test needle selection

- [ ] **Implementation**
  - [ ] Create Spinner component
  - [ ] Implement wedge management
  - [ ] Add spinner animation
  - [ ] Implement needle selection

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper component rendering

### 2.4 Collector Device

- [x] **Tests**
  - [x] Test collector rendering
  - [x] Test dataset connection
  - [x] Test attribute selection
  - [x] Test sampling visualization

- [x] **Implementation**
  - [x] Create Collector component
  - [x] Implement dataset connection
  - [x] Add attribute selection
  - [x] Implement sampling visualization

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure proper component rendering

## Phase 3: Animation System

### 3.1 Animation Controller

- [ ] **Tests**
  - [ ] Test animation step creation
  - [ ] Test animation timing
  - [ ] Test speed control
  - [ ] Test animation state management

- [ ] **Implementation**
  - [ ] Create animation controller
  - [ ] Implement step management
  - [ ] Add speed control
  - [ ] Implement state management

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper animation control

### 3.2 Animation Steps

- [ ] **Tests**
  - [ ] Test different step types
  - [ ] Test step execution
  - [ ] Test step transitions
  - [ ] Test step completion

- [ ] **Implementation**
  - [ ] Create step types
  - [ ] Implement step execution
  - [ ] Add transition handling
  - [ ] Implement completion callbacks

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper step execution

## Phase 4: UI/UX Enhancements

### 4.1 Scrolling Functionality

- [x] **Tests**
  - [x] Test vertical scrolling
  - [x] Test horizontal scrolling
  - [x] Test scroll position maintenance
  - [x] Test keyboard scrolling

- [x] **Implementation**
  - [x] Add scrollable containers
  - [x] Implement scroll event handling
  - [x] Add keyboard navigation
  - [x] Maintain scroll position during updates

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure smooth scrolling behavior

### 4.2 Device Name Input Enhancement

- [x] **Tests**
  - [x] Test input resizing
  - [x] Test name validation
  - [x] Test auto-focus
  - [x] Test name uniqueness

- [x] **Implementation**
  - [x] Enhance input field
  - [x] Add auto-sizing
  - [x] Implement validation
  - [x] Add auto-focus

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure proper input behavior

### 4.3 Speed Slider Improvements

- [x] **Tests**
  - [x] Test click response
  - [x] Test snap-to-nearest
  - [x] Test keyboard accessibility
  - [x] Test visual feedback

- [x] **Implementation**
  - [x] Enhance slider component
  - [x] Add click handling
  - [x] Implement keyboard control
  - [x] Improve visual feedback

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure proper slider behavior

## Phase 5: Model Visibility and Security

### 5.1 Hide Model Functionality

- [x] **Tests**
  - [x] Test hide toggle
  - [x] Test visibility state
  - [x] Test UI updates
  - [x] Test persistence

- [x] **Implementation**
  - [x] Add visibility toggle
  - [x] Implement state management
  - [x] Update UI for hidden state
  - [x] Add persistence

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure proper visibility control

### 5.2 Lock Model with Password

- [x] **Tests**
  - [x] Test password setting
  - [x] Test locking mechanism
  - [x] Test unlocking
  - [x] Test password validation

- [x] **Implementation**
  - [x] Add password input
  - [x] Implement locking mechanism
  - [x] Add unlocking functionality
  - [x] Implement validation

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure proper locking behavior

### 5.3 Secure Storage

- [x] **Tests**
  - [x] Test password storage
  - [x] Test password retrieval
  - [x] Test security against inspection
  - [x] Test password reset

- [x] **Implementation**
  - [x] Implement secure storage
  - [x] Add retrieval mechanism
  - [x] Ensure security
  - [x] Add reset functionality

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors
  - [x] Ensure secure storage behavior

## Phase 6: Simulation and Sampling Enhancements

### 6.1 "Repeat Until" Condition

- [ ] **Tests**
  - [ ] Test condition parser
    - [ ] Test parsing formula conditions
    - [ ] Test parsing pattern conditions
    - [ ] Test handling empty conditions
  - [ ] Test condition evaluation
    - [ ] Test CODAP API integration for formula evaluation
    - [ ] Test handling of API errors and edge cases
    - [ ] Test pattern matching evaluation
    - [ ] Test condition evaluation with sample data
  - [ ] Test UI components
    - [ ] Test toggling between Select and Repeat modes
    - [ ] Test condition input field validation
    - [ ] Test help button and guidance modal
    - [ ] Test disabled state when model is locked
  - [ ] Test animation integration
    - [ ] Test async condition checking during simulation
    - [ ] Test stopping behavior when conditions are met
    - [ ] Test continuation to next sample

- [ ] **Implementation**
  - [ ] Add `repeatUntilCondition` property to global state
  - [ ] Create dedicated RepeatUntil component
    - [ ] Implement mode toggle UI
    - [ ] Add condition input field with validation
    - [ ] Create help button with formula guidance
  - [ ] Create condition parser utility
    - [ ] Implement parsing for formula conditions
    - [ ] Implement parsing for pattern conditions
  - [ ] Implement CODAP API integration for formula evaluation
    - [ ] Use formulaEngine/evalExpression endpoint
    - [ ] Handle API responses and errors
    - [ ] Implement fallback for API unavailability
  - [ ] Implement pattern matching evaluation
  - [ ] Update animation controller
    - [ ] Add async condition checking logic
    - [ ] Implement stopping behavior when condition is met
    - [ ] Ensure proper continuation to next sample
  - [ ] Add error handling
    - [ ] Display validation errors
    - [ ] Handle API errors gracefully
    - [ ] Manage edge cases

- [ ] **Error Resolution**
  - [ ] Fix test failures related to the new `repeatUntilCondition` property
  - [ ] Update mock global states in tests to include the new property
  - [ ] Mock CODAP API responses in tests
  - [ ] Fix animation context mock in tests to handle async operations
  - [ ] Ensure all tests pass with the new implementation
  - [ ] Verify backward compatibility with existing documents

### 6.2 Skip Animation in "Fastest" Speed

- [x] **Tests**
  - [x] Test animation skipping
  - [x] Test state transitions
  - [x] Test performance with large samples
  - [x] Test result accuracy

- [x] **Implementation**
  - [x] Modify animation controller
  - [x] Add direct state transitions
  - [x] Optimize for large samples
  - [x] Ensure result accuracy

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors

### 6.3 Collector Device Enhancements

- [x] **Tests**
  - [x] Test dataset connection
  - [x] Test attribute handling
  - [x] Test data type conversion
  - [x] Test sampling from datasets

- [x] **Implementation**
  - [x] Improve dataset connection UI
  - [x] Enhance attribute handling
  - [x] Optimize sampling process
  - [x] Fix bugs in collector output display

- [x] **Error Resolution**
  - [x] Verify all tests pass
  - [x] Fix any linting or type errors

### 6.4 Measures Tab Improvements

- [ ] **Tests**
  - [ ] Test device variable usage
  - [ ] Test attribute type handling
  - [ ] Test formula variable renaming
  - [ ] Test complex measures

- [ ] **Implementation**
  - [ ] Update measure creation
  - [ ] Fix attribute type handling
  - [ ] Add variable renaming propagation
  - [ ] Support complex measures

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper measure calculation

## Phase 7: Multi-Device and Formula Handling

### 7.1 Multiple Samplers Support

- [ ] **Tests**
  - [ ] Test multiple instance creation
  - [ ] Test data context isolation
  - [ ] Test resource sharing
  - [ ] Test instance identification

- [ ] **Implementation**
  - [ ] Add unique identifiers
  - [ ] Implement data context isolation
  - [ ] Optimize resource sharing
  - [ ] Add instance management

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper multi-instance support

### 7.2 Data Context Management

- [ ] **Tests**
  - [ ] Test context creation
  - [ ] Test naming conventions
  - [ ] Test attribute mapping
  - [ ] Test context updates

- [ ] **Implementation**
  - [ ] Enhance context creation
  - [ ] Implement naming conventions
  - [ ] Improve attribute mapping
  - [ ] Add context update handling

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper context management

### 7.3 Formula Variable Renaming

- [ ] **Tests**
  - [ ] Test reference tracking
  - [ ] Test name propagation
  - [ ] Test formula parsing
  - [ ] Test error handling

- [ ] **Implementation**
  - [ ] Add reference tracking
  - [ ] Implement name propagation
  - [ ] Enhance formula parsing
  - [ ] Improve error handling

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper variable renaming

## Phase 8: Backward Compatibility

### 8.1 State Migration

- [ ] **Tests**
  - [ ] Test loading old state
  - [ ] Test property migration
  - [ ] Test fallback handling
  - [ ] Test data preservation

- [ ] **Implementation**
  - [ ] Add state migration
  - [ ] Implement property handling
  - [ ] Add fallbacks
  - [ ] Ensure data preservation

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper state migration

### 8.2 Feature Degradation

- [ ] **Tests**
  - [ ] Test feature detection
  - [ ] Test graceful degradation
  - [ ] Test user feedback
  - [ ] Test core functionality

- [ ] **Implementation**
  - [ ] Add feature detection
  - [ ] Implement graceful degradation
  - [ ] Add user feedback
  - [ ] Ensure core functionality

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper feature degradation

## Phase 9: Integration and Performance

### 9.1 Integration Testing

- [ ] **Tests**
  - [ ] Test complete workflows
  - [ ] Test component interactions
  - [ ] Test CODAP integration
  - [ ] Test error scenarios

- [ ] **Implementation**
  - [ ] Fix integration issues
  - [ ] Improve component interactions
  - [ ] Enhance CODAP integration
  - [ ] Add error handling

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure proper integration

### 9.2 Performance Optimization

- [ ] **Tests**
  - [ ] Test large sample performance
  - [ ] Test animation optimization
  - [ ] Test memory usage
  - [ ] Test rendering efficiency

- [ ] **Implementation**
  - [ ] Optimize large sample handling
  - [ ] Improve animation performance
  - [ ] Reduce memory usage
  - [ ] Enhance rendering efficiency

- [ ] **Error Resolution**
  - [ ] Verify all tests pass
  - [ ] Fix any linting or type errors
  - [ ] Ensure optimal performance

## Phase 10: Documentation and Final Testing

### 10.1 Documentation

- [ ] **User Documentation**
  - [ ] Create user guide
  - [ ] Add feature documentation
  - [ ] Include tutorials
  - [ ] Document known limitations

- [ ] **Developer Documentation**
  - [ ] Document code structure
  - [ ] Add API documentation
  - [ ] Include contribution guidelines
  - [ ] Document testing approach

### 10.2 Final Testing

- [ ] **End-to-End Testing**
  - [ ] Test all user workflows
  - [ ] Test edge cases
  - [ ] Test error handling
  - [ ] Test performance

- [ ] **Cross-Browser Testing**
  - [ ] Test in Chrome
  - [ ] Test in Firefox
  - [ ] Test in Safari
  - [ ] Test in Edge

- [ ] **Accessibility Testing**
  - [ ] Test keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Test color contrast
  - [ ] Test WCAG 2.1 AA compliance

### 10.3 Final Review and Deployment

- [ ] **Code Review**
  - [ ] Review all components
  - [ ] Check for code quality issues
  - [ ] Ensure test coverage
  - [ ] Verify documentation

- [ ] **Deployment Preparation**
  - [ ] Create production build
  - [ ] Prepare release notes
  - [ ] Create installation package
  - [ ] Document deployment process

- [ ] **Final Approval**
  - [ ] Verify all requirements are met
  - [ ] Ensure all tests pass
  - [ ] Confirm documentation is complete
  - [ ] Obtain stakeholder approval

## TDD Process Reminder

For each feature:

1. **Write Tests First**
   - Define expected behavior
   - Create test cases
   - Ensure tests fail initially

2. **Implement Minimal Code**
   - Write just enough code to pass tests
   - Focus on functionality, not optimization
   - Keep implementation simple

3. **Verify Tests Pass**
   - Run tests to ensure they pass
   - Check code coverage
   - Verify behavior matches requirements

4. **Refactor Code**
   - Improve code quality
   - Eliminate duplication
   - Enhance readability
   - Maintain test passing state

5. **Error Resolution**
   - Fix any linting errors
   - Resolve type issues
   - Address performance concerns
   - Document any limitations or known issues

6. **Document Changes**
   - Update documentation
   - Add code comments
   - Note design decisions
   - Document testing approach 