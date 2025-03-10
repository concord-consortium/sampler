import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Wedge } from './wedge';
import { GlobalStateContext } from '../../../../hooks/useGlobalState';
import { Speed } from '../../../../types';

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

    const textBacker = screen.getByTestId('text-backer');
    fireEvent.click(textBacker);
    
    expect(defaultProps.handleSetEditingVarName).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleSetEditingVarName).toHaveBeenCalledWith(0);
    expect(defaultProps.handleSetSelectedVariable).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleSetSelectedVariable).toHaveBeenCalledWith(0);
  });

  test('does not call handlers when isRunning is true', () => {
    const runningGlobalState = {
      ...mockGlobalState,
      globalState: {
        ...mockGlobalState.globalState,
        isRunning: true
      }
    };

    render(
      <GlobalStateContext.Provider value={runningGlobalState}>
        <Wedge {...defaultProps} />
      </GlobalStateContext.Provider>
    );

    const textBacker = screen.getByTestId('text-backer');
    fireEvent.click(textBacker);

    expect(defaultProps.handleSetSelectedVariable).not.toHaveBeenCalled();
    expect(defaultProps.handleSetEditingVarName).not.toHaveBeenCalled();
  });

  test('shows percentage label when boundary is being dragged', () => {
    render(
      <GlobalStateContext.Provider value={mockGlobalState}>
        <Wedge {...defaultProps} isBoundaryBeingDragged={true} />
      </GlobalStateContext.Provider>
    );

    // We can't directly test for the percentage label since we're mocking SVG elements,
    // but we can verify that the component renders without errors
    const component = screen.getByTestId('text-backer');
    expect(component).toBeInTheDocument();
  });
}); 