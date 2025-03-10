import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalStateContext } from '../hooks/useGlobalState';
import { ModelTab } from '../components/model/model-component';
import { Speed, ViewType, NavTab, AttrMap } from '../types';

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
  
  const createMockGlobalState = (isRunning: boolean, speed: Speed, isPaused: boolean = false) => ({
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
}); 