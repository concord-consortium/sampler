import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Arrow } from './arrow';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { useResizer } from '../../hooks/use-resizer';
import { useAnimationContext } from '../../hooks/useAnimation';
import { AnimationStep, IAnimationStepSettings, IDevice, ViewType, Speed } from '../../types';

// Mock the hooks
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

jest.mock('../../hooks/use-resizer', () => ({
  useResizer: jest.fn()
}));

jest.mock('../../hooks/useAnimation', () => ({
  useAnimationContext: jest.fn()
}));

// Mock the FormulaEditor component
jest.mock('./formula-editor', () => ({
  FormulaEditor: jest.fn(() => <div data-testid="formula-editor" />)
}));

describe('Arrow', () => {
  // Setup mock devices
  const mockSourceDevice: IDevice = {
    id: 'source-device',
    viewType: ViewType.Mixer,
    variables: ['var1', 'var2'],
    collectorVariables: [],
    formulas: { 'target-device': 'var1 + var2' },
    hidden: false,
    lockPassword: ''
  };
  
  const mockTargetDevice: IDevice = {
    id: 'target-device',
    viewType: ViewType.Mixer,
    variables: ['var3', 'var4'],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ''
  };
  
  // Setup mock props
  const mockProps = {
    source: mockSourceDevice,
    target: mockTargetDevice,
    columnIndex: 1,
    selectedDeviceId: undefined
  };
  
  // Setup mock global state
  const mockGlobalState = {
    model: {
      columns: [
        {
          id: 'col1',
          name: 'Column 1',
          devices: [mockSourceDevice]
        },
        {
          id: 'col2',
          name: 'Column 2',
          devices: [mockTargetDevice]
        }
      ]
    }
  };
  
  // Setup mock animation context
  const mockRegisterAnimationCallback = jest.fn().mockReturnValue(() => {});
  
  // Create stable mock DOM elements
  const mockSourceElement = {
    getBoundingClientRect: () => ({
      width: 100,
      height: 100
    }),
    offsetLeft: 0,
    offsetTop: 0,
    scrollLeft: 0,
    scrollTop: 0,
    offsetParent: null
  };
  
  const mockTargetElement = {
    getBoundingClientRect: () => ({
      width: 100,
      height: 100
    }),
    offsetLeft: 150,
    offsetTop: 0,
    scrollLeft: 0,
    scrollTop: 0,
    offsetParent: null
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the useGlobalStateContext hook
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: mockGlobalState,
      setGlobalState: jest.fn()
    });
    
    // Mock the useResizer hook - don't call the callback immediately
    (useResizer as jest.Mock).mockImplementation(() => {
      // No immediate callback invocation
      return;
    });
    
    // Mock the useAnimationContext hook
    (useAnimationContext as jest.Mock).mockReturnValue({
      registerAnimationCallback: mockRegisterAnimationCallback
    });
    
    // Mock document.querySelector to return stable mock elements
    document.querySelector = jest.fn().mockImplementation((selector: string) => {
      if (selector === '[data-device-id="source-device"]') {
        return mockSourceElement;
      } else if (selector === '[data-device-id="target-device"]') {
        return mockTargetElement;
      }
      return null;
    });
  });
  
  it('renders null when source or target div is not found', () => {
    // Mock document.querySelector to return null for this test only
    const originalQuerySelector = document.querySelector;
    document.querySelector = jest.fn().mockReturnValue(null);
    
    const { container } = render(<Arrow {...mockProps} />);
    
    // Expect the component to render nothing
    expect(container.firstChild).toBeNull();
    
    // Restore the original mock for other tests
    document.querySelector = originalQuerySelector;
  });
  
  it('renders the arrow when source and target divs are found', () => {
    const { container } = render(<Arrow {...mockProps} />);
    
    // Expect the component to render the arrow container
    expect(container.querySelector('.arrow-container')).not.toBeNull();
    
    // Expect the component to render the SVG
    expect(container.querySelector('svg.arrow')).not.toBeNull();
    
    // Expect the component to render the markers
    expect(container.querySelector('marker')).not.toBeNull();
    
    // Expect the component to render the lines
    expect(container.querySelectorAll('line').length).toBe(2);
    
    // Expect the component to render the FormulaEditor
    expect(screen.getByTestId('formula-editor')).toBeInTheDocument();
  });
  
  it('registers an animation callback', () => {
    render(<Arrow {...mockProps} />);
    
    // Expect the registerAnimationCallback to be called
    expect(mockRegisterAnimationCallback).toHaveBeenCalled();
    
    // Get the callback function
    const animateCallback = mockRegisterAnimationCallback.mock.calls[0][0];
    
    // Call the callback with a matching animation step
    const mockStep: AnimationStep = {
      kind: 'animateArrow',
      sourceDeviceId: 'source-device',
      targetDeviceId: 'target-device'
    };
    
    const mockSettings: IAnimationStepSettings = {
      t: 0.25,
      speed: Speed.Medium
    };
    
    // Wrap state updates in act()
    act(() => {
      animateCallback(mockStep, mockSettings);
    });
    
    // Call the callback with a non-matching animation step
    act(() => {
      const mockNonMatchingStep: AnimationStep = {
        kind: 'animateArrow',
        sourceDeviceId: 'other-source',
        targetDeviceId: 'other-target'
      };
      
      animateCallback(mockNonMatchingStep, mockSettings);
    });
    
    // Call the callback with a different kind of animation step
    act(() => {
      const mockDifferentKindStep: AnimationStep = {
        kind: 'modelChanged'
      };
      
      animateCallback(mockDifferentKindStep, mockSettings);
    });
  });
  
  it('redraws when the model or selectedDeviceId changes', () => {
    const { rerender } = render(<Arrow {...mockProps} />);
    
    // Rerender with a different selectedDeviceId
    rerender(<Arrow {...mockProps} selectedDeviceId="source-device" />);
    
    // Rerender with a different model
    const newGlobalState = {
      ...mockGlobalState,
      model: {
        ...mockGlobalState.model,
        columns: [
          ...mockGlobalState.model.columns,
          {
            id: 'col3',
            name: 'Column 3',
            devices: []
          }
        ]
      }
    };
    
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: newGlobalState,
      setGlobalState: jest.fn()
    });
    
    rerender(<Arrow {...mockProps} />);
  });
}); 