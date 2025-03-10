import React from 'react';
import { render, screen } from '@testing-library/react';
import { Column } from './column';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { getSourceDevices } from '../../models/model-model';
import { IColumn, IDevice, IModel, ViewType } from '../../types';

// Mock dependencies
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

jest.mock('../../models/model-model', () => ({
  getSourceDevices: jest.fn()
}));

// Mock child components with proper type annotations
jest.mock('./device', () => ({
  Device: ({ device, columnIndex }: { device: IDevice; columnIndex: number }) => (
    <div data-testid={`device-${device.id}`}>
      Device: {device.id}, Column: {columnIndex}
    </div>
  )
}));

jest.mock('./arrow', () => ({
  Arrow: ({ source, target, columnIndex }: { source: IDevice; target: IDevice; columnIndex: number }) => (
    <div data-testid={`arrow-${source.id}-${target.id}`}>
      Arrow from {source.id} to {target.id}, Column: {columnIndex}
    </div>
  )
}));

jest.mock('./column-header', () => ({
  ColumnHeader: ({ column, columnIndex }: { column: IColumn; columnIndex: number }) => (
    <div data-testid={`column-header-${column.id}`}>
      Column Header: {column.id}, Index: {columnIndex}
    </div>
  )
}));

describe('Column Component', () => {
  // Mock data
  const mockDevice1: IDevice = {
    id: 'device1',
    viewType: ViewType.Mixer,
    variables: ['var1', 'var2'],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ''
  };

  const mockDevice2: IDevice = {
    id: 'device2',
    viewType: ViewType.Mixer,
    variables: ['var3', 'var4'],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ''
  };

  const mockColumn: IColumn = {
    id: 'column1',
    devices: [mockDevice1, mockDevice2],
    name: 'Test Column'
  };

  const mockModel: IModel = {
    columns: [mockColumn]
  };

  const mockGlobalState = {
    globalState: {
      model: mockModel
    }
  };

  const mockSourceDevices: IDevice[] = [{
    id: 'sourceDevice1',
    viewType: ViewType.Mixer,
    variables: ['var5', 'var6'],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ''
  }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useGlobalStateContext as jest.Mock).mockReturnValue(mockGlobalState);
    (getSourceDevices as jest.Mock).mockReturnValue(mockSourceDevices);
  });

  it('renders the column with devices and arrows', () => {
    render(<Column column={mockColumn} columnIndex={1} />);
    
    // Check if column header is rendered for the first device
    expect(screen.getByTestId('column-header-column1')).toBeInTheDocument();
    
    // Check if devices are rendered
    expect(screen.getByTestId('device-device1')).toBeInTheDocument();
    expect(screen.getByTestId('device-device2')).toBeInTheDocument();
    
    // Check if arrows are rendered
    expect(screen.getByTestId('arrow-sourceDevice1-device1')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-sourceDevice1-device2')).toBeInTheDocument();
  });

  it('applies centered class when column has multiple devices', () => {
    const { container } = render(<Column column={mockColumn} columnIndex={1} />);
    
    // Check if the centered class is applied
    const columnDiv = container.firstChild as HTMLElement;
    expect(columnDiv).toHaveClass('device-column');
    expect(columnDiv).toHaveClass('centered');
  });

  it('does not apply centered class when column has only one device', () => {
    // Create a column with only one device
    const singleDeviceColumn: IColumn = {
      id: 'column2',
      devices: [mockDevice1],
      name: 'Single Device Column'
    };
    
    // Update the model to not find a branch
    const updatedModel = {
      ...mockModel,
      columns: [singleDeviceColumn]
    };
    
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        model: updatedModel
      }
    });
    
    const { container } = render(<Column column={singleDeviceColumn} columnIndex={1} />);
    
    // Check if the centered class is not applied
    const columnDiv = container.firstChild as HTMLElement;
    expect(columnDiv).toHaveClass('device-column');
    expect(columnDiv).not.toHaveClass('centered');
  });

  it('only renders column header for the first device in column', () => {
    render(<Column column={mockColumn} columnIndex={1} />);
    
    // There should be only one column header
    const headers = screen.getAllByTestId(/column-header/);
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent('Column Header: column1');
  });
}); 