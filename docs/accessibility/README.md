# Accessibility Testing Framework

This directory contains documentation and test utilities for ensuring our application meets WCAG 2.1 AA accessibility standards. The framework provides tools and test patterns for verifying compliance with key accessibility criteria.

## Overview

The accessibility testing framework consists of:

1. **Test Utilities**: Reusable helper functions for testing accessibility features
2. **Test Suites**: Comprehensive tests for specific WCAG criteria
3. **Documentation**: Guidelines and audit information

## Test Utilities

### a11y-test-helpers.ts

Located at `src/test/a11y-test-helpers.ts`, this file provides helper functions for accessibility testing:

- `getFocusableElements`: Retrieves all focusable elements within a container
- `simulateTabNavigation`: Simulates tabbing through focusable elements
- `getContrastRatio`: Calculates contrast ratio between colors
- `verifyReadingOrder`: Checks logical reading order of elements
- `hasFocusIndicator`: Checks if an element has a visible focus indicator
- `runAxeTests`: Runs accessibility tests using axe-core

Example usage:

```typescript
import { getFocusableElements, getContrastRatio } from './a11y-test-helpers';

// Get all focusable elements in a container
const focusableElements = getFocusableElements(container);

// Check contrast ratio between text and background
const contrast = getContrastRatio('#000000', '#ffffff');
expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA requirement for normal text
```

### visual-test-helpers.ts

Located at `src/test/visual-test-helpers.ts`, this file provides utilities for visual accessibility testing:

- `simulateTextResize`: Simulates text resizing in the document
- `checkTextOverflow`: Checks if text is truncated or overflowing
- `doElementsOverlap`: Checks if elements overlap each other
- `isElementFullyVisible`: Checks if an element is fully visible
- `checkContainerExpansion`: Checks if containers expand with larger text
- `checkLayoutIntegrity`: Checks layout integrity at different text sizes

Example usage:

```typescript
import { simulateTextResize, checkTextOverflow } from './visual-test-helpers';

// Resize text to 200%
const cleanup = simulateTextResize('200%');

// Check if text is truncated
const result = checkTextOverflow(element);
expect(result.isTruncated).toBe(false);

// Clean up after test
cleanup();
```

## Test Suites

The framework includes test suites for five key WCAG criteria:

1. **Meaningful Sequence (WCAG 1.3.2)**: Tests for logical reading and navigation order
2. **Resize Text (WCAG 1.4.4)**: Tests for text resizing without loss of content
3. **Focus Order (WCAG 2.4.3)**: Tests for logical focus sequence
4. **Focus Visible (WCAG 2.4.7)**: Tests for visible focus indicators
5. **Error Identification (WCAG 3.3.1)**: Tests for proper error messages

Each test suite includes both positive tests (verifying proper implementation) and negative tests (detecting accessibility issues).

## Using the Framework

### Testing a Component

To test a component for accessibility:

1. Import the necessary test utilities
2. Write tests using Jest and React Testing Library
3. Use the provided helper functions to check for accessibility issues

Example:

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { getFocusableElements, hasFocusIndicator } from './a11y-test-helpers';
import { simulateTextResize } from './visual-test-helpers';
import MyComponent from '../components/MyComponent';

describe('MyComponent Accessibility', () => {
  test('should have visible focus indicators', () => {
    const { container } = render(<MyComponent />);
    
    // Get all interactive elements
    const interactiveElements = getFocusableElements(container);
    
    // Check each element for focus indicator
    interactiveElements.forEach(el => {
      // Focus the element
      fireEvent.focus(el);
      
      // Check if it has a visible focus indicator
      const focusIndicator = hasFocusIndicator(el);
      expect(focusIndicator.hasIndicator).toBe(true);
      
      // Blur the element
      fireEvent.blur(el);
    });
  });
  
  test('should handle text resizing', () => {
    const { container } = render(<MyComponent />);
    
    // Resize text to 200%
    const cleanup = simulateTextResize('200%');
    
    // Check if component still displays properly
    // ...
    
    // Clean up
    cleanup();
  });
});
```

### Running Accessibility Tests

To run all accessibility tests:

```bash
npm run test:a11y
```

This will run all five test suites and report the results.

You can also run individual test suites:

```bash
npm test -- src/test/focus-visible.test.tsx
```

## Documentation

- **wcag-audit.md**: Audit of WCAG compliance in the application
- **test-plan.md**: Plan for implementing accessibility tests
- **implementation-progress.md**: Progress tracking for test implementation

## Contributing

When adding new components or features:

1. Review the WCAG criteria in the audit document
2. Use the test utilities to verify accessibility compliance
3. Add specific accessibility tests for your component
4. Update documentation if necessary

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started) 