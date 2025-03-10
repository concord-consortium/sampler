import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from './help-modal';

describe('HelpModal Component', () => {
  const mockSetShowHelp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the help modal with correct title and content', () => {
    render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Check if the title is rendered
    expect(screen.getByText('Help: Repeat Until Condition')).toBeInTheDocument();
    
    // Check if section titles are rendered
    expect(screen.getByText('Specify a Condition to Repeat Until')).toBeInTheDocument();
    expect(screen.getByText('Using a Formula')).toBeInTheDocument();
    expect(screen.getByText('Using a Pattern')).toBeInTheDocument();
    
    // Check if examples are rendered
    expect(screen.getByText(/=x > 5/)).toBeInTheDocument();
    expect(screen.getByText(/=count > 10/)).toBeInTheDocument();
    expect(screen.getByText(/=result === "success"/)).toBeInTheDocument();
    expect(screen.getByText(/apple,banana,orange/)).toBeInTheDocument();
    expect(screen.getByText(/heads,heads,heads/)).toBeInTheDocument();
    
    // Check if close button is rendered
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls setShowHelp with false when close button is clicked', () => {
    render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    // Check if setShowHelp was called with false
    expect(mockSetShowHelp).toHaveBeenCalledTimes(1);
    expect(mockSetShowHelp).toHaveBeenCalledWith(false);
  });

  it('displays explanations for both formula and pattern approaches', () => {
    render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Check for formula explanation
    expect(screen.getByText(/Formulas start with an equals sign/)).toBeInTheDocument();
    
    // Check for pattern explanation
    expect(screen.getByText(/Patterns are comma-separated values/)).toBeInTheDocument();
  });
}); 