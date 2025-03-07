import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepeatUntil } from '.';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { AttrMap, Speed } from '../../types';

// Mock the global state context
const mockSetGlobalState = jest.fn();

// Create mock AttrMap
const mockAttrMap: AttrMap = {
  experiment: { name: 'experiment', codapID: null },
  description: { name: 'description', codapID: null },
  sample_size: { name: 'sample_size', codapID: null },
  experimentHash: { name: 'experimentHash', codapID: null },
  sample: { name: 'sample', codapID: null },
  item: { name: 'item', codapID: null }
};

describe('RepeatUntil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when repeat is enabled', () => {
    const globalState = {
      repeat: true,
      repeatUntilCondition: '',
      // Other required state properties
      model: { columns: [] },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      replacement: true,
      sampleSize: '1',
      numSamples: '5',
      enableRunButton: true,
      attrMap: mockAttrMap,
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
      passwordModalMode: 'set' as const
    };

    render(
      <GlobalStateContext.Provider value={{ globalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Check that the component renders
    expect(screen.getByText(/Repeat Until/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render when repeat is disabled', () => {
    const globalState = {
      repeat: false,
      repeatUntilCondition: '',
      // Other required state properties
      model: { columns: [] },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      replacement: true,
      sampleSize: '1',
      numSamples: '5',
      enableRunButton: true,
      attrMap: mockAttrMap,
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
      passwordModalMode: 'set' as const
    };

    render(
      <GlobalStateContext.Provider value={{ globalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Check that the component doesn't render
    expect(screen.queryByText(/Repeat Until/i)).not.toBeInTheDocument();
  });

  it('updates the repeatUntilCondition when input changes', () => {
    const globalState = {
      repeat: true,
      repeatUntilCondition: '',
      // Other required state properties
      model: { columns: [] },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      replacement: true,
      sampleSize: '1',
      numSamples: '5',
      enableRunButton: true,
      attrMap: mockAttrMap,
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
      passwordModalMode: 'set' as const
    };

    render(
      <GlobalStateContext.Provider value={{ globalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Find the input and change its value
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '=x > 5' } });

    // Check that setGlobalState was called with the updated condition
    expect(mockSetGlobalState).toHaveBeenCalledWith(expect.any(Function));
  });

  it('displays the current repeatUntilCondition value', () => {
    const globalState = {
      repeat: true,
      repeatUntilCondition: '=x > 5',
      // Other required state properties
      model: { columns: [] },
      selectedDeviceId: undefined,
      selectedTab: 'Model' as const,
      replacement: true,
      sampleSize: '1',
      numSamples: '5',
      enableRunButton: true,
      attrMap: mockAttrMap,
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
      passwordModalMode: 'set' as const
    };

    render(
      <GlobalStateContext.Provider value={{ globalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Check that the input displays the current value
    expect(screen.getByRole('textbox')).toHaveValue('=x > 5');
  });
}); 
