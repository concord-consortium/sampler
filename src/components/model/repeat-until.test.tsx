import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepeatUntil } from '.';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { AttrMap, Speed } from '../../types';

// Mock the global state context
const mockSetGlobalState = jest.fn();

// Create mock AttrMap
const mockAttrMap: AttrMap = {
  experiment: { codapID: null, name: 'experiment' },
  description: { codapID: null, name: 'description' },
  sample_size: { codapID: null, name: 'sample size' },
  experimentHash: { codapID: null, name: 'experimentHash' },
  sample: { codapID: null, name: 'sample' },
  item: { codapID: null, name: 'item' }
};

// Create mock global state
const createMockGlobalState = (overrides = {}) => ({
  model: { columns: [] },
  selectedDeviceId: undefined,
  selectedTab: 'Model' as 'Model' | 'Measures' | 'About',
  repeat: true,
  replacement: true,
  sampleSize: '5',
  numSamples: '10',
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
  passwordModalMode: 'set' as 'set' | 'enter' | 'change',
  repeatUntilCondition: '',
  ...overrides
});

describe('RepeatUntil Component', () => {
  beforeEach(() => {
    mockSetGlobalState.mockClear();
  });

  it('should render when repeat is enabled', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    expect(screen.getByLabelText('Repeat Until:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter condition/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\?/ })).toBeInTheDocument();
  });

  it('should not render when repeat is disabled', () => {
    const mockGlobalState = createMockGlobalState({ repeat: false });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    expect(screen.queryByLabelText('Repeat Until:')).not.toBeInTheDocument();
  });

  it('should update global state when condition changes', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const input = screen.getByLabelText('Repeat Until:');
    fireEvent.change(input, { target: { value: '=count(output="a") > 3' } });
    
    expect(mockSetGlobalState).toHaveBeenCalled();
    // Check that the draft function was called with the correct value
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { repeatUntilCondition: '' };
    draftFn(mockDraft);
    expect(mockDraft.repeatUntilCondition).toBe('=count(output="a") > 3');
  });

  it('should be disabled when model is locked', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true, modelLocked: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    expect(screen.getByLabelText('Repeat Until:')).toBeDisabled();
    expect(screen.getByRole('button', { name: /\?/ })).toBeDisabled();
  });

  it('should show help modal when help button is clicked', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const helpButton = screen.getByRole('button', { name: /\?/ });
    fireEvent.click(helpButton);
    
    expect(screen.getByText('Condition Syntax Help')).toBeInTheDocument();
    expect(screen.getByText('Formula Conditions')).toBeInTheDocument();
    expect(screen.getByText('Pattern Matching')).toBeInTheDocument();
  });

  it('should close help modal when close button is clicked', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    // Open the modal
    const helpButton = screen.getByRole('button', { name: /\?/ });
    fireEvent.click(helpButton);
    
    // Close the modal
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    // Modal should be closed
    expect(screen.queryByText('Condition Syntax Help')).not.toBeInTheDocument();
  });
}); 
