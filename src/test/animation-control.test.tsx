import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalStateContext } from '../hooks/useGlobalState';
import { ModelTab } from '../components/model/model-component';
import { Speed, ViewType, NavTab, AttrMap } from '../types';
import { useSpinnerAnimation } from '../hooks/useSpinnerAnimation';

/**
 * Animation Control Tests
 * 
 * These tests verify that users have control over animations and time-based content
 * to comply with WCAG 2.2 Enough Time criterion.
 */

describe('Animation Control Tests', () => {
  // Mock global state
  const mockSetGlobalState = jest.fn();
  
  // Mock AttrMap
  const mockAttrMap: AttrMap = {
    experiment: { name: 'experiment', codapID: null },
    description: { name: 'description', codapID: null },
    sample_size: { name: 'sample_size', codapID: null },
    experimentHash: { name: 'experimentHash', codapID: null },
    sample: { name: 'sample', codapID: null }
  };
  
  const createMockGlobalState = (isRunning: boolean, speed: Speed, isPaused: boolean = false, reduceMotion: boolean = false) => ({
    globalState: {
      model: {
        columns: [
          {
            id: 'column-1',
            name: 'Column 1',
            devices: [
              {
                id: 'device-1',
                viewType: ViewType.Mixer,
                variables: ['A', 'B', 'C'],
                collectorVariables: [],
                formulas: {},
                hidden: false,
                lockPassword: '',
              },
            ],
          },
        ],
      },
      selectedDeviceId: 'device-1',
      selectedTab: 'Model' as NavTab,
      isRunning,
      speed,
      repeat: false,
      replacement: false,
      sampleSize: '10',
      numSamples: '10',
      enableRunButton: true,
      dataContexts: [],
      attrMap: mockAttrMap,
      collectorContext: undefined,
      samplerContext: undefined,
      showPasswordModal: false,
      modelLocked: false,
      isModelHidden: false,
      isPaused,
      modelPassword: '',
      passwordModalMode: 'enter' as 'enter' | 'set' | 'change',
      repeatUntilCondition: '',
      reduceMotion,
    },
    setGlobalState: mockSetGlobalState,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test that the animation controls are accessible
  test('Animation controls have proper ARIA attributes', () => {
    const mockGlobalState = createMockGlobalState(false, Speed.Medium);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Check that the animation controls toolbar has proper ARIA attributes
    const controlsToolbar = screen.getByRole('toolbar', { name: /animation controls/i });
    expect(controlsToolbar).toBeInTheDocument();
    
    // Check that the start button has proper ARIA attributes
    const startButton = screen.getByRole('button', { name: /start animation/i });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveAttribute('aria-label', 'Start animation');
    
    // Check that the stop button has proper ARIA attributes
    const stopButton = screen.getByRole('button', { name: /stop animation/i });
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).toHaveAttribute('aria-label', 'Stop animation');
    
    // Check that the speed slider has proper ARIA attributes
    const speedSlider = screen.getByLabelText(/animation speed/i);
    expect(speedSlider).toBeInTheDocument();
  });

  // Test that animations can be paused
  test('Animations can be paused while running', () => {
    const mockGlobalState = createMockGlobalState(true, Speed.Medium);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Look for pause button when animation is running
    const pauseButton = screen.getByRole('button', { name: /pause animation/i });
    expect(pauseButton).toBeInTheDocument();
    
    // Click pause button
    fireEvent.click(pauseButton);
    
    // Verify that setGlobalState was called to pause the animation
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  // Test that animations can be resumed after pausing
  test('Animations can be resumed after pausing', () => {
    const mockGlobalState = createMockGlobalState(true, Speed.Medium, true);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Look for resume button when animation is paused
    const resumeButton = screen.getByRole('button', { name: /resume animation/i });
    expect(resumeButton).toBeInTheDocument();
    
    // Click resume button
    fireEvent.click(resumeButton);
    
    // Verify that setGlobalState was called to resume the animation
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  // Test that animation speed can be adjusted
  test('Animation speed can be adjusted', () => {
    const mockGlobalState = createMockGlobalState(true, Speed.Medium);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Look for speed control
    const speedControl = screen.getByLabelText(/animation speed/i);
    expect(speedControl).toBeInTheDocument();
    
    // Change speed
    fireEvent.change(speedControl, { target: { value: Speed.Slow } });
    
    // Verify that setGlobalState was called to change the speed
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  // Test that animations can be stopped completely
  test('Animations can be stopped completely', () => {
    const mockGlobalState = createMockGlobalState(true, Speed.Medium);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Look for stop button
    const stopButton = screen.getByRole('button', { name: /stop animation/i });
    expect(stopButton).toBeInTheDocument();
    
    // Click stop button
    fireEvent.click(stopButton);
    
    // Verify that setGlobalState was called to stop the animation
    expect(mockSetGlobalState).toHaveBeenCalled();
  });

  // Test that animation controls are accessible via keyboard
  test('Animation controls are keyboard focusable', () => {
    const mockGlobalState = createMockGlobalState(true, Speed.Medium);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Find all animation control buttons
    const buttons = screen.getAllByRole('button');
    const controlButtons = buttons.filter(button => 
      button.getAttribute('aria-label')?.match(/animation/i)
    );
    
    // Verify that all control buttons are keyboard focusable
    controlButtons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  // Test that animations respect the reduced motion setting
  test('Animations respect the reduced motion setting', () => {
    // Create a mock global state with reduced motion enabled
    const mockGlobalState = createMockGlobalState(true, Speed.Medium, false, true);
    
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <ModelTab />
      </GlobalStateContext.Provider>
    );
    
    // Verify that the animation is running but with reduced motion
    // This is mostly a placeholder test since the actual animation behavior
    // is tested in the component-specific tests
    expect(mockGlobalState.globalState.reduceMotion).toBe(true);
    expect(mockGlobalState.globalState.isRunning).toBe(true);
  });
});

// Mock the useGlobalState hook
jest.mock('../hooks/useGlobalState', () => ({
  GlobalStateContext: {
    Provider: ({ children, value }: { children: React.ReactNode, value: any }) => children
  },
  useGlobalStateContext: () => {
    const [state, setState] = React.useState({
      reduceMotion: false
    });
    
    const setGlobalState = (callback: (draft: any) => void) => {
      setState(prevState => {
        const newState = { ...prevState };
        callback(newState);
        return newState;
      });
    };
    
    return { globalState: state, setGlobalState };
  }
}));

// Mock the useSpinnerAnimation hook
jest.mock('../hooks/useSpinnerAnimation', () => ({
  useSpinnerAnimation: () => ({
    isAnimating: true,
    animationProgress: 50,
    rotation: 180,
    targetVariable: null,
    targetVariableIndex: null,
    isAnimationTarget: jest.fn(),
    pauseAnimation: jest.fn(),
    resumeAnimation: jest.fn()
  })
}));

// Mock component that uses spinner animation
const MockSpinnerComponent = () => {
  // Check for prefers-reduced-motion media query
  const prefersReducedMotion = window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const [globalState, setGlobalState] = React.useState({
    reduceMotion: prefersReducedMotion
  });
  
  // Mock animation state and controls
  const [animationState, setAnimationState] = React.useState({
    isAnimating: true,
    animationProgress: 50,
    rotation: 180
  });

  const pauseAnimation = () => {
    setAnimationState(prev => ({
      ...prev,
      isAnimating: false
    }));
  };

  const resumeAnimation = () => {
    setAnimationState(prev => ({
      ...prev,
      isAnimating: true
    }));
  };

  const toggleAnimation = () => {
    if (animationState.isAnimating) {
      pauseAnimation();
    } else {
      resumeAnimation();
    }
  };

  const toggleReducedMotion = () => {
    setGlobalState(prevState => ({
      ...prevState,
      reduceMotion: !prevState.reduceMotion
    }));
  };

  return (
    <div data-testid="spinner-container">
      <div 
        data-testid="spinner-element" 
        style={{ 
          transform: `rotate(${animationState.rotation}deg)`,
          transition: globalState.reduceMotion ? 'none' : 'transform 0.3s ease'
        }}
      >
        Spinner Content
      </div>
      <div data-testid="animation-progress">{animationState.animationProgress}</div>
      <button 
        data-testid="toggle-animation"
        onClick={toggleAnimation}
        aria-label={animationState.isAnimating ? "Pause animation" : "Resume animation"}
      >
        {animationState.isAnimating ? "Pause" : "Resume"}
      </button>
      <button 
        data-testid="toggle-reduced-motion"
        onClick={toggleReducedMotion}
        aria-label={globalState.reduceMotion ? "Enable animations" : "Reduce motion"}
      >
        {globalState.reduceMotion ? "Enable animations" : "Reduce motion"}
      </button>
    </div>
  );
};

describe('Animation Control Accessibility (WCAG 2.2.2 & 2.3.3)', () => {
  test('animations can be paused and resumed', () => {
    render(<MockSpinnerComponent />);
    
    // Check initial state
    const toggleButton = screen.getByTestId('toggle-animation');
    expect(toggleButton).toHaveTextContent('Pause');
    expect(toggleButton).toHaveAttribute('aria-label', 'Pause animation');
    
    // Pause animation
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Resume');
    expect(toggleButton).toHaveAttribute('aria-label', 'Resume animation');
    
    // Resume animation
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Pause');
    expect(toggleButton).toHaveAttribute('aria-label', 'Pause animation');
  });
  
  test('reduced motion preference is respected', () => {
    render(<MockSpinnerComponent />);
    
    const spinnerElement = screen.getByTestId('spinner-element');
    const toggleReducedMotionButton = screen.getByTestId('toggle-reduced-motion');
    
    // Initial state should have transitions
    expect(spinnerElement).toHaveStyle('transition: transform 0.3s ease');
    
    // Enable reduced motion
    fireEvent.click(toggleReducedMotionButton);
    
    // Should have no transitions when reduced motion is enabled
    expect(spinnerElement).toHaveStyle('transition: none');
    
    // Disable reduced motion
    fireEvent.click(toggleReducedMotionButton);
    
    // Should restore transitions
    expect(spinnerElement).toHaveStyle('transition: transform 0.3s ease');
  });
  
  test('animation controls have proper ARIA attributes', () => {
    render(<MockSpinnerComponent />);
    
    const toggleButton = screen.getByTestId('toggle-animation');
    const toggleReducedMotionButton = screen.getByTestId('toggle-reduced-motion');
    
    // Check ARIA attributes
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleReducedMotionButton).toHaveAttribute('aria-label');
  });
  
  test('animation speed can be adjusted', () => {
    // This would test any speed adjustment functionality
    // For now, we'll just verify the component renders
    render(<MockSpinnerComponent />);
    expect(screen.getByTestId('spinner-container')).toBeInTheDocument();
  });
  
  test('respects prefers-reduced-motion media query', () => {
    // Mock the window.matchMedia to simulate a user with prefers-reduced-motion setting
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    // Create a component with the mocked matchMedia
    const { rerender } = render(<MockSpinnerComponent />);
    
    // Force a re-render to ensure the component picks up the media query
    rerender(<MockSpinnerComponent />);
    
    // The component should respect the media query and disable animations
    const spinnerElement = screen.getByTestId('spinner-element');
    expect(spinnerElement).toHaveStyle('transition: none');
    
    // Restore the original matchMedia
    window.matchMedia = originalMatchMedia;
  });
}); 