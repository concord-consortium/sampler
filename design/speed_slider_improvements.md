# Speed Slider Improvements Design Document

## Problem Statement

The current speed slider in the Sampler tool provides basic functionality but lacks several user experience enhancements:
1. It doesn't respond to direct clicks on tick marks or labels
2. It doesn't snap to the nearest speed setting when dragged
3. It lacks keyboard accessibility features
4. It provides minimal visual feedback during interaction

These limitations make the speed slider less intuitive and accessible for users, particularly those who rely on keyboard navigation or prefer more direct interaction methods.

## Requirements

1. **Click Response**:
   - Users should be able to click directly on tick marks or labels to set the speed
   - Clicking between tick marks should select the nearest speed setting

2. **Snap-to-Nearest**:
   - When dragging the slider, it should snap to the nearest speed setting
   - Visual feedback should indicate when snapping occurs

3. **Keyboard Accessibility**:
   - Users should be able to navigate and control the slider using keyboard
   - Arrow keys should increment/decrement the speed
   - Home/End keys should set minimum/maximum speed
   - Tab key should allow focus on the slider

4. **Visual Feedback**:
   - Improved hover and focus states
   - Visual indication of the current speed setting
   - Transition animations for smoother experience

## Technical Design

### Component Structure

We will enhance the existing `SpeedSlider` component with the following improvements:

```tsx
export const SpeedSlider = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed } = globalState;
  const sliderRef = useRef<HTMLInputElement>(null);

  // Handle slider value change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalState(draft => {
      draft.speed = parseInt(event.target.value, 10);
    });
  };

  // Handle click on tick marks or labels
  const handleTickClick = (speedValue: Speed) => {
    setGlobalState(draft => {
      draft.speed = speedValue;
    });
    // Focus the slider after clicking a tick
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        if (speed < Speed.Fastest) {
          setGlobalState(draft => {
            draft.speed = speed + 1;
          });
        }
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        if (speed > Speed.Slow) {
          setGlobalState(draft => {
            draft.speed = speed - 1;
          });
        }
        event.preventDefault();
        break;
      case 'Home':
        setGlobalState(draft => {
          draft.speed = Speed.Slow;
        });
        event.preventDefault();
        break;
      case 'End':
        setGlobalState(draft => {
          draft.speed = Speed.Fastest;
        });
        event.preventDefault();
        break;
    }
  };

  return (
    <div className="speed-slider">
      <input
        ref={sliderRef}
        type="range"
        min={Speed.Slow}
        max={Speed.Fastest}
        value={speed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step={1}
        list="speedSettings"
        className="slider"
        aria-label="Animation Speed"
        aria-valuemin={Speed.Slow}
        aria-valuemax={Speed.Fastest}
        aria-valuenow={speed}
        aria-valuetext={speedLabels[speed]}
      />
      <div className="tick-marks-container">
        {Object.entries(speedLabels).map(([value, label]) => (
          <div 
            className={`tick-mark ${parseInt(value) === speed ? 'active' : ''}`} 
            key={`tick-${label}`}
            onClick={() => handleTickClick(parseInt(value))}
            role="button"
            tabIndex={-1}
            aria-label={`Set speed to ${label}`}
          >
            <div className="tick-line"/>
            <span className="tick-label">{label}</span>
          </div>
        ))}
      </div>
      <span id="speed-text" data-text={`DG.plugin.Sampler.top-bar.${speedLabels[speed].toLowerCase()}-speed`}>
        {speedLabels[speed]}
      </span>
    </div>
  );
};
```

### CSS Enhancements

We will enhance the CSS for the speed slider to provide better visual feedback:

```scss
.speed-slider {
  // Existing styles...

  .tick-marks-container {
    // Existing styles...

    .tick-mark {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.1s ease;

      &:hover {
        transform: scale(1.1);
      }

      &.active .tick-line {
        background-color: #0077cc;
        height: 12px;
      }

      .tick-line {
        width: 2px;
        height: 10px;
        background-color: #777;
        transition: background-color 0.2s ease, height 0.2s ease;
      }

      .tick-label {
        font-size: 10px;
        margin-top: 4px;
        color: #777;
        display: none;
      }

      &:hover .tick-label {
        display: block;
      }
    }
  }

  input[type='range'] {
    // Existing styles...

    &:focus {
      outline: none;
      
      &::-webkit-slider-thumb {
        box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.3);
        border-color: #0077cc;
      }
      
      &::-moz-range-thumb {
        box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.3);
        border-color: #0077cc;
      }
    }
  }

  // Additional styles for active state
  input[type='range']::-webkit-slider-thumb {
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  }

  input[type='range']::-moz-range-thumb {
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  }
}
```

## Testing Strategy

We will create a comprehensive test suite for the SpeedSlider component:

1. **Unit Tests**:
   - Test rendering with different speed values
   - Test click handling on tick marks
   - Test keyboard navigation
   - Test aria attributes for accessibility

2. **Integration Tests**:
   - Test interaction with global state
   - Test integration with animation system

3. **Accessibility Tests**:
   - Test keyboard navigation
   - Test screen reader compatibility
   - Test ARIA attributes

## Implementation Plan

1. Create test file for SpeedSlider component
2. Implement tests for current functionality
3. Implement tests for new features (click response, keyboard navigation, etc.)
4. Enhance SpeedSlider component with new features
5. Update CSS for improved visual feedback
6. Verify all tests pass
7. Fix any issues or edge cases

## Acceptance Criteria

The Speed Slider Improvements feature will be considered complete when:

1. Users can click directly on tick marks to set the speed
2. The slider snaps to the nearest speed setting when dragged
3. Users can navigate and control the slider using keyboard
4. The slider provides clear visual feedback during interaction
5. All tests pass
6. The implementation meets accessibility standards 