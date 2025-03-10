import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceFooter } from './device-footer';
import { ViewType, IDevice, IVariables, IDataContext } from '../../types';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { createDefaultDevice } from '../../models/device-model';
import { getProportionalVars } from '../helpers';

// Mock the dependencies
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

jest.mock('../../models/model-model', () => ({
  getNumDevices: jest.fn(() => 1),
  getSiblingDevices: jest.fn(() => []),
  getTargetDevices: jest.fn(() => [])
}));

jest.mock('../helpers', () => ({
  getNewColumnName: jest.fn(() => 'output1'),
  getNewVariable: jest.fn(() => 'newVar'),
  getProportionalVars: jest.fn(() => ['prop1', 'prop2'])
}));

jest.mock('@concord-consortium/codap-plugin-api', () => ({
  createNewAttribute: jest.fn()
}));

jest.mock('../../utils/id', () => ({
  createId: jest.fn(() => 'new-id-123')
}));

describe('DeviceFooter', () => {
  // Setup mock global state
  const mockSetGlobalState = jest.fn();
  const mockGlobalState = {
    model: {
      columns: [
        {
          name: 'input',
          id: 'col1',
          devices: [createDefaultDevice()]
        },
        {
          name: 'output',
          id: 'col2',
          devices: [createDefaultDevice()]
        }
      ]
    },
    isRunning: false,
    collectorContext: null,
    attrMap: {},
    samplerContext: null
  };
  
  // Setup mock props
  const mockDevice: IDevice = {
    ...createDefaultDevice(),
    id: 'device1',
    viewType: ViewType.Mixer,
    variables: ['var1', 'var2'],
    formulas: {}
  };
  
  const mockProps = {
    device: mockDevice,
    columnIndex: 0,
    dataContexts: [],
    handleUpdateVariables: jest.fn(),
    handleDeleteVariable: jest.fn(),
    handleSpecifyVariables: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: mockGlobalState,
      setGlobalState: mockSetGlobalState
    });
  });
  
  it('renders correctly with Mixer view type', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Check for variable buttons
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    
    // Check for device type buttons
    expect(screen.getByText('Mixer')).toBeInTheDocument();
    expect(screen.getByText('Spinner')).toBeInTheDocument();
    expect(screen.getByText('Collector')).toBeInTheDocument();
    
    // Check for Add Device button
    expect(screen.getByText('Add Device')).toBeInTheDocument();
  });
  
  it('handles adding a variable for Mixer view type', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Click the add variable button
    fireEvent.click(screen.getByText('+'));
    
    // Check if handleUpdateVariables was called with the new variable
    expect(mockProps.handleUpdateVariables).toHaveBeenCalledWith([...mockDevice.variables, 'newVar']);
  });
  
  it('handles adding a variable for Spinner view type', () => {
    const spinnerProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Spinner
      }
    };
    
    render(<DeviceFooter {...spinnerProps} />);
    
    // Click the add variable button
    fireEvent.click(screen.getByText('+'));
    
    // Check if handleUpdateVariables was called with proportional variables
    expect(getProportionalVars).toHaveBeenCalledWith(mockDevice.variables);
    expect(mockProps.handleUpdateVariables).toHaveBeenCalledWith(['prop1', 'prop2']);
  });
  
  it('handles deleting a variable', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Click the delete variable button
    fireEvent.click(screen.getByText('-'));
    
    // Check if handleDeleteVariable was called
    expect(mockProps.handleDeleteVariable).toHaveBeenCalled();
  });
  
  it('handles specifying variables', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Click the specify variables button
    fireEvent.click(screen.getByText('...'));
    
    // Check if handleSpecifyVariables was called
    expect(mockProps.handleSpecifyVariables).toHaveBeenCalled();
  });
  
  it('handles updating view type to Spinner', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Click the Spinner button
    fireEvent.click(screen.getByText('Spinner'));
    
    // Check if setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    const draftState = {
      model: {
        columns: [
          {
            devices: [mockDevice]
          }
        ]
      }
    };
    
    // Call the callback with a draft state
    callback(draftState);
    
    // Check if the device view type was updated
    expect(draftState.model.columns[0].devices[0].viewType).toBe(ViewType.Spinner);
  });
  
  it('handles updating view type to Collector', () => {
    render(<DeviceFooter {...mockProps} />);
    
    // Click the Collector button
    fireEvent.click(screen.getByText('Collector'));
    
    // Check if setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    const draftState = {
      model: {
        columns: [
          {
            devices: [mockDevice]
          }
        ]
      }
    };
    
    // Call the callback with a draft state
    callback(draftState);
    
    // Check if the device view type was updated
    expect(draftState.model.columns[0].devices[0].viewType).toBe(ViewType.Collector);
  });
  
  it('handles adding a device', () => {
    // Ensure we're using Mixer view type
    const mixerProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Mixer
      }
    };
    
    render(<DeviceFooter {...mixerProps} />);
    
    // Click the Add Device button
    fireEvent.click(screen.getByText('Add Device'));
    
    // Check if setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    const draftState = {
      model: {
        columns: [
          {
            devices: [mockDevice]
          },
          {
            devices: []
          }
        ]
      },
      attrMap: {},
      samplerContext: null
    };
    
    // Call the callback with a draft state
    callback(draftState);
    
    // Check if a new device was added to the next column
    expect(draftState.model.columns[1].devices.length).toBe(1);
  });
  
  it('handles adding a device when next column does not exist', () => {
    // Ensure we're using Mixer view type
    const mixerProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Mixer
      }
    };
    
    render(<DeviceFooter {...mixerProps} />);
    
    // Click the Add Device button
    fireEvent.click(screen.getByText('Add Device'));
    
    // Check if setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    const draftState = {
      model: {
        columns: [
          {
            devices: [mockDevice]
          }
        ]
      },
      attrMap: {},
      samplerContext: null
    };
    
    // Call the callback with a draft state
    callback(draftState);
    
    // Check if a new column was created with a device
    expect(draftState.model.columns.length).toBe(2);
    expect(draftState.model.columns[1].devices.length).toBe(1);
  });
  
  it('handles merging devices', () => {
    // Mock sibling devices
    const modelModelMock = require('../../models/model-model');
    modelModelMock.getSiblingDevices.mockReturnValueOnce([createDefaultDevice()]);
    
    // Mock global state with multiple devices in the column
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        ...mockGlobalState,
        model: {
          columns: [
            {
              name: 'input',
              id: 'col1',
              devices: [mockDevice, createDefaultDevice(), createDefaultDevice()]
            }
          ]
        }
      },
      setGlobalState: mockSetGlobalState
    });
    
    // Ensure we're using Mixer view type
    const mixerProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Mixer
      },
      columnIndex: 0
    };
    
    render(<DeviceFooter {...mixerProps} />);
    
    // Check if Merge button is rendered
    expect(screen.getByText('Merge')).toBeInTheDocument();
    
    // Click the Merge button
    fireEvent.click(screen.getByText('Merge'));
    
    // Check if setGlobalState was called
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    
    // Create a draft state that matches what the component expects
    const draftState = {
      model: {
        columns: [
          {
            devices: [createDefaultDevice(), createDefaultDevice(), createDefaultDevice()]
          }
        ]
      }
    };
    
    // Call the callback with a draft state
    callback(draftState);
    
    // Check if devices were merged (only one device remains)
    expect(draftState.model.columns[0].devices.length).toBe(1);
  });
  
  it('renders correctly with Collector view type', () => {
    const collectorProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Collector
      },
      dataContexts: [
        { guid: 1, id: 1, name: 'Dataset1', title: 'My Dataset' }
      ]
    };
    
    // Mock collector context
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        ...mockGlobalState,
        collectorContext: { name: 'Dataset1' }
      },
      setGlobalState: mockSetGlobalState
    });
    
    render(<DeviceFooter {...collectorProps} />);
    
    // Check for collector-specific elements
    expect(screen.getByText('Available Datasets:')).toBeInTheDocument();
    expect(screen.getByText('My Dataset')).toBeInTheDocument();
    
    // Variable buttons should not be rendered
    expect(screen.queryByText('+')).not.toBeInTheDocument();
    expect(screen.queryByText('-')).not.toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
  
  it('renders correctly when no datasets are available for Collector', () => {
    const collectorProps = {
      ...mockProps,
      device: {
        ...mockDevice,
        viewType: ViewType.Collector
      },
      dataContexts: []
    };
    
    render(<DeviceFooter {...collectorProps} />);
    
    // Check for no datasets message
    expect(screen.getByText('No datasets available')).toBeInTheDocument();
  });
}); 