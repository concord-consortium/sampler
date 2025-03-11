import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Device } from './device';
import { GlobalStateContext } from '../../hooks/useGlobalState';
import { createMockGlobalState } from '../../test-utils/mock-global-state';
import { ViewType } from '../../types';
import { getFocusableElements, simulateTabNavigation } from '../../test/a11y-test-helpers';

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
              variables: ['a', 'b', 'c'],
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

  it('should have proper ARIA attributes for device container', () => {
    // Create a mock global state
    const mockGlobalState = createMockGlobalState();
    mockGlobalState.selectedDeviceId = 'device1';
    
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
              variables: ['a', 'b', 'c'],
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

    // Get the device container
    const deviceContainer = container.querySelector('[data-device-id="device1"]');
    expect(deviceContainer).not.toBeNull();
    
    // Check for proper ARIA attributes
    expect(deviceContainer).toHaveAttribute('role', 'region');
    expect(deviceContainer).toHaveAttribute('aria-labelledby', 'device-title-device1');
    expect(deviceContainer).toHaveAttribute('aria-describedby', 'device-description-device1');
    
    // Check that the description element exists
    const descriptionElement = container.querySelector('#device-description-device1');
    expect(descriptionElement).not.toBeNull();
    expect(descriptionElement).toHaveTextContent('Mixer device with 3 variables: a, b, c');
    
    // Check that the title element exists
    const titleElement = container.querySelector('#device-title-device1');
    expect(titleElement).not.toBeNull();
    expect(titleElement).toHaveAttribute('aria-label', 'Select Mixer device');
    expect(titleElement).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have proper keyboard navigation', () => {
    // Create a mock global state
    const mockGlobalState = createMockGlobalState();
    mockGlobalState.selectedDeviceId = 'device1';
    
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
              variables: ['a', 'b', 'c'],
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
          columnIndex={1} // Set to 1 to show delete button
        />
      </GlobalStateContext.Provider>
    );

    // Get all focusable elements
    const focusableElements = getFocusableElements(container);
    
    // Check that we have at least the device container and delete button
    expect(focusableElements.length).toBeGreaterThanOrEqual(2);
    
    // Check that the first focusable element is the device container
    expect(focusableElements[0]).toHaveAttribute('aria-label', 'Select Mixer device');
    
    // Check that the delete button is focusable and has proper attributes
    const deleteButton = container.querySelector('[data-testid="delete-device-button"]');
    expect(deleteButton).not.toBeNull();
    expect(deleteButton).toHaveAttribute('role', 'button');
    expect(deleteButton).toHaveAttribute('tabIndex', '0');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete Mixer device');
  });

  it('should have proper ARIA attributes for DeviceFooter and modals', () => {
    // Create a mock global state
    const mockGlobalState = createMockGlobalState();
    mockGlobalState.selectedDeviceId = 'device1';
    
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
              variables: ['a', 'b', 'c'],
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

    // Check that the DeviceFooter has proper ARIA attributes
    const deviceFooter = container.querySelector('.device-footer');
    expect(deviceFooter).not.toBeNull();
    expect(deviceFooter).toHaveAttribute('aria-labelledby', 'device-title-device1');
  });
}); 