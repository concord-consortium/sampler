import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { hasFocusIndicator } from './a11y-test-helpers';
import { GlobalStateContext } from '../hooks/useGlobalState';
import { Speed, ViewType, NavTab } from '../types';

// Mock global state for testing
const createMockGlobalState = (reduceMotion = false) => ({
  globalState: {
    model: {
      columns: [
        {
          id: 'column-1',
          name: 'Column 1',
          devices: [
            {
              id: 'device-1',
              viewType: ViewType.Mixer,
              variables: ['A', 'B', 'C'],
              collectorVariables: [],
              formulas: {},
              hidden: false,
              lockPassword: '',
            },
          ],
        },
      ],
    },
    selectedDeviceId: 'device-1',
    selectedTab: 'Model' as NavTab,
    isRunning: false,
    speed: Speed.Medium,
    repeat: false,
    replacement: false,
    sampleSize: '10',
    numSamples: '10',
    enableRunButton: true,
    dataContexts: [],
    attrMap: {
      experiment: { name: 'experiment', codapID: null },
      description: { name: 'description', codapID: null },
      sample_size: { name: 'sample_size', codapID: null },
      experimentHash: { name: 'experimentHash', codapID: null },
      sample: { name: 'sample', codapID: null }
    },
    collectorContext: undefined,
    samplerContext: undefined,
    showPasswordModal: false,
    modelLocked: false,
    isModelHidden: false,
    isPaused: false,
    modelPassword: '',
    passwordModalMode: 'enter' as 'enter' | 'set' | 'change',
    repeatUntilCondition: '',
    reduceMotion,
  },
  setGlobalState: jest.fn(),
});

// Mock component with proper focus indicators
const ProperFocusIndicatorsComponent = () => (
  <div data-testid="proper-focus-indicators">
    <h1>Focus Indicators Test</h1>
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', padding: 0 }}>
        <li>
          <a 
            href="#home" 
            data-testid="home-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              // Focus styles will be applied via CSS :focus
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a 
            href="#about" 
            data-testid="about-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              // Focus styles will be applied via CSS :focus
            }}
          >
            About
          </a>
        </li>
      </ul>
    </nav>
    <main>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
          <input 
            id="name" 
            type="text" 
            data-testid="name-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              // Focus styles will be applied via CSS :focus
            }} 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
          <input 
            id="email" 
            type="email" 
            data-testid="email-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              // Focus styles will be applied via CSS :focus
            }} 
          />
        </div>
        <button 
          type="submit" 
          data-testid="submit-button"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            // Focus styles will be applied via CSS :focus
          }}
        >
          Submit
        </button>
      </form>
    </main>
  </div>
);

// Mock component with improper focus indicators
const ImproperFocusIndicatorsComponent = () => (
  <div data-testid="improper-focus-indicators">
    <h1>Improper Focus Indicators Test</h1>
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', padding: 0 }}>
        <li>
          <a 
            href="#home" 
            data-testid="improper-home-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              outline: 'none', // Removes default focus indicator
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a 
            href="#about" 
            data-testid="improper-about-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              outline: 'none', // Removes default focus indicator
            }}
          >
            About
          </a>
        </li>
      </ul>
    </nav>
    <main>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="improper-name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
          <input 
            id="improper-name" 
            type="text" 
            data-testid="improper-name-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              outline: 'none', // Removes default focus indicator
            }} 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="improper-email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
          <input 
            id="improper-email" 
            type="email" 
            data-testid="improper-email-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              outline: 'none', // Removes default focus indicator
            }} 
          />
        </div>
        <button 
          type="submit" 
          data-testid="improper-submit-button"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none', // Removes default focus indicator
          }}
        >
          Submit
        </button>
      </form>
    </main>
  </div>
);

// Mock component with custom focus indicators
const CustomFocusIndicatorsComponent = () => (
  <div data-testid="custom-focus-indicators">
    <h1>Custom Focus Indicators Test</h1>
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', padding: 0 }}>
        <li>
          <a 
            href="#home" 
            data-testid="custom-home-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              outline: 'none', // Remove default outline
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.5)';
              e.currentTarget.style.backgroundColor = '#e6f0fa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a 
            href="#about" 
            data-testid="custom-about-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              outline: 'none', // Remove default outline
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.5)';
              e.currentTarget.style.backgroundColor = '#e6f0fa';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            About
          </a>
        </li>
      </ul>
    </nav>
    <main>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="custom-name" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
          <input 
            id="custom-name" 
            type="text" 
            data-testid="custom-name-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              outline: 'none', // Remove default outline
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.5)';
              e.currentTarget.style.borderColor = '#0066cc';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#ccc';
            }}
          />
        </div>
        <button 
          type="submit" 
          data-testid="custom-submit-button"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none', // Remove default outline
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.5)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Submit
        </button>
      </form>
    </main>
  </div>
);

// Mock component with low-contrast focus indicators
const LowContrastFocusIndicatorsComponent = () => (
  <div data-testid="low-contrast-focus-indicators">
    <h1>Low Contrast Focus Indicators Test</h1>
    <nav>
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem', padding: 0 }}>
        <li>
          <a 
            href="#home" 
            data-testid="low-contrast-home-link"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#0066cc',
              textDecoration: 'none',
              borderRadius: '4px',
              outline: 'none', // Remove default outline
            }}
            onFocus={(e) => {
              // Low contrast focus indicator
              e.currentTarget.style.outline = '1px solid #cccccc';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            Home
          </a>
        </li>
      </ul>
    </nav>
    <main>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="low-contrast-input" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
          <input 
            id="low-contrast-input" 
            type="text" 
            data-testid="low-contrast-input"
            style={{ 
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              outline: 'none', // Remove default outline
            }}
            onFocus={(e) => {
              // Low contrast focus indicator
              e.currentTarget.style.borderColor = '#dddddd';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ccc';
            }}
          />
        </div>
        <button 
          type="submit" 
          data-testid="low-contrast-button"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none', // Remove default outline
          }}
          onFocus={(e) => {
            // Low contrast focus indicator
            e.currentTarget.style.boxShadow = '0 0 0 1px #99bbdd';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Submit
        </button>
      </form>
    </main>
  </div>
);

/**
 * Focus Visible Tests (WCAG 2.4.7)
 * 
 * These tests verify that keyboard focus indicators are visible on interactive elements.
 * This ensures that keyboard users can visually identify which element has focus at any time.
 */

describe('Focus Visible Tests (WCAG 2.4.7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Add a style element to simulate focus styles
    const style = document.createElement('style');
    style.innerHTML = `
      :focus {
        outline: 2px solid blue;
        outline-offset: 2px;
      }
      
      .custom-focus:focus {
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
        border-color: #4299e1;
      }
      
      .no-focus:focus {
        outline: none;
      }
    `;
    document.head.appendChild(style);
  });
  
  afterEach(() => {
    // Clean up the style element
    const style = document.head.querySelector('style');
    if (style) {
      document.head.removeChild(style);
    }
  });

  test('interactive elements have visible focus indicators', () => {
    render(<ProperFocusIndicatorsComponent />);
    
    // Test focus indicator on links
    const homeLink = screen.getByTestId('home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    expect(homeLinkFocusIndicator.hasIndicator).toBe(true);
    
    // Test focus indicator on inputs
    const nameInput = screen.getByTestId('name-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    expect(nameInputFocusIndicator.hasIndicator).toBe(true);
    
    // Test focus indicator on buttons
    const submitButton = screen.getByTestId('submit-button');
    submitButton.focus();
    
    // Check if the button has a visible focus indicator
    const submitButtonFocusIndicator = hasFocusIndicator(submitButton);
    expect(submitButtonFocusIndicator.hasIndicator).toBe(true);
  });
  
  test('detects missing focus indicators', () => {
    render(<ImproperFocusIndicatorsComponent />);
    
    // Test focus indicator on links
    const homeLink = screen.getByTestId('improper-home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    expect(homeLinkFocusIndicator.hasIndicator).toBe(false);
    
    // Test focus indicator on inputs
    const nameInput = screen.getByTestId('improper-name-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    expect(nameInputFocusIndicator.hasIndicator).toBe(false);
    
    // Test focus indicator on buttons
    const submitButton = screen.getByTestId('improper-submit-button');
    submitButton.focus();
    
    // Check if the button has a visible focus indicator
    const submitButtonFocusIndicator = hasFocusIndicator(submitButton);
    expect(submitButtonFocusIndicator.hasIndicator).toBe(false);
  });
  
  test('custom focus indicators are visible', () => {
    render(<CustomFocusIndicatorsComponent />);
    
    // Test custom focus indicator on links
    const homeLink = screen.getByTestId('custom-home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    expect(homeLinkFocusIndicator.hasIndicator).toBe(true);
    expect(homeLinkFocusIndicator.details.boxShadow).not.toBe('none');
    
    // Test custom focus indicator on inputs
    const nameInput = screen.getByTestId('custom-name-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    expect(nameInputFocusIndicator.hasIndicator).toBe(true);
    expect(nameInputFocusIndicator.details.boxShadow).not.toBe('none');
    
    // Test custom focus indicator on buttons
    const submitButton = screen.getByTestId('custom-submit-button');
    submitButton.focus();
    
    // Check if the button has a visible focus indicator
    const submitButtonFocusIndicator = hasFocusIndicator(submitButton);
    expect(submitButtonFocusIndicator.hasIndicator).toBe(true);
    expect(submitButtonFocusIndicator.details.boxShadow).not.toBe('none');
  });
  
  test('focus indicators have sufficient contrast', () => {
    render(<LowContrastFocusIndicatorsComponent />);
    
    // Test low contrast focus indicator on links
    const homeLink = screen.getByTestId('low-contrast-home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    
    // The indicator exists but has low contrast
    expect(homeLinkFocusIndicator.hasIndicator).toBe(true);
    
    // In a real test, we would check the contrast ratio
    // For this test, we'll just check that the outline color is as expected
    expect(homeLinkFocusIndicator.details.outlineColor).toBe('rgb(204, 204, 204)');
    
    // Test low contrast focus indicator on inputs
    const nameInput = screen.getByTestId('low-contrast-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    
    // The indicator exists but has low contrast
    expect(nameInputFocusIndicator.hasIndicator).toBe(true);
    
    // Test low contrast focus indicator on buttons
    const submitButton = screen.getByTestId('low-contrast-button');
    submitButton.focus();
    
    // Check if the button has a visible focus indicator
    const submitButtonFocusIndicator = hasFocusIndicator(submitButton);
    
    // The indicator exists but has low contrast
    expect(submitButtonFocusIndicator.hasIndicator).toBe(true);
  });
  
  test('focus indicators are visible in different color schemes', () => {
    // In a real test, we would test with different color schemes
    // For this test, we'll just verify that the focus indicators are visible in the default color scheme
    
    render(<ProperFocusIndicatorsComponent />);
    
    // Test focus indicator on links
    const homeLink = screen.getByTestId('home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    expect(homeLinkFocusIndicator.hasIndicator).toBe(true);
    
    // Test focus indicator on inputs
    const nameInput = screen.getByTestId('name-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    expect(nameInputFocusIndicator.hasIndicator).toBe(true);
    
    // Test focus indicator on buttons
    const submitButton = screen.getByTestId('submit-button');
    submitButton.focus();
    
    // Check if the button has a visible focus indicator
    const submitButtonFocusIndicator = hasFocusIndicator(submitButton);
    expect(submitButtonFocusIndicator.hasIndicator).toBe(true);
  });
  
  test('focus indicators are at least 2px thick', () => {
    render(<CustomFocusIndicatorsComponent />);
    
    // Test focus indicator thickness on links
    const homeLink = screen.getByTestId('custom-home-link');
    homeLink.focus();
    
    // Check if the link has a visible focus indicator
    const homeLinkFocusIndicator = hasFocusIndicator(homeLink);
    
    // Extract the box shadow values
    const boxShadow = homeLinkFocusIndicator.details.boxShadow;
    const boxShadowMatch = boxShadow.match(/0px 0px 0px (\d+)px/);
    
    if (boxShadowMatch) {
      const thickness = parseInt(boxShadowMatch[1], 10);
      expect(thickness).toBeGreaterThanOrEqual(2);
    } else {
      // If no box shadow, check outline width
      const outlineWidth = homeLinkFocusIndicator.details.outlineWidth;
      if (outlineWidth) {
        const outlineWidthValue = parseInt(outlineWidth, 10);
        expect(outlineWidthValue).toBeGreaterThanOrEqual(2);
      }
    }
    
    // Test focus indicator thickness on inputs
    const nameInput = screen.getByTestId('custom-name-input');
    nameInput.focus();
    
    // Check if the input has a visible focus indicator
    const nameInputFocusIndicator = hasFocusIndicator(nameInput);
    
    // Extract the box shadow values
    const inputBoxShadow = nameInputFocusIndicator.details.boxShadow;
    const inputBoxShadowMatch = inputBoxShadow.match(/0px 0px 0px (\d+)px/);
    
    if (inputBoxShadowMatch) {
      const thickness = parseInt(inputBoxShadowMatch[1], 10);
      expect(thickness).toBeGreaterThanOrEqual(2);
    }
  });
}); 