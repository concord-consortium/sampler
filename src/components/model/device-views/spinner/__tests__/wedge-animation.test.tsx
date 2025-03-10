import React from 'react';
import { render, screen } from '@testing-library/react';
import { Wedge } from '../wedge';
import { useGlobalStateContext } from '../../../../../hooks/useGlobalState';

// Mock SVG getBBox method which is not implemented in JSDOM
beforeAll(() => {
  // Mock getBBox for SVG elements
  // Use type assertion to avoid TypeScript errors
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 50
    }),
    configurable: true
  });
});

// Mock the global state context
jest.mock('../../../../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('Wedge Animation', () => {
  // Setup mock for global state context
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: false }
    });
  });
  
  const defaultProps = {
    percent: 0.25,
    lastPercent: 0,
    variableName: 'A',
    index: 0,
    labelFontSize: 16,
    varArrayIdx: 0,
    numUniqueVariables: 4,
    selectedWedge: null,
    nextVariable: 'B',
    isDragging: false,
    isLastVariable: false,
    isBoundaryBeingDragged: false,
    deviceId: 'spinner-1',
    handleAddDefs: jest.fn(),
    handleSetSelectedVariable: jest.fn(),
    handleDeleteWedge: jest.fn(),
    handleSetEditingPct: jest.fn(),
    handleSetEditingVarName: jest.fn()
  };
  
  it('should render wedge with correct path and color', () => {
    const { container } = render(
      <svg>
        <Wedge {...defaultProps} />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toBeInTheDocument();
    expect(wedgePath).toHaveAttribute('fill');
  });
  
  it('should highlight wedge when selected', () => {
    const { container } = render(
      <svg>
        <Wedge {...defaultProps} selectedWedge="A" />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('fill', '#008cba'); // kDarkTeal
  });
  
  it('should add data-active attribute when wedge is being animated', () => {
    // First render without animation
    const { container, rerender } = render(
      <svg>
        <Wedge {...defaultProps} />
      </svg>
    );
    
    // Mock the global state to indicate animation is running
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true }
    });
    
    // Rerender with animation running
    rerender(
      <svg>
        <Wedge {...defaultProps} isAnimating={true} />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-animating', 'true');
  });
  
  it('should apply pulse effect to selected wedge during animation', () => {
    // Mock the global state to indicate animation is running
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true }
    });
    
    const { container } = render(
      <svg>
        <Wedge 
          {...defaultProps} 
          selectedWedge="A" 
          isAnimating={true} 
          animationProgress={0.5} 
        />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-pulse', 'true');
    
    // Should have animation-related class or style
    expect(wedgePath?.classList.contains('wedge-pulse') || 
           wedgePath?.hasAttribute('style')).toBeTruthy();
  });
  
  it('should apply highlight effect when wedge is the target of animation', () => {
    // Mock the global state to indicate animation is running
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true }
    });
    
    const { container } = render(
      <svg>
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          isAnimationTarget={true} 
          animationProgress={0.8} 
        />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-target', 'true');
    
    // Should have a highlight effect
    expect(wedgePath).toHaveAttribute('stroke', '#fff');
    expect(wedgePath).toHaveAttribute('stroke-width', '2');
  });
  
  it('should apply fade effect to non-target wedges during animation', () => {
    // Mock the global state to indicate animation is running
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true }
    });
    
    const { container } = render(
      <svg>
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          isAnimationTarget={false} 
          animationProgress={0.8} 
        />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-fade', 'true');
    
    // Check that opacity is reduced (less than 1) instead of checking for an exact value
    const style = window.getComputedStyle(wedgePath as Element);
    const opacity = parseFloat(style.opacity);
    expect(opacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThanOrEqual(0.4);
  });
  
  it('should restore normal appearance after animation completes', () => {
    // Setup with animation running
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { isRunning: true }
    });
    
    const { container, rerender } = render(
      <svg>
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          animationProgress={0.5} 
        />
      </svg>
    );
    
    // Now complete the animation
    rerender(
      <svg>
        <Wedge 
          {...defaultProps} 
          isAnimating={false} 
          animationProgress={1} 
        />
      </svg>
    );
    
    const wedgePath = container.querySelector(`path#spinner-1-wedge-A`);
    expect(wedgePath).not.toHaveAttribute('data-animating');
    expect(wedgePath).not.toHaveAttribute('data-pulse');
    expect(wedgePath).not.toHaveAttribute('data-fade');
    expect(wedgePath).not.toHaveAttribute('opacity');
  });
}); 
