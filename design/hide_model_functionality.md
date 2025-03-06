# Hide Model Functionality Design Document

## 1. Problem Statement

In educational settings, instructors often need to hide the underlying model of a simulation to focus students on outcomes or to prevent them from seeing the configuration during assessments. The Sampler tool currently lacks the ability to hide the model, which limits its utility in certain educational scenarios. This feature will allow users to toggle the visibility of the model, enhancing the tool's flexibility in classroom settings.

## 2. Requirements

### 2.1 Functional Requirements

- Users must be able to toggle the visibility of the model components
- When hidden, the model should not be visible to users
- The visibility state must persist between sessions
- The toggle control should be easily accessible in the UI
- The hidden state should be clearly indicated to the user
- The feature should not affect the functionality of the simulation

### 2.2 Non-Functional Requirements

- The toggle mechanism should be intuitive and follow UI best practices
- The implementation should not significantly impact performance
- The feature should be accessible via keyboard navigation
- The visibility state should be stored efficiently in the application state

## 3. Design Approach

### 3.1 User Interface

We will add a toggle button in the Model Tab header area with the following characteristics:
- An eye icon that changes to a crossed-out eye when the model is hidden
- A tooltip explaining the functionality
- Keyboard accessibility (can be toggled with Enter/Space when focused)
- Clear visual feedback when activated

### 3.2 State Management

The visibility state will be stored in the global application state:
- Add a `isModelHidden` boolean property to the global state
- Implement actions to toggle this state
- Ensure the state is included in any serialization for persistence

### 3.3 UI Updates

When the model is hidden:
- Apply CSS to hide the device components in the Model Tab
- Show a message indicating the model is hidden
- Maintain the simulation controls to allow running the simulation
- Keep the measures tab fully functional

### 3.4 Persistence

The visibility state will be persisted:
- Include the state in the CODAP plugin state
- Restore the state when the application loads
- Ensure the UI reflects the persisted state

## 4. Implementation Plan

### 4.1 Component Updates

#### 4.1.1 ModelTab Component
- Add a toggle button to the header
- Implement conditional rendering based on visibility state
- Add a message for the hidden state

#### 4.1.2 Toggle Button Component
- Create a reusable toggle button with icon
- Implement accessibility features
- Add appropriate styling for states

### 4.2 State Management Updates

- Add visibility property to global state
- Create actions for toggling visibility
- Update state serialization and deserialization

### 4.3 CSS Updates

- Create styles for hidden state
- Implement transitions for smooth toggling
- Ensure proper layout when model is hidden

## 5. Testing Strategy

### 5.1 Unit Tests

- Test toggle button rendering and functionality
- Test visibility state management
- Test UI updates based on visibility state
- Test persistence of visibility state

### 5.2 Integration Tests

- Test interaction between toggle and model components
- Test simulation functionality when model is hidden
- Test persistence across application reloads

### 5.3 Accessibility Tests

- Test keyboard navigation for the toggle
- Test screen reader compatibility
- Test visual indicators for visibility state

## 6. Acceptance Criteria

1. A toggle button with appropriate icon is visible in the Model Tab header
2. Clicking the toggle button changes the visibility state of the model
3. When hidden, the model components are not visible
4. A message indicates that the model is hidden
5. The visibility state persists when the application is reloaded
6. The simulation can still be run when the model is hidden
7. The toggle can be operated via keyboard
8. The toggle provides clear visual feedback of the current state

## 7. Implementation Details

### 7.1 Component Structure

```tsx
// ModelTab.tsx
const ModelTab: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isModelHidden } = state;
  
  const toggleModelVisibility = () => {
    dispatch({ type: 'TOGGLE_MODEL_VISIBILITY' });
  };
  
  return (
    <div className={styles.modelTab}>
      <div className={styles.header}>
        <h2>Model</h2>
        <VisibilityToggle 
          isHidden={isModelHidden} 
          onToggle={toggleModelVisibility} 
          ariaLabel="Toggle model visibility"
        />
      </div>
      
      {isModelHidden ? (
        <div className={styles.hiddenMessage}>
          Model is currently hidden. Toggle visibility to view and edit the model.
        </div>
      ) : (
        <div className={styles.modelContent}>
          {/* Existing model content */}
        </div>
      )}
      
      <div className={styles.controls}>
        {/* Simulation controls remain visible */}
      </div>
    </div>
  );
};
```

```tsx
// VisibilityToggle.tsx
interface VisibilityToggleProps {
  isHidden: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ 
  isHidden, 
  onToggle, 
  ariaLabel 
}) => {
  return (
    <button 
      className={`${styles.visibilityToggle} ${isHidden ? styles.hidden : ''}`}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={isHidden}
    >
      <span className={styles.icon}>
        {isHidden ? <EyeSlashIcon /> : <EyeIcon />}
      </span>
      <span className={styles.tooltip}>
        {isHidden ? 'Show model' : 'Hide model'}
      </span>
    </button>
  );
};
```

### 7.2 State Management

```tsx
// state/types.ts
export interface AppState {
  // Existing state properties
  isModelHidden: boolean;
}

// state/reducer.ts
export const initialState: AppState = {
  // Existing initial state
  isModelHidden: false,
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_MODEL_VISIBILITY':
      return {
        ...state,
        isModelHidden: !state.isModelHidden,
      };
    // Other cases
  }
}
```

### 7.3 CSS Styling

```scss
// ModelTab.module.scss
.modelTab {
  // Existing styles
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .hiddenMessage {
    padding: 20px;
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
  }
}

// VisibilityToggle.module.scss
.visibilityToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: var(--hover-bg);
    
    .tooltip {
      opacity: 1;
      visibility: visible;
    }
  }
  
  &:focus {
    outline: 2px solid var(--focus-color);
  }
  
  &.hidden {
    color: var(--text-secondary);
  }
  
  .icon {
    font-size: 18px;
  }
  
  .tooltip {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--tooltip-bg);
    color: var(--tooltip-text);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s;
    white-space: nowrap;
    pointer-events: none;
  }
}
```

## 8. Risks and Mitigations

### 8.1 Risks

1. **User Confusion**: Users might not understand why the model is hidden or how to restore it.
   - **Mitigation**: Clear visual indicators and tooltips explaining the functionality.

2. **State Persistence Issues**: The visibility state might not persist correctly in all scenarios.
   - **Mitigation**: Comprehensive testing of state serialization and deserialization.

3. **Accessibility Concerns**: The toggle might not be accessible to all users.
   - **Mitigation**: Follow WCAG guidelines and test with screen readers.

4. **Performance Impact**: Conditional rendering might affect performance.
   - **Mitigation**: Use efficient rendering techniques and test with performance monitoring.

## 9. Future Enhancements

1. Add an option to password-protect the visibility toggle
2. Implement different levels of hiding (partial vs. complete)
3. Add the ability to hide specific devices rather than the entire model
4. Integrate with a teacher dashboard for remote control of visibility

## 10. Conclusion

The Hide Model Functionality will enhance the Sampler tool's utility in educational settings by allowing instructors to focus students on outcomes rather than the model configuration. The implementation follows best practices for state management, UI design, and accessibility, ensuring a seamless user experience while maintaining the tool's core functionality. 