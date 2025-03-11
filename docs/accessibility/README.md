# Accessibility Testing Framework

This document outlines the accessibility testing framework for our application, focusing on WCAG 2.1 compliance. Last updated: March 11, 2025.

## Overview

Our accessibility testing framework is designed to ensure that our application meets WCAG 2.1 AA standards. It includes:

1. **Automated Testing**: Using Jest and Testing Library for component-level testing
2. **Manual Testing**: Guidelines for manual verification of accessibility features
3. **Continuous Integration**: Integration with our CI/CD pipeline to catch accessibility issues early

## Current Status

For a detailed overview of our current accessibility implementation status, please see the [Progress Summary](./progress-summary.md) document.

We have successfully implemented several key WCAG 2.1 success criteria, including:
- Meaningful Sequence (WCAG 1.3.2)
- Time-based Media (WCAG 1.2)
- Seizures and Physical Reactions (WCAG 2.3)

Our current focus is on:
- Focus Management (WCAG 2.4.3 and 2.4.7)
- Error Identification (WCAG 3.3.1)

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

The `focus-order.test.tsx` file tests compliance with WCAG 2.4.3 (Focus Order), ensuring that the focus order preserves meaning and operability:

- Tests for logical focus order
- Tests for focus management in modals
- Tests for focus restoration after dynamic content changes

### Focus Visible (WCAG 2.4.7)

The `focus-visible.test.tsx` file tests compliance with WCAG 2.4.7 (Focus Visible), ensuring that keyboard focus indicators are visible:

- Tests for visible focus indicators on all interactive elements
- Tests for sufficient contrast of focus indicators
- Tests for minimum size requirements of focus indicators

### Resize Text (WCAG 1.4.4)

The `resize-text.test.tsx` file tests compliance with WCAG 1.4.4 (Resize Text), ensuring that text can be resized up to 200% without loss of content or functionality:

- Tests for text resizing
- Tests for layout integrity at larger text sizes
- Tests for text overflow and truncation behavior

### Error Identification (WCAG 3.3.1)

The `error-identification.test.tsx` file tests compliance with WCAG 3.3.1 (Error Identification), ensuring that errors are identified and described to the user:

- Tests for error message accessibility
- Tests for error state styling and contrast
- Tests for screen reader announcement of errors

### Animation Control (WCAG 2.2.2)

The `animation-control.test.tsx` file tests compliance with WCAG 2.2.2 (Pause, Stop, Hide), ensuring that users can control moving content:

- Tests for pause, stop, and hide controls
- Tests for keyboard accessibility of controls
- Tests for screen reader announcement of controls

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

## Implementation Plan

See the [Implementation Plan](../accessibility-implementation-plan.md) document for our approach to implementing comprehensive accessibility features.

## Progress Summary

See the [Progress Summary](./progress-summary.md) document for an overview of our current accessibility implementation status and future work.

## Pull Requests

When submitting accessibility improvements, please reference the [Pull Request Template](./pull-request.md) for guidance on documenting your changes.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [WAI-ARIA Practices](https://www.w3.org/TR/wai-aria-practices-1.1/) 