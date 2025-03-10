import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RepeatUntil, ConditionHelpModal } from './repeat-until';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { createMockGlobalState } from '../../test-utils/mock-global-state';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('RepeatUntil Accessibility', () => {
  it('should not have any accessibility violations when repeat is enabled', async () => {
    // Create a mock global state with repeat enabled
    const mockGlobalState = createMockGlobalState();
    mockGlobalState.repeat = true;
    mockGlobalState.repeatUntilCondition = '=count(output=\'a\') > 3';
    
    const { container } = render(
      <GlobalStateContext.Provider value={{
        globalState: mockGlobalState,
        setGlobalState: jest.fn()
      }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not render when repeat is disabled', async () => {
    // Create a mock global state with repeat disabled
    const mockGlobalState = createMockGlobalState();
    mockGlobalState.repeat = false;
    
    const { container } = render(
      <GlobalStateContext.Provider value={{
        globalState: mockGlobalState,
        setGlobalState: jest.fn()
      }}>
        <RepeatUntil />
      </GlobalStateContext.Provider>
    );

    // Verify that the component is not rendered
    expect(container.firstChild).toBeNull();

    // Run axe accessibility tests (should pass as nothing is rendered)
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('ConditionHelpModal Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const handleClose = jest.fn();
    
    const { container } = render(
      <ConditionHelpModal onClose={handleClose} />
    );

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading structure', async () => {
    const handleClose = jest.fn();
    
    render(
      <ConditionHelpModal onClose={handleClose} />
    );

    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('Condition Syntax Help');
    
    const subHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(subHeadings).toHaveLength(2);
    expect(subHeadings[0]).toHaveTextContent('Formula Conditions');
    expect(subHeadings[1]).toHaveTextContent('Pattern Matching');
  });

  it('should have a close button that is keyboard accessible', async () => {
    const handleClose = jest.fn();
    
    render(
      <ConditionHelpModal onClose={handleClose} />
    );

    // Check for close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    
    // Ensure the button is keyboard accessible
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
  });
}); 