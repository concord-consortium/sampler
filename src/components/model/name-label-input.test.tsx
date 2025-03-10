import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NameLabelInput } from './name-label-input';
import { ViewType } from '../../types';

// Mock getBoundingClientRect for positioning tests
const mockGetBoundingClientRect = jest.fn().mockReturnValue({
  x: 100,
  y: 100,
  width: 100,
  height: 20
});

// Mock element.select() for auto-selection tests
HTMLInputElement.prototype.select = jest.fn();

describe('NameLabelInput Component', () => {
  const defaultProps = {
    variableIdx: 0,
    viewType: ViewType.Mixer,
    variableName: 'Test Variable',
    deviceId: 'test-device-id',
    handleEditVariable: jest.fn(),
    onBlur: jest.fn(),
    existingNames: [] as string[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getElementById and getBoundingClientRect
    jest.spyOn(document, 'getElementById').mockImplementation(() => ({
      getBoundingClientRect: mockGetBoundingClientRect
    } as unknown as HTMLElement));
    
    // Mock offsetWidth for the hidden span
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 100
    });
  });

  it('renders with the correct initial value', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveValue('Test Variable');
  });

  it('calls handleEditVariable and onBlur when Enter key is pressed', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'New Name' } });
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    expect(defaultProps.handleEditVariable).toHaveBeenCalledWith(0, 'New Name');
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('calls handleEditVariable and onBlur when input loses focus', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'New Name' } });
    fireEvent.blur(inputElement);
    
    expect(defaultProps.handleEditVariable).toHaveBeenCalledWith(0, 'New Name');
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('trims whitespace from input value before submitting', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: '  Trimmed Name  ' } });
    fireEvent.blur(inputElement);
    
    expect(defaultProps.handleEditVariable).toHaveBeenCalledWith(0, 'Trimmed Name');
  });

  it('validates against duplicate names', () => {
    const props = {
      ...defaultProps,
      existingNames: ['Duplicate Name', 'Another Name']
    };
    
    render(<NameLabelInput {...props} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'Duplicate Name' } });
    
    // Check for error class
    expect(inputElement).toHaveClass('invalid');
    
    // Try to submit with duplicate name
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Should not call handleEditVariable with invalid name
    expect(defaultProps.handleEditVariable).not.toHaveBeenCalled();
  });

  it('allows submission with unique name', () => {
    const props = {
      ...defaultProps,
      existingNames: ['Existing Name', 'Another Name']
    };
    
    render(<NameLabelInput {...props} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'Unique Name' } });
    
    // Check that no error class is present
    expect(inputElement).not.toHaveClass('invalid');
    
    // Try to submit with unique name
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Should call handleEditVariable with valid name
    expect(defaultProps.handleEditVariable).toHaveBeenCalledWith(0, 'Unique Name');
  });

  it('shows error tooltip for duplicate names', () => {
    const props = {
      ...defaultProps,
      existingNames: ['Duplicate Name']
    };
    
    render(<NameLabelInput {...props} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'Duplicate Name' } });
    
    // Check for tooltip or error message
    const errorTooltip = screen.getByText(/name already exists/i);
    expect(errorTooltip).toBeInTheDocument();
  });

  it('cancels editing when Escape key is pressed', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'Changed Name' } });
    fireEvent.keyDown(inputElement, { key: 'Escape' });
    
    // Should call onBlur without calling handleEditVariable
    expect(defaultProps.onBlur).toHaveBeenCalled();
    expect(defaultProps.handleEditVariable).not.toHaveBeenCalled();
  });

  // New tests to improve coverage

  it('validates empty input as invalid', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: '' } });
    
    // Check for error class
    expect(inputElement).toHaveClass('invalid');
    
    // Check for error message
    const errorTooltip = screen.getByText(/name cannot be empty/i);
    expect(errorTooltip).toBeInTheDocument();
    
    // Try to submit with empty name
    fireEvent.keyDown(inputElement, { key: 'Enter' });
    
    // Should not call handleEditVariable with invalid name
    expect(defaultProps.handleEditVariable).not.toHaveBeenCalled();
  });

  it('allows editing to the same name (no change)', () => {
    const props = {
      ...defaultProps,
      existingNames: ['Test Variable', 'Another Name']
    };
    
    render(<NameLabelInput {...props} />);
    
    const inputElement = screen.getByRole('textbox');
    // No change to the name, just blur to submit
    fireEvent.blur(inputElement);
    
    // Should call handleEditVariable with the same name
    expect(defaultProps.handleEditVariable).toHaveBeenCalledWith(0, 'Test Variable');
  });

  it('updates input width based on content', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    const inputElement = screen.getByRole('textbox');
    const hiddenSpan = screen.getByTestId('hidden-text-measure');
    
    // Mock the offsetWidth to simulate different text lengths
    Object.defineProperty(hiddenSpan, 'offsetWidth', {
      configurable: true,
      get: () => 200 // Simulate a longer text
    });
    
    // Change to a longer text
    fireEvent.change(inputElement, { target: { value: 'A Much Longer Variable Name' } });
    
    // The input width should be updated (200 + 16 = 216px)
    expect(inputElement.style.width).toBe('216px');
    
    // Now simulate a very short text
    Object.defineProperty(hiddenSpan, 'offsetWidth', {
      configurable: true,
      get: () => 30 // Simulate a shorter text
    });
    
    fireEvent.change(inputElement, { target: { value: 'Short' } });
    
    // The input width should be constrained to the minimum (60px)
    expect(inputElement.style.width).toBe('60px');
    
    // Now simulate a very long text
    Object.defineProperty(hiddenSpan, 'offsetWidth', {
      configurable: true,
      get: () => 500 // Simulate a very long text
    });
    
    fireEvent.change(inputElement, { target: { value: 'An Extremely Long Variable Name That Exceeds The Maximum Width' } });
    
    // The input width should be constrained to the maximum (300px)
    expect(inputElement.style.width).toBe('300px');
  });

  it('positions input correctly for Spinner view type', () => {
    const spinnerProps = {
      ...defaultProps,
      viewType: ViewType.Spinner
    };
    
    // Mock getElementById for the specific wedge label
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === `${spinnerProps.deviceId}-wedge-label-${spinnerProps.variableName}-${spinnerProps.variableIdx}`) {
        return {
          getBoundingClientRect: mockGetBoundingClientRect
        } as unknown as HTMLElement;
      }
      return null;
    });
    
    render(<NameLabelInput {...spinnerProps} />);
    
    const containerElement = screen.getByTestId('input-container');
    
    // Check positioning styles
    expect(containerElement.style.position).toBe('fixed');
    expect(containerElement.style.top).toBe('114px'); // y + 4 + (height / 2) = 100 + 4 + 10 = 114
    expect(containerElement.style.left).toBe('100px'); // x = 100
    expect(containerElement.style.zIndex).toBe('1000');
  });

  it('positions input correctly for Mixer view type', () => {
    // Mock getElementById for the specific ball label
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === `${defaultProps.deviceId}-ball-label-${defaultProps.variableName}-${defaultProps.variableIdx}`) {
        return {
          getBoundingClientRect: mockGetBoundingClientRect
        } as unknown as HTMLElement;
      }
      return null;
    });
    
    render(<NameLabelInput {...defaultProps} />);
    
    const containerElement = screen.getByTestId('input-container');
    
    // Check positioning styles
    expect(containerElement.style.position).toBe('fixed');
    expect(containerElement.style.top).toBe('114px'); // y + 4 + (height / 2) = 100 + 4 + 10 = 114
    expect(containerElement.style.left).toBe('100px'); // x = 100
    expect(containerElement.style.zIndex).toBe('1000');
  });

  it('focuses and selects input text on mount', () => {
    render(<NameLabelInput {...defaultProps} />);
    
    // Check that focus and select were called
    expect(HTMLInputElement.prototype.select).toHaveBeenCalled();
  });
}); 
