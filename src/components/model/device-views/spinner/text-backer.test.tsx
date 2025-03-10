import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextBacker, updateTextBackerRefFn } from './text-backer';
import { useGlobalStateContext } from '../../../../hooks/useGlobalState';

// Mock the useGlobalStateContext hook
jest.mock('../../../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('TextBacker', () => {
  const mockOnClick = jest.fn();
  const mockPos = { x: 10, y: 20, width: 100, height: 30 };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: false },
      setGlobalState: jest.fn()
    });
  });

  it('renders nothing when pos is undefined', () => {
    const { container } = render(
      <TextBacker 
        pos={undefined} 
        onClick={mockOnClick} 
        isDragging={false} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders a rect with correct attributes when pos is provided', () => {
    const { container } = render(
      <TextBacker 
        pos={mockPos} 
        onClick={mockOnClick} 
        isDragging={false} 
      />
    );
    
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('x', '10');
    expect(rect).toHaveAttribute('y', '20');
    expect(rect).toHaveAttribute('width', '100');
    expect(rect).toHaveAttribute('height', '30');
    expect(rect).toHaveAttribute('opacity', '0');
    expect(rect).toHaveStyle('cursor: pointer');
  });

  it('calls onClick when rect is clicked', () => {
    const { container } = render(
      <TextBacker 
        pos={mockPos} 
        onClick={mockOnClick} 
        isDragging={false} 
      />
    );
    
    const rect = container.querySelector('rect');
    if (rect) {
      fireEvent.click(rect);
    }
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('sets cursor to "grabbing" when isDragging is true', () => {
    const { container } = render(
      <TextBacker 
        pos={mockPos} 
        onClick={mockOnClick} 
        isDragging={true} 
      />
    );
    
    const rect = container.querySelector('rect');
    expect(rect).toHaveStyle('cursor: grabbing');
  });

  it('sets cursor to "default" when isRunning is true', () => {
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true },
      setGlobalState: jest.fn()
    });

    const { container } = render(
      <TextBacker 
        pos={mockPos} 
        onClick={mockOnClick} 
        isDragging={false} 
      />
    );
    
    const rect = container.querySelector('rect');
    expect(rect).toHaveStyle('cursor: default');
  });
});

describe('updateTextBackerRefFn', () => {
  const mockSetTextBackerPos = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a function', () => {
    const result = updateTextBackerRefFn(mockSetTextBackerPos);
    expect(typeof result).toBe('function');
  });

  it('calls setTextBackerPos with updated position when SVG element is provided', () => {
    const refFn = updateTextBackerRefFn(mockSetTextBackerPos);
    
    // Create a mock SVG text element with getBBox
    const mockSvgText = {
      getBBox: () => ({ x: 5, y: 10, width: 50, height: 20 })
    } as unknown as SVGTextElement;
    
    refFn(mockSvgText);
    
    expect(mockSetTextBackerPos).toHaveBeenCalledTimes(1);
    // Check that it calls the state setter function
    const setStateFn = mockSetTextBackerPos.mock.calls[0][0];
    // Call the function with undefined previous state
    const result = setStateFn(undefined);
    // Verify the result
    expect(result).toEqual({ x: 5, y: 10, width: 50, height: 20 });
  });

  it('returns previous position when dimensions are the same', () => {
    const refFn = updateTextBackerRefFn(mockSetTextBackerPos);
    
    // Create a mock SVG text element with getBBox
    const mockSvgText = {
      getBBox: () => ({ x: 5, y: 10, width: 50, height: 20 })
    } as unknown as SVGTextElement;
    
    refFn(mockSvgText);
    
    // Get the state setter function
    const setStateFn = mockSetTextBackerPos.mock.calls[0][0];
    
    // Call with previous state that matches the current dimensions
    const prevState = { x: 5, y: 10, width: 50, height: 20 };
    const result = setStateFn(prevState);
    
    // Should return the same object reference
    expect(result).toBe(prevState);
  });

  it('returns previous position when SVG element is null', () => {
    const refFn = updateTextBackerRefFn(mockSetTextBackerPos);
    
    refFn(null);
    
    // Get the state setter function
    const setStateFn = mockSetTextBackerPos.mock.calls[0][0];
    
    // Call with some previous state
    const prevState = { x: 5, y: 10, width: 50, height: 20 };
    const result = setStateFn(prevState);
    
    // Should return the same object reference
    expect(result).toBe(prevState);
  });
}); 