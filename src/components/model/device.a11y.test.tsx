import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Device } from './device';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { createMockGlobalState } from '../../test-utils/mock-global-state';
import { ViewType } from '../../types';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Device Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    // Create a mock global state
    const mockGlobalState = createMockGlobalState();
    
    // Add a device to the mock state
    mockGlobalState.model = {
      ...mockGlobalState.model,
      columns: [
        {
          id: 'column1',
          name: 'Test Column',
          devices: [
            {
              id: 'device1',
              viewType: ViewType.Mixer,
              variables: [],
              collectorVariables: [],
              formulas: { 'x': '1' },
              hidden: false,
              lockPassword: ''
            }
          ]
        }
      ]
    };

    const { container } = render(
      <GlobalStateContext.Provider value={{
        globalState: mockGlobalState,
        setGlobalState: jest.fn()
      }}>
        <Device 
          device={mockGlobalState.model.columns[0].devices[0]}
          columnIndex={0}
        />
      </GlobalStateContext.Provider>
    );

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 