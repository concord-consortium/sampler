import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetVariableSeriesModal } from './variable-setting-modal';

describe('SetVariableSeriesModal', () => {
  const mockSetShowVariableEditor = jest.fn();
  const mockHandleUpdateVariablesToSeries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct elements', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    // Check header
    expect(screen.getByText('Set Variables')).toBeInTheDocument();
    
    // Check instructions text
    expect(screen.getByText(/Enter comma-separated variable names/)).toBeInTheDocument();
    
    // Check input field
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('calls setShowVariableEditor(false) when Cancel button is clicked', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockSetShowVariableEditor).toHaveBeenCalledWith(false);
    expect(mockHandleUpdateVariablesToSeries).not.toHaveBeenCalled();
  });

  it('calls handleUpdateVariablesToSeries and setShowVariableEditor when OK button is clicked', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1-10' } });
    
    fireEvent.click(screen.getByText('Apply'));
    
    expect(mockHandleUpdateVariablesToSeries).toHaveBeenCalledWith('1-10');
    expect(mockSetShowVariableEditor).toHaveBeenCalledWith(false);
  });

  it('updates the input value when user types', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'a, b, c' } });
    
    expect(input).toHaveValue('a, b, c');
  });

  it('submits the form when Enter key is pressed in the input field', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'A-Z' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockHandleUpdateVariablesToSeries).toHaveBeenCalledWith('A-Z');
    expect(mockSetShowVariableEditor).toHaveBeenCalledWith(false);
  });

  it('does not submit when a key other than Enter is pressed', () => {
    render(
      <SetVariableSeriesModal 
        setShowVariableEditor={mockSetShowVariableEditor}
        handleUpdateVariablesToSeries={mockHandleUpdateVariablesToSeries}
      />
    );

    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'A-Z' } });
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
    
    expect(mockHandleUpdateVariablesToSeries).not.toHaveBeenCalled();
    expect(mockSetShowVariableEditor).not.toHaveBeenCalled();
  });
}); 