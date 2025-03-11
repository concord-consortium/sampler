# Accessibility Testing Framework

This document outlines the accessibility testing framework for our application, focusing on WCAG 2.1 compliance.

## Overview

Our accessibility testing framework is designed to ensure that our application meets WCAG 2.1 AA standards. It includes:

1. **Automated Testing**: Using Jest and Testing Library for component-level testing
2. **Manual Testing**: Guidelines for manual verification of accessibility features
3. **Continuous Integration**: Integration with our CI/CD pipeline to catch accessibility issues early

## Test Utilities

### a11y-test-helpers.ts

This file contains utility functions for testing accessibility:

- `getFocusableElements`: Retrieves all focusable elements within a container
- `simulateTabNavigation`: Simulates tabbing through focusable elements
- `getContrastRatio`: Calculates the contrast ratio between two colors
- `verifyReadingOrder`: Checks the logical reading order of elements
- `runAxeTests`: Runs accessibility tests using the axe-core library
- `hasFocusIndicator`: Checks if an element has a visible focus indicator

## Test Suites

### Meaningful Sequence (WCAG 1.3.2)

The `meaningful-sequence.test.tsx` file tests compliance with WCAG 1.3.2 (Meaningful Sequence), ensuring that content is presented in a logical order:

- Tests for proper reading order
- Tests for proper heading hierarchy
- Tests for dynamic content updates
- Tests for visual order matching DOM order

### Focus Order (WCAG 2.4.3)

*Coming soon*

### Focus Visible (WCAG 2.4.7)

*Coming soon*

### Resize Text (WCAG 1.4.4)

*Coming soon*

### Error Identification (WCAG 3.3.1)

*Coming soon*

## Running Tests

To run all accessibility tests:

```bash
npm run test:a11y
```

To run a specific test:

```bash
npm test src/test/meaningful-sequence.test.tsx
```

## Accessibility Audit

See the [WCAG Audit](./wcag-audit.md) document for a detailed analysis of our current WCAG compliance status and areas for improvement.

## Test Plan

See the [Test Plan](./test-plan.md) document for our approach to implementing comprehensive accessibility tests.

## Pull Requests

When submitting accessibility improvements, please reference the [Pull Request Template](./pull-request.md) for guidance on documenting your changes.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [WAI-ARIA Practices](https://www.w3.org/TR/wai-aria-practices-1.1/) 