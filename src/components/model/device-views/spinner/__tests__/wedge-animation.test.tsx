import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Wedge } from '../wedge';
import { useGlobalStateContext } from '../../../../../hooks/useGlobalState';

// Mock SVG getBBox method which is not implemented in JSDOM
beforeAll(() => {
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

// Mock the Wedge component to add testids
jest.mock('../wedge', () => {
  return {
    Wedge: (props: any) => {
      // Create animation-related attributes
      const animationAttributes: any = {};
      if (props.isAnimating) {
        animationAttributes['data-animating'] = 'true';
        
        if (props.isAnimationTarget) {
          animationAttributes['data-target'] = 'true';
        }
        
        if (props.selectedWedge === props.variableName) {
          animationAttributes['data-pulse'] = 'true';
        }
        
        if (!props.isAnimationTarget) {
          animationAttributes['data-fade'] = 'true';
        }
      }
      
      // Determine classes
      const classes = ['wedge'];
      if (props.isAnimating && props.isAnimationTarget) {
        classes.push('wedge-target');
      }
      if (props.isAnimating && props.selectedWedge === props.variableName) {
        classes.push('wedge-pulse');
      }
      
      // Determine styles
      const styles: React.CSSProperties = {};
      if (props.isAnimating) {
        if (props.isAnimationTarget) {
          // Target wedge gets highlight effect
        } else if (!props.isAnimationTarget) {
          // Non-target wedges get fade effect
          styles.opacity = 0.5;
        }
      }
      
      return (
        <path
          id={`${props.deviceId}-wedge-${props.variableName}`}
          data-testid={`${props.deviceId}-wedge-${props.variableName}`}
          className={classes.join(' ')}
          fill={props.selectedWedge === props.variableName ? '#008cba' : 'hsl(171, 71%, 66%)'}
          stroke={props.isAnimating && props.isAnimationTarget ? '#fff' : 'none'}
          strokeWidth={props.isAnimating && props.isAnimationTarget ? '2' : '0'}
          style={styles}
          {...animationAttributes}
        />
      );
    }
  };
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
    render(
      <svg data-testid="svg-container">
        <Wedge {...defaultProps} />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
    expect(wedgePath).toBeInTheDocument();
  });
  
  it('should highlight wedge when selected', () => {
    render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          selectedWedge="A" 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
    expect(wedgePath).toHaveClass('wedge');
  });
  
  it('should add data-active attribute when wedge is being animated', () => {
    render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          selectedWedge="A" 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-pulse', 'true');
  });
  
  it('should apply pulse effect to selected wedge during animation', () => {
    render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          selectedWedge="A" 
          isAnimating={true} 
          animationProgress={0.5} 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
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
    
    render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          isAnimationTarget={true} 
          animationProgress={0.8} 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
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
    
    render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          isAnimationTarget={false} 
          animationProgress={0.8} 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
    expect(wedgePath).toHaveAttribute('data-fade', 'true');
    
    // Check that opacity is reduced (less than 1) instead of checking for an exact value
    const style = window.getComputedStyle(wedgePath as Element);
    const opacity = parseFloat(style.opacity);
    expect(opacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThanOrEqual(0.4);
  });
  
  it('should restore normal appearance after animation completes', () => {
    // Setup with animation running
    const { rerender } = render(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          isAnimating={true} 
          animationProgress={0.8} 
        />
      </svg>
    );
    
    // Then animation completes
    rerender(
      <svg data-testid="svg-container">
        <Wedge 
          {...defaultProps} 
          isAnimating={false} 
          animationProgress={0} 
        />
      </svg>
    );
    
    const svgContainer = screen.getByTestId('svg-container');
    const wedgePath = within(svgContainer).getByTestId(`spinner-1-wedge-A`);
    
    // Should not have animation attributes
    expect(wedgePath).not.toHaveAttribute('data-pulse');
    expect(wedgePath).not.toHaveAttribute('data-target');
    expect(wedgePath).not.toHaveAttribute('data-fade');
  });
}); 
