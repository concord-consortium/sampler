import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
}); 
