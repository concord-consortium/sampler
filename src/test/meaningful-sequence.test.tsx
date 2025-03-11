import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Device } from '../components/model/device';
import { IDevice, ViewType } from '../types';
import { verifyReadingOrder } from './a11y-test-helpers';

/**
 * Meaningful Sequence Tests (WCAG 1.3.2)
 * 
 * These tests verify that the reading and navigation sequence is logical and meaningful.
 * This ensures that users of assistive technologies can understand and navigate content
 * in a way that preserves meaning and operability.
 */

// Mock the GlobalStateContext
jest.mock('../hooks/useGlobalState', () => ({
  useGlobalStateContext: () => ({
    globalState: {
      model: {
        columns: [{ id: 'col1', devices: [] }]
      },
      selectedDeviceId: 'device1'
    },
    setGlobalState: jest.fn()
  })
}));

// Mock the AnimationContext
jest.mock('../hooks/useAnimation', () => ({
  useAnimationContext: () => ({
    registerAnimationCallback: jest.fn()
  })
}));

// Mock component with proper reading order
const ProperReadingOrderComponent = () => (
  <div data-testid="proper-reading-order">
    <header>
      <h1>Page Title</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section>
        <h2>Section 1</h2>
        <p>This is the first paragraph of section 1.</p>
        <p>This is the second paragraph of section 1.</p>
      </section>
      <section>
        <h2>Section 2</h2>
        <p>This is the first paragraph of section 2.</p>
        <p>This is the second paragraph of section 2.</p>
      </section>
    </main>
    <footer>
      <p>Footer content</p>
    </footer>
  </div>
);

// Mock component with improper reading order
const ImproperReadingOrderComponent = () => (
  <div data-testid="improper-reading-order">
    <footer>
      <p>Footer content</p>
    </footer>
    <main>
      <section>
        <p>This is the first paragraph of section 1.</p>
        <h2>Section 1</h2>
        <p>This is the second paragraph of section 1.</p>
      </section>
      <section>
        <p>This is the first paragraph of section 2.</p>
        <h2>Section 2</h2>
        <p>This is the second paragraph of section 2.</p>
      </section>
    </main>
    <header>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
      <h1>Page Title</h1>
    </header>
  </div>
);

// Mock component with proper heading hierarchy
const ProperHeadingHierarchyComponent = () => (
  <div data-testid="proper-heading-hierarchy">
    <h1>Main Title</h1>
    <section>
      <h2>Section 1</h2>
      <div>
        <h3>Subsection 1.1</h3>
        <p>Content for subsection 1.1</p>
        <h3>Subsection 1.2</h3>
        <p>Content for subsection 1.2</p>
      </div>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>
        <h3>Subsection 2.1</h3>
        <p>Content for subsection 2.1</p>
      </div>
    </section>
  </div>
);

// Mock component with improper heading hierarchy
const ImproperHeadingHierarchyComponent = () => (
  <div data-testid="improper-heading-hierarchy">
    <h1>Main Title</h1>
    <section>
      <h3>Subsection 1.1</h3> {/* Should be h2 */}
      <p>Content for subsection 1.1</p>
      <h2>Section 1</h2> {/* Out of order */}
      <div>
        <h4>Subsection 1.2</h4> {/* Should be h3 */}
        <p>Content for subsection 1.2</p>
      </div>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>
        <h5>Subsection 2.1</h5> {/* Should be h3 */}
        <p>Content for subsection 2.1</p>
      </div>
    </section>
  </div>
);

// Mock component with dynamic content
const DynamicContentComponent = ({ showAdditionalContent = false }) => (
  <div data-testid="dynamic-content">
    <h1>Dynamic Content</h1>
    <div aria-live="polite">
      <p>This content is always visible.</p>
      {showAdditionalContent && (
        <>
          <h2>Additional Content</h2>
          <p>This content appears dynamically.</p>
        </>
      )}
    </div>
  </div>
);

describe('Meaningful Sequence Tests (WCAG 1.3.2)', () => {
  // Test for proper reading order
  test('content in proper reading order has no issues', () => {
    render(<ProperReadingOrderComponent />);
    const container = screen.getByTestId('proper-reading-order');
    const result = verifyReadingOrder(container);
    
    // Expect no reading order issues
    expect(result.isLogical).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
  
  // Test for improper reading order
  test('content in improper reading order has issues', () => {
    render(<ImproperReadingOrderComponent />);
    const container = screen.getByTestId('improper-reading-order');
    const result = verifyReadingOrder(container);
    
    // Expect reading order issues
    expect(result.isLogical).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
  
  // Test for visual order matching DOM order
  test('visual order matches DOM order in proper component', () => {
    render(<ProperReadingOrderComponent />);
    const container = screen.getByTestId('proper-reading-order');
    const result = verifyReadingOrder(container);
    
    // Expect no visual order issues
    expect(result.isLogical).toBe(true);
  });
  
  // Test for visual order not matching DOM order
  test('visual order does not match DOM order in improper component', () => {
    render(<ImproperReadingOrderComponent />);
    const container = screen.getByTestId('improper-reading-order');
    const result = verifyReadingOrder(container);
    
    // Expect visual order issues
    expect(result.isLogical).toBe(false);
  });
  
  // Test for proper heading hierarchy
  test('heading levels are properly nested in proper component', () => {
    render(<ProperHeadingHierarchyComponent />);
    const container = screen.getByTestId('proper-heading-hierarchy');
    
    // Get all headings
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    // Check that heading levels don't skip (e.g., h1 to h3)
    let previousLevel = 0;
    let hasError = false;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1));
      
      // Heading levels should either stay the same, go up by exactly 1, or go down to any lower level
      if (currentLevel > previousLevel && currentLevel !== previousLevel + 1) {
        hasError = true;
      }
      
      previousLevel = Math.max(previousLevel, currentLevel);
    });
    
    expect(hasError).toBe(false);
  });
  
  // Test for improper heading hierarchy
  test('heading levels are improperly nested in improper component', () => {
    render(<ImproperHeadingHierarchyComponent />);
    const container = screen.getByTestId('improper-heading-hierarchy');
    
    // Get all headings
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    // Check that heading levels don't skip (e.g., h1 to h3)
    let previousLevel = 0;
    let hasError = false;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1));
      
      // Heading levels should either stay the same, go up by exactly 1, or go down to any lower level
      if (currentLevel > previousLevel && currentLevel !== previousLevel + 1) {
        hasError = true;
      }
      
      previousLevel = Math.max(previousLevel, currentLevel);
    });
    
    expect(hasError).toBe(true);
  });
  
  // Test for dynamic content
  test('dynamic content maintains proper reading order', () => {
    const { container, rerender } = render(<DynamicContentComponent showAdditionalContent={false} />);
    
    // Check initial ARIA live regions
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    
    // Verify initial reading order
    let result = verifyReadingOrder(container);
    expect(result.isLogical).toBe(true);
    
    // Update with additional content
    rerender(<DynamicContentComponent showAdditionalContent={true} />);
    
    // Verify reading order after update
    result = verifyReadingOrder(container);
    expect(result.isLogical).toBe(true);
    
    // Verify that the dynamic content is in the correct order
    const headings = container.querySelectorAll('h1, h2');
    expect(headings.length).toBe(2);
    expect(headings[0].textContent).toBe('Dynamic Content');
    expect(headings[1].textContent).toBe('Additional Content');
  });
  
  // Test with axe-core
  test('components pass axe accessibility tests', async () => {
    const { container: properContainer } = render(<ProperReadingOrderComponent />);
    const properResults = await axe(properContainer);
    expect(properResults).toHaveNoViolations();
    
    const { container: properHeadingContainer } = render(<ProperHeadingHierarchyComponent />);
    const properHeadingResults = await axe(properHeadingContainer);
    expect(properHeadingResults).toHaveNoViolations();
    
    const { container: dynamicContainer } = render(<DynamicContentComponent showAdditionalContent={true} />);
    const dynamicResults = await axe(dynamicContainer);
    expect(dynamicResults).toHaveNoViolations();
  });
}); 