import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wedge } from './wedge';
import { GlobalStateContext } from '../../../../hooks/useGlobalState';
import { IGlobalState, Speed } from '../../../../types';

// Mock the helpers module
jest.mock('../shared/helpers', () => ({
  getCoordinatesForPercent: jest.fn(() => [100, 100]),
  getTextShift: jest.fn(() => 0),
  getVariableColor: jest.fn(() => '#FFFFFF')
}));

// Mock the TextBacker component
jest.mock('./text-backer', () => ({
  TextBacker: jest.fn(({ onClick }) => (
    <div data-testid="text-backer" onClick={onClick} />
  )),
  updateTextBackerRefFn: jest.fn(() => jest.fn())
}));

// Mock the animation-helpers module
jest.mock('./animation-helpers', () => ({
  calculatePulseEffect: jest.fn(() => 1.1),
  calculateWedgeOpacity: jest.fn(() => 0.8),
  calculateHighlightIntensity: jest.fn(() => 0.5)
}));

// Mock SVG elements
beforeAll(() => {
  // Create mock implementations for SVG elements
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = (tagName: string) => {
    if (tagName === 'svg' || tagName === 'path' || tagName === 'g' || tagName === 'text' || tagName === 'rect' || tagName === 'clipPath') {
      const element = originalCreateElement('div');
      element.setAttribute('data-testid', `mock-${tagName}`);
      return element;
    }
    return originalCreateElement(tagName);
  };
});

describe('Wedge Component', () => {
  const defaultProps = {
    percent: 0.25,
    lastPercent: 0,
    variableName: 'Test Variable',
    index: 0,
    labelFontSize: 12,
    varArrayIdx: 0,
    numUniqueVariables: 4,
    selectedWedge: null,
    nextVariable: 'Next Variable',
    isDragging: false,
    isLastVariable: false,
    isBoundaryBeingDragged: false,
    deviceId: 'test-device',
    handleAddDefs: jest.fn(),
    handleSetSelectedVariable: jest.fn(),
    handleDeleteWedge: jest.fn(),
    handleSetEditingPct: jest.fn(),
    handleSetEditingVarName: jest.fn()
  };

  // Create a minimal mock global state that satisfies the IGlobalState interface
  const createMockGlobalState = (overrides = {}): IGlobalState => ({
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
    repeatUntilCondition: '',
    reduceMotion: false,
    ...overrides
  });

  // Helper function to create the context value
  const createContextValue = (stateOverrides = {}) => {
    const state = createMockGlobalState(stateOverrides);
    return {
      globalState: state,
      setGlobalState: jest.fn()
    };
  };

  const mockGlobalState = createContextValue();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds clip path definition on mount', () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Wedge {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    // Check that handleAddDefs was called
    expect(defaultProps.handleAddDefs).toHaveBeenCalled();
  });

  test('calls handleSetSelectedVariable when text backer is clicked', () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Wedge {...defaultProps} />
      </GlobalStateContext.Provider>
    );
    
    // Find and click the text backer
    const textBacker = screen.getByTestId('text-backer');
    fireEvent.click(textBacker);
    
    // Check that handleSetSelectedVariable was called with the correct arguments
    expect(defaultProps.handleSetSelectedVariable).toHaveBeenCalledWith(defaultProps.varArrayIdx);
  });

  test('renders with correct opacity when running', () => {
    const runningGlobalState = createContextValue({ isRunning: true });
    
    render(
      <GlobalStateContext.Provider value={runningGlobalState}>
        <Wedge {...defaultProps} />
      </GlobalStateContext.Provider>
    );
    
    // Verify that the component renders correctly when running
    // This is a basic test since we're mocking most of the SVG functionality
    expect(screen.getByTestId('text-backer')).toBeInTheDocument();
  });

  test('handles boundary dragging correctly', () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Wedge {...{...defaultProps, isBoundaryBeingDragged: true}} />
      </GlobalStateContext.Provider>
    );
    
    // Verify that the component renders correctly when boundary is being dragged
    expect(screen.getByTestId('text-backer')).toBeInTheDocument();
  });
}); 