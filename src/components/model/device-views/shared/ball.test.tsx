import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Ball } from './ball';
import { GlobalStateContext } from '../../../../hooks/useGlobalState';
import { ClippingDef, IGlobalState, Speed } from '../../../../types';

// Mock the helpers module
jest.mock('./helpers', () => ({
  getTextShift: jest.fn(() => 0),
  getVariableColor: jest.fn(() => '#FFFFFF')
}));

describe('Ball Component', () => {
  const defaultProps = {
    x: 50,
    y: 50,
    transform: 'translate(0, 0)',
    radius: 20,
    text: 'Test Ball',
    fontSize: 12,
    deviceId: 'test-device',
    handleAddDefs: jest.fn(),
    handleSetSelectedVariable: jest.fn(),
    handleSetEditingVarName: jest.fn(),
    i: 0,
    visibility: 'visible' as 'visible' | 'hidden'
  };

  // Create a minimal mock global state that satisfies the IGlobalState interface
  const mockGlobalState = {
    globalState: {
      model: {
        columns: []
      },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      repeat: false,
      replacement: false,
      sampleSize: '10',
      numSamples: '10',
      enableRunButton: true,
      attrMap: {
        experiment: { name: 'experiment', codapID: null },
        description: { name: 'description', codapID: null },
        sample_size: { name: 'sample_size', codapID: null },
        experimentHash: { name: 'experimentHash', codapID: null },
        sample: { name: 'sample', codapID: null },
        item: { name: 'item', codapID: null }
      },
      dataContexts: [],
      collectorContext: undefined,
      samplerContext: undefined,
      isRunning: false,
      isPaused: false,
      speed: Speed.Medium,
      isModelHidden: false,
      modelLocked: false,
      modelPassword: '',
      showPasswordModal: false,
      passwordModalMode: 'set' as const,
      repeatUntilCondition: ''
    },
    setGlobalState: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default props', () => {
    const { container } = render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    // Check that the circle is rendered with correct attributes
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '50');
    expect(circle).toHaveAttribute('cy', '50');
    expect(circle).toHaveAttribute('r', '20');
    expect(circle).toHaveAttribute('visibility', 'visible');

    // Check that the text is rendered with correct content
    const text = screen.getByText('Test Ball');
    expect(text).toBeInTheDocument();
    expect(text).toHaveAttribute('x', '50');
    expect(text).toHaveAttribute('y', '50');
    expect(text).toHaveAttribute('visibility', 'visible');
  });

  test('adds clip path definition on mount', () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    // Check that handleAddDefs was called with the correct clip path
    expect(defaultProps.handleAddDefs).toHaveBeenCalledTimes(1);
    const callArg = defaultProps.handleAddDefs.mock.calls[0][0] as ClippingDef;
    expect(callArg.id).toBe('test-device-text-clip-50-50');
    expect(callArg.element).toBeTruthy();
  });

  test('calls handleSetSelectedVariable when circle is clicked', () => {
    const { container } = render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    if (circle) {
      fireEvent.click(circle);
      expect(defaultProps.handleSetSelectedVariable).toHaveBeenCalledTimes(1);
      expect(defaultProps.handleSetSelectedVariable).toHaveBeenCalledWith(0);
    }
  });

  test('calls handleSetEditingVarName when group is clicked', () => {
    const { container } = render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    // Find the group element (parent of circle and text)
    const group = container.querySelector('g');
    expect(group).toBeInTheDocument();
    
    if (group) {
      fireEvent.click(group);
      expect(defaultProps.handleSetEditingVarName).toHaveBeenCalledTimes(1);
      expect(defaultProps.handleSetEditingVarName).toHaveBeenCalledWith(0);
    }
  });

  test('does not call handlers when isRunning is true', () => {
    const runningGlobalState = {
      ...mockGlobalState,
      globalState: {
        ...mockGlobalState.globalState,
        isRunning: true
      }
    };

    const { container } = render(
      <GlobalStateContext.Provider value={runningGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    if (circle) {
      fireEvent.click(circle);
    }

    const group = container.querySelector('g');
    expect(group).toBeInTheDocument();
    if (group) {
      fireEvent.click(group);
    }

    expect(defaultProps.handleSetSelectedVariable).not.toHaveBeenCalled();
    expect(defaultProps.handleSetEditingVarName).not.toHaveBeenCalled();
  });

  test('renders with hidden visibility when specified', () => {
    const { container } = render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} visibility="hidden" />
      </GlobalStateContext.Provider>
    );

    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('visibility', 'hidden');

    const text = screen.getByText('Test Ball');
    expect(text).toHaveAttribute('visibility', 'hidden');
  });

  test('updates clip path when props change', () => {
    const { rerender } = render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    // Initial render should call handleAddDefs once
    expect(defaultProps.handleAddDefs).toHaveBeenCalledTimes(1);

    // Update props and rerender
    rerender(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Ball {...defaultProps} x={60} y={70} />
      </GlobalStateContext.Provider>
    );

    // handleAddDefs should be called again with new values
    expect(defaultProps.handleAddDefs).toHaveBeenCalledTimes(2);
    const callArg = defaultProps.handleAddDefs.mock.calls[1][0] as ClippingDef;
    expect(callArg.id).toBe('test-device-text-clip-60-70');
  });
}); 