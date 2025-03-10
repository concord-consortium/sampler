import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepeatUntil, ConditionHelpModal } from './repeat-until';
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
  
  // New tests for improved coverage
  
  it('should handle formula condition input correctly', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const input = screen.getByLabelText('Repeat Until:');
    
    // Test formula condition
    fireEvent.change(input, { target: { value: '=sum(Score) >= 100' } });
    
    expect(mockSetGlobalState).toHaveBeenCalled();
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { repeatUntilCondition: '' };
    draftFn(mockDraft);
    expect(mockDraft.repeatUntilCondition).toBe('=sum(Score) >= 100');
  });
  
  it('should handle pattern condition input correctly', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const input = screen.getByLabelText('Repeat Until:');
    
    // Test pattern condition
    fireEvent.change(input, { target: { value: 'heads,heads,heads' } });
    
    expect(mockSetGlobalState).toHaveBeenCalled();
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { repeatUntilCondition: '' };
    draftFn(mockDraft);
    expect(mockDraft.repeatUntilCondition).toBe('heads,heads,heads');
  });
  
  it('should handle empty condition input correctly', () => {
    const mockGlobalState = createMockGlobalState({ repeat: true, repeatUntilCondition: 'existing condition' });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const input = screen.getByLabelText('Repeat Until:');
    
    // Test clearing the condition
    fireEvent.change(input, { target: { value: '' } });
    
    expect(mockSetGlobalState).toHaveBeenCalled();
    const draftFn = mockSetGlobalState.mock.calls[0][0];
    const mockDraft = { repeatUntilCondition: 'existing condition' };
    draftFn(mockDraft);
    expect(mockDraft.repeatUntilCondition).toBe('');
  });
  
  it('should display existing condition from global state', () => {
    const existingCondition = '=count(output="success") > 5';
    const mockGlobalState = createMockGlobalState({ 
      repeat: true, 
      repeatUntilCondition: existingCondition 
    });
    
    render(
      <GlobalStateContext.Provider value={{ globalState: mockGlobalState, setGlobalState: mockSetGlobalState }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );
    
    const input = screen.getByLabelText('Repeat Until:');
    expect(input).toHaveValue(existingCondition);
  });
});

describe('ConditionHelpModal Component', () => {
  it('should render with correct content', () => {
    const mockOnClose = jest.fn();
    const { container } = render(<ConditionHelpModal onClose={mockOnClose} />);
    
    // Check for headings
    expect(screen.getByText('Condition Syntax Help')).toBeInTheDocument();
    expect(screen.getByText('Formula Conditions')).toBeInTheDocument();
    expect(screen.getByText('Pattern Matching')).toBeInTheDocument();
    
    // Check for examples using container queries instead of text matching
    const codeElements = container.querySelectorAll('code');
    expect(codeElements.length).toBeGreaterThan(0);
    
    // Check specific examples
    expect(codeElements[0]).toHaveTextContent("=count(output='a') > 3");
    expect(codeElements[1]).toHaveTextContent("=mean(Age) > 30");
    expect(codeElements[2]).toHaveTextContent("=sum(Score) >= 100");
    expect(codeElements[3]).toHaveTextContent("heads,heads,heads");
    expect(codeElements[4]).toHaveTextContent("a,b,a");
    
    // Check for close button
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
  
  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(<ConditionHelpModal onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should have proper modal structure', () => {
    const mockOnClose = jest.fn();
    const { container } = render(<ConditionHelpModal onClose={mockOnClose} />);
    
    // Check for modal overlay
    const modalOverlay = container.querySelector('.modal-overlay');
    expect(modalOverlay).toBeInTheDocument();
    
    // Check for modal content
    const modalContent = container.querySelector('.modal-content');
    expect(modalContent).toBeInTheDocument();
    
    // Check for list items
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThan(0);
  });
}); 
