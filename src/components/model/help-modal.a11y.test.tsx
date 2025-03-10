import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HelpModal } from './help-modal';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('HelpModal Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const setShowHelp = jest.fn();
    const { container } = render(
      <HelpModal setShowHelp={setShowHelp} />
    );

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 