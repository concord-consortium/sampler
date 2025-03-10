# Sampler Testing Guide

This document provides guidance on testing practices for the Sampler application, including how to implement the test coverage plan outlined in `Test_TODO.md`.

## Testing Philosophy

The Sampler application follows a comprehensive testing approach that includes:

1. **Unit Tests**: Testing individual components and functions in isolation
2. **Integration Tests**: Testing interactions between components
3. **End-to-End Tests**: Testing complete user flows

Our goal is to achieve 100% test coverage for critical paths and ensure all user-facing features have comprehensive tests.

## Testing Tools

- **Jest**: For unit and integration tests
- **React Testing Library**: For component tests
- **Cypress**: For end-to-end tests

## Test Organization

Tests should be organized alongside the components they test:

```
src/
  components/
    MyComponent.tsx
    MyComponent.test.tsx
  hooks/
    useMyHook.tsx
    useMyHook.test.tsx
```

For Cypress tests:

```
cypress/
  e2e/
    feature-name.test.ts
```

## Writing Effective Tests

### Unit Tests

Unit tests should focus on testing a single unit of code in isolation. For React components, this means testing the component's rendering and behavior without considering its interactions with other components.

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Integration tests should focus on testing the interactions between components. This includes testing data flow, state management, and API interactions.

Example:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import MyComponent from './MyComponent';

describe('MyComponent integration', () => {
  it('interacts with the global state', async () => {
    render(
      <AppProvider>
        <MyComponent />
      </AppProvider>
    );
    
    fireEvent.click(screen.getByText('Update State'));
    
    await waitFor(() => {
      expect(screen.getByText('State Updated')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Tests

End-to-end tests should focus on testing complete user flows. This includes testing the application from the user's perspective, including UI interactions and data persistence.

Example:

```typescript
describe('User Flow', () => {
  it('completes a full simulation', () => {
    cy.visit('/');
    cy.get('button').contains('Start').click();
    cy.get('button').contains('Stop').should('not.exist', { timeout: 10000 });
    cy.get('.results').should('be.visible');
  });
});
```

## Mocking

When testing components that interact with external services or APIs, you should use mocks to isolate the component being tested.

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { codapInterface } from '@concord-consortium/codap-plugin-api';
import MyComponent from './MyComponent';

// Mock the codapInterface
jest.mock('@concord-consortium/codap-plugin-api', () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

describe('MyComponent', () => {
  it('interacts with CODAP', async () => {
    // Set up the mock response
    (codapInterface.sendRequest as jest.Mock).mockResolvedValue({
      success: true,
      values: { id: 'dataContext1' }
    });
    
    render(<MyComponent />);
    
    // Verify the component renders correctly
    expect(screen.getByText('CODAP Component')).toBeInTheDocument();
    
    // Verify the component interacts with CODAP
    expect(codapInterface.sendRequest).toHaveBeenCalledWith({
      action: 'get',
      resource: 'dataContext[Sampler]'
    });
  });
});
```

## Test Coverage

We use Jest's coverage reports to track test coverage. You can run the coverage report with:

```bash
npm run test:coverage
```

The coverage report will show you which files and lines are not covered by tests. Focus on improving coverage for files with low coverage first.

## Test-Driven Development (TDD)

When implementing new features or fixing bugs, follow the TDD approach:

1. Write a failing test that describes the expected behavior
2. Implement the minimum code needed to make the test pass
3. Refactor the code while keeping the tests passing

## Implementing the Test Coverage Plan

To implement the test coverage plan outlined in `Test_TODO.md`:

1. Start with Phase 1, focusing on components with less than 30% coverage
2. For each component, write tests for all public methods and user interactions
3. Use the example test files in the `design` directory as a reference
4. Update the progress in `Test_TODO.md` as you complete each phase

## Best Practices

1. **Keep tests simple and focused**: Each test should test one thing
2. **Use descriptive test names**: Test names should describe what the test is testing
3. **Avoid test duplication**: Don't repeat the same test logic in multiple tests
4. **Test edge cases**: Test boundary conditions and error handling
5. **Maintain test independence**: Tests should not depend on each other
6. **Clean up after tests**: Reset state and mocks between tests

## Continuous Integration

All tests should pass in the CI environment before merging code. Make sure to run the tests locally before pushing changes:

```bash
npm run test
npm run test:cypress
```

## Troubleshooting

If you encounter issues with tests:

1. Check that you're properly mocking external dependencies
2. Verify that your component is rendering correctly
3. Use `console.log` or `debug()` to inspect the component state
4. Check for asynchronous operations that might need `waitFor` or `act`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Testing React Applications](https://reactjs.org/docs/testing.html) 