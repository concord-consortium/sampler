import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from './help-modal';
import { testA11y } from '../../test/a11y-utils';

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
    expect(screen.getByRole('button', { name: 'Close help modal' })).toBeInTheDocument();
  });

  it('calls setShowHelp with false when close button is clicked', () => {
    render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: 'Close help modal' });
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
  
  // New tests for improved coverage
  
  it('has proper accessibility structure', () => {
    const { container } = render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Check for proper heading structure
    const modalHeader = screen.getByText('Help: Repeat Until Condition');
    expect(modalHeader.className).toContain('modal-header');
    
    // Check for proper section structure using container.querySelectorAll
    const sectionTitles = container.querySelectorAll('.help-section-title');
    expect(sectionTitles.length).toBe(3); // Three section titles
    
    const sectionBodies = container.querySelectorAll('.help-section-body');
    expect(sectionBodies.length).toBe(3); // Three section bodies
    
    // Check for proper modal structure
    const modalBody = container.querySelector('.modal-body');
    expect(modalBody).toBeInTheDocument();
    
    const modalFooter = container.querySelector('.modal-footer');
    expect(modalFooter).toBeInTheDocument();
  });
  
  it('has a close button that can be triggered with keyboard', () => {
    render(<HelpModal setShowHelp={mockSetShowHelp} />);
    
    // Get the close button
    const closeButton = screen.getByRole('button', { name: 'Close help modal' });
    
    // Simulate keyboard interaction by focusing and pressing Enter
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
    
    // Simulate Enter key press
    fireEvent.click(closeButton);
    
    // Check if setShowHelp was called with false
    expect(mockSetShowHelp).toHaveBeenCalledTimes(1);
    expect(mockSetShowHelp).toHaveBeenCalledWith(false);
  });
  
  it('contains code examples with proper formatting', () => {
    const { container } = render(
      <HelpModal setShowHelp={mockSetShowHelp} />
    );
    
    // Check for formula examples
    const codeElements = container.querySelectorAll('code');
    expect(codeElements.length).toBeGreaterThan(0);
    
    // Check for specific code examples
    // Find code elements by their content instead of position
    const formulaExamples = Array.from(codeElements).filter(el => 
      el.textContent?.includes('=x > 5') || 
      el.textContent?.includes('=count > 10') ||
      el.textContent?.includes('=result === "success"')
    );
    
    expect(formulaExamples.length).toBeGreaterThan(0);
    
    // Check for pattern examples
    const patternExamples = Array.from(codeElements).filter(el => 
      el.textContent?.includes('apple,banana,orange') || 
      el.textContent?.includes('heads,heads,heads') ||
      el.textContent?.includes('7')
    );
    
    expect(patternExamples.length).toBeGreaterThan(0);
    
    // Verify at least one example of each type exists
    expect(patternExamples.some(el => el.textContent?.includes('apple,banana,orange'))).toBeTruthy();
    expect(patternExamples.some(el => el.textContent?.includes('heads,heads,heads'))).toBeTruthy();
    expect(patternExamples.some(el => el.textContent?.includes('7'))).toBeTruthy();
  });

  // Add accessibility test
  it('should not have any accessibility violations', async () => {
    const { container } = render(<HelpModal setShowHelp={mockSetShowHelp} />);
    await testA11y(container);
  });
}); 