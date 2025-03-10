import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PctLabelInput } from './percent-label-input';

describe('PctLabelInput', () => {
  // Mock props
  const mockProps = {
    percent: '50',
    variableIdx: 0,
    variableName: 'testVar',
    deviceId: 'device1',
    handlePctChange: jest.fn(),
    onBlur: jest.fn()
  };

  // Mock getBoundingClientRect
  const mockGetBoundingClientRect = jest.fn().mockReturnValue({
    x: 100,
    y: 100,
    height: 20
  });

  // Mock getElementById
  const originalGetElementById = document.getElementById;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getElementById to return an element with getBoundingClientRect
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === `${mockProps.deviceId}-wedge-pct-${mockProps.variableName}`) {
        return {
          getBoundingClientRect: mockGetBoundingClientRect
        };
      }
      return null;
    });
  });

  afterEach(() => {
    // Restore original getElementById
    document.getElementById = originalGetElementById;
  });

  it('renders the input with the correct value', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Expect the input to be rendered with the correct value
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('calls handlePctChange and onBlur when Enter key is pressed', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value
    fireEvent.change(input, { target: { value: '75' } });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Expect handlePctChange to be called with the correct arguments
    expect(mockProps.handlePctChange).toHaveBeenCalledWith(0, '75');
    
    // Expect onBlur to be called
    expect(mockProps.onBlur).toHaveBeenCalled();
  });

  it('calls handlePctChange and onBlur when Tab key is pressed', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value
    fireEvent.change(input, { target: { value: '25' } });
    
    // Press Tab
    fireEvent.keyDown(input, { key: 'Tab' });
    
    // Expect handlePctChange to be called with the correct arguments
    expect(mockProps.handlePctChange).toHaveBeenCalledWith(0, '25');
    
    // Expect onBlur to be called
    expect(mockProps.onBlur).toHaveBeenCalled();
  });

  it('calls handlePctChange and onBlur when input loses focus', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value
    fireEvent.change(input, { target: { value: '60' } });
    
    // Blur the input
    fireEvent.blur(input);
    
    // Expect handlePctChange to be called with the correct arguments
    expect(mockProps.handlePctChange).toHaveBeenCalledWith(0, '60');
    
    // Expect onBlur to be called
    expect(mockProps.onBlur).toHaveBeenCalled();
  });

  it('updates the text state when input value changes', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value
    fireEvent.change(input, { target: { value: '80' } });
    
    // Expect the input value to be updated
    expect(input).toHaveValue('80');
  });

  it('positions the input correctly based on the text label', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Expect the input to have the correct style properties
    expect(input).toHaveStyle('position: fixed');
    expect(input).toHaveStyle('top: 114px'); // y + 4 + (height / 2) = 100 + 4 + (20 / 2) = 114
    expect(input).toHaveStyle('left: 100px'); // x = 100
    
    // Width should be calculated based on variableName length
    // For 'testVar' (7 characters), width should be 21vh (7 * 3 = 21)
    expect(input).toHaveStyle('width: 21vh');
  });

  it('calculates width correctly for short variable names', () => {
    const shortNameProps = {
      ...mockProps,
      variableName: 'a' // 1 character
    };
    
    // Update the mock getElementById to use the new variableName
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === `${shortNameProps.deviceId}-wedge-pct-${shortNameProps.variableName}`) {
        return {
          getBoundingClientRect: mockGetBoundingClientRect
        };
      }
      return null;
    });
    
    render(<PctLabelInput {...shortNameProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // For 'a' (1 character), width should be 10vh (minimum)
    expect(input).toHaveStyle('width: 10vh');
  });

  it('calculates width correctly for long variable names', () => {
    const longNameProps = {
      ...mockProps,
      variableName: 'veryLongVariableName' // 20 characters
    };
    
    // Update the mock getElementById to use the new variableName
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === `${longNameProps.deviceId}-wedge-pct-${longNameProps.variableName}`) {
        return {
          getBoundingClientRect: mockGetBoundingClientRect
        };
      }
      return null;
    });
    
    render(<PctLabelInput {...longNameProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // For 'veryLongVariableName' (20 characters), width should be 30vh (maximum)
    expect(input).toHaveStyle('width: 30vh');
  });

  // New tests to improve coverage

  it('focuses the input on mount', () => {
    // Save original focus method
    const originalFocus = HTMLInputElement.prototype.focus;
    
    // Mock focus method
    const mockFocus = jest.fn();
    HTMLInputElement.prototype.focus = mockFocus;

    try {
      render(<PctLabelInput {...mockProps} />);
      
      // Expect focus to be called
      expect(mockFocus).toHaveBeenCalled();
    } finally {
      // Restore original focus
      HTMLInputElement.prototype.focus = originalFocus;
    }
  });

  it('handles other key presses without triggering submit', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value
    fireEvent.change(input, { target: { value: '75' } });
    
    // Press a different key (e.g., 'A')
    fireEvent.keyDown(input, { key: 'A' });
    
    // Expect handlePctChange not to be called
    expect(mockProps.handlePctChange).not.toHaveBeenCalled();
    
    // Expect onBlur not to be called
    expect(mockProps.onBlur).not.toHaveBeenCalled();
  });

  it('handles non-numeric input values', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value to a non-numeric value
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Expect the input value to be updated (component doesn't validate input)
    expect(input).toHaveValue('abc');
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Expect handlePctChange to be called with the non-numeric value
    // (validation would happen in the parent component)
    expect(mockProps.handlePctChange).toHaveBeenCalledWith(0, 'abc');
  });

  it('handles empty input values', () => {
    render(<PctLabelInput {...mockProps} />);
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Change the input value to an empty string
    fireEvent.change(input, { target: { value: '' } });
    
    // Expect the input value to be updated
    expect(input).toHaveValue('');
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Expect handlePctChange to be called with the empty string
    expect(mockProps.handlePctChange).toHaveBeenCalledWith(0, '');
  });

  it('handles the case when getElementById returns null', () => {
    // Mock getElementById to return null
    document.getElementById = jest.fn().mockReturnValue(null);
    
    // Render should not throw an error
    expect(() => render(<PctLabelInput {...mockProps} />)).not.toThrow();
    
    // Get the input
    const input = screen.getByDisplayValue('50');
    
    // Input should still be rendered
    expect(input).toBeInTheDocument();
  });
}); 