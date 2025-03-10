import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { render, RenderResult } from '@testing-library/react';

// Configure axe for your specific needs
const axeConfig = {
  rules: {
    // You can customize rules here
    // Example: disable a specific rule
    // 'color-contrast': { enabled: false }
  },
};

/**
 * Renders a component and returns both the render result and a function to test for accessibility
 * @param ui The React component to render
 * @param options Optional render options
 * @returns Object containing render result and a function to test for accessibility
 */
export function renderWithA11y(
  ui: React.ReactElement,
  options = {}
): RenderResult & { testA11y: () => Promise<void> } {
  const renderResult = render(ui, options);
  
  return {
    ...renderResult,
    testA11y: async () => {
      const results = await axe(renderResult.container, axeConfig);
      expect(results).toHaveNoViolations();
    },
  };
}

/**
 * Tests a rendered component for accessibility violations
 * @param container The HTML container to test
 * @returns Promise that resolves when the test is complete
 */
export async function testA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container, axeConfig);
  expect(results).toHaveNoViolations();
} 