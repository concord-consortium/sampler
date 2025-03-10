import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FormulaEditor } from './formula-editor';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { validateFormula } from '../../utils/utils';
import { trackFormula } from '../../utils/formula/FormulaVariableRenaming';
import { IDevice, ViewType } from '../../types';

// Mock the dependencies
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

jest.mock('../../utils/utils', () => ({
  validateFormula: jest.fn()
}));

jest.mock('../../utils/formula/FormulaVariableRenaming', () => ({
  trackFormula: jest.fn()
}));

describe('FormulaEditor', () => {
  // Setup mock devices
  const mockSourceDevice: IDevice = {
    id: 'source-device',
    viewType: ViewType.Mixer,
    variables: ['var1', 'var2'],
    collectorVariables: [],
    formulas: { 'target-device': 'var1 + var2' },
    hidden: false,
    lockPassword: ''
  };
  
  const mockTargetDevice: IDevice = {
    id: 'target-device',
    viewType: ViewType.Mixer,
    variables: ['var3', 'var4'],
    collectorVariables: [],
    formulas: {},
    hidden: false,
    lockPassword: ''
  };
  
  // Setup mock props
  const mockProps = {
    source: mockSourceDevice,
    target: mockTargetDevice,
    columnIndex: 1,
    arrowMidPoint: 10,
    svgWidth: 100,
    horizontalArrow: false
  };
  
  // Setup mock global state
  const mockSetGlobalState = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the useGlobalStateContext hook
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        isRunning: false,
        model: {
          columns: [
            {
              id: 'col1',
              name: 'Column 1',
              devices: []
            },
            {
              id: 'col2',
              name: 'Column 2',
              devices: [mockSourceDevice, mockTargetDevice]
            }
          ]
        }
      },
      setGlobalState: mockSetGlobalState
    });
    
    // Mock validateFormula to return true by default
    (validateFormula as jest.Mock).mockReturnValue(true);
  });
  
  it('renders the formula editor with the correct formula', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Expect the component to render the formula
    expect(screen.getByText('var1 + var2')).toBeInTheDocument();
  });
  
  it('enters edit mode when clicked', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula to enter edit mode
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Expect the input to be rendered with the correct value
    expect(screen.getByDisplayValue('var1 + var2')).toBeInTheDocument();
  });
  
  it('does not enter edit mode when isRunning is true', () => {
    // Mock isRunning to be true
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: {
        isRunning: true,
        model: {
          columns: [
            {
              id: 'col1',
              name: 'Column 1',
              devices: []
            },
            {
              id: 'col2',
              name: 'Column 2',
              devices: [mockSourceDevice, mockTargetDevice]
            }
          ]
        }
      },
      setGlobalState: mockSetGlobalState
    });
    
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Expect the input not to be rendered
    expect(screen.queryByDisplayValue('var1 + var2')).not.toBeInTheDocument();
  });
  
  it('updates the formula when submitted', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula to enter edit mode
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Change the input value
    const input = screen.getByDisplayValue('var1 + var2');
    fireEvent.change(input, { target: { value: 'var1 * var2' } });
    
    // Submit the form
    fireEvent.submit(input.closest('form')!);
    
    // Expect setGlobalState to be called with the updated formula
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Expect trackFormula to be called with the correct arguments
    expect(trackFormula).toHaveBeenCalledWith('source-device', 'target-device', 'var1 * var2');
  });
  
  it('updates the formula when clicking outside', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula to enter edit mode
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Change the input value
    const input = screen.getByDisplayValue('var1 + var2');
    fireEvent.change(input, { target: { value: 'var1 * var2' } });
    
    // Simulate clicking outside
    act(() => {
      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      document.dispatchEvent(mouseUpEvent);
    });
    
    // Expect setGlobalState to be called with the updated formula
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Expect trackFormula to be called with the correct arguments
    expect(trackFormula).toHaveBeenCalledWith('source-device', 'target-device', 'var1 * var2');
  });
  
  it('cancels editing when Escape is pressed', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula to enter edit mode
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Change the input value
    const input = screen.getByDisplayValue('var1 + var2');
    fireEvent.change(input, { target: { value: 'var1 * var2' } });
    
    // Press Escape
    fireEvent.keyDown(input, { code: 'Escape' });
    
    // Expect the original formula to be displayed
    expect(screen.getByText('var1 + var2')).toBeInTheDocument();
    
    // Expect setGlobalState not to be called
    expect(mockSetGlobalState).not.toHaveBeenCalled();
  });
  
  it('submits the formula when Enter is pressed', () => {
    render(<FormulaEditor {...mockProps} />);
    
    // Click on the formula to enter edit mode
    fireEvent.click(screen.getByText('var1 + var2'));
    
    // Change the input value
    const input = screen.getByDisplayValue('var1 + var2');
    fireEvent.change(input, { target: { value: 'var1 * var2' } });
    
    // Press Enter
    fireEvent.keyDown(input, { code: 'Enter' });
    
    // Expect setGlobalState to be called with the updated formula
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Expect trackFormula to be called with the correct arguments
    expect(trackFormula).toHaveBeenCalledWith('source-device', 'target-device', 'var1 * var2');
  });
  
  it('displays invalid class when formula is invalid', () => {
    // Mock validateFormula to return false
    (validateFormula as jest.Mock).mockReturnValue(false);
    
    render(<FormulaEditor {...mockProps} />);
    
    // Expect the formula to have the invalid class
    expect(screen.getByText('var1 + var2').classList.contains('invalid')).toBe(true);
  });
  
  it('positions the label correctly for horizontal arrows', () => {
    const horizontalProps = {
      ...mockProps,
      horizontalArrow: true
    };
    
    const { container } = render(<FormulaEditor {...horizontalProps} />);
    
    // Expect the arrow-label to have top: 0
    const arrowLabel = container.querySelector('.arrow-label');
    expect(arrowLabel).toHaveStyle('top: 0px');
  });
  
  it('positions the label correctly for non-horizontal arrows with positive arrowMidPoint', () => {
    const positiveArrowMidPointProps = {
      ...mockProps,
      arrowMidPoint: 15
    };
    
    const { container } = render(<FormulaEditor {...positiveArrowMidPointProps} />);
    
    // Expect the arrow-label to have top: -15 - 22 = -37
    const arrowLabel = container.querySelector('.arrow-label');
    expect(arrowLabel).toHaveStyle('top: -37px');
  });
  
  it('positions the label correctly for non-horizontal arrows with negative arrowMidPoint', () => {
    const negativeArrowMidPointProps = {
      ...mockProps,
      arrowMidPoint: -15
    };
    
    const { container } = render(<FormulaEditor {...negativeArrowMidPointProps} />);
    
    // Expect the arrow-label to have top: -15 - 22/2 = -26
    const arrowLabel = container.querySelector('.arrow-label');
    expect(arrowLabel).toHaveStyle('top: -26px');
  });
}); 