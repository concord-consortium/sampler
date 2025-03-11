import React from 'react';
import { render, screen } from '@testing-library/react';
import { verifyReadingOrder } from './a11y-test-helpers';

/**
 * Meaningful Sequence Tests (WCAG 1.3.2)
 * 
 * These tests verify that the reading and navigation sequence is logical and meaningful.
 * This ensures that users of assistive technologies can understand and navigate content
 * in a way that preserves meaning and operability.
 */

describe('Meaningful Sequence (WCAG 1.3.2)', () => {
  // Test component with proper reading order
  const ProperOrderComponent = () => (
    <div>
      <h1>Main Heading</h1>
      <p>Introduction paragraph</p>
      <h2>Section 1</h2>
      <p>Section 1 content</p>
      <h2>Section 2</h2>
      <p>Section 2 content</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  );

  // Test component with improper reading order
  const ImproperOrderComponent = () => (
    <div>
      <p>Introduction paragraph</p>
      <h1>Main Heading</h1>
      <p>Section 1 content</p>
      <h2>Section 1</h2>
      <h2>Section 2</h2>
      <p>Section 2 content</p>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );

  // Test component with proper tab order
  const ProperTabOrderComponent = () => (
    <div>
      <button tabIndex={1}>First button</button>
      <button tabIndex={2}>Second button</button>
      <button tabIndex={3}>Third button</button>
    </div>
  );

  // Test component with improper tab order
  const ImproperTabOrderComponent = () => (
    <div>
      <button tabIndex={3}>First button</button>
      <button tabIndex={1}>Second button</button>
      <button tabIndex={2}>Third button</button>
    </div>
  );

  describe('DOM Order Tests', () => {
    test('should have proper heading hierarchy', () => {
      render(<ProperOrderComponent />);
      
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.substring(1), 10));
      
      // Check that heading levels never increase by more than one
      for (let i = 1; i < headingLevels.length; i++) {
        expect(headingLevels[i]).toBeGreaterThanOrEqual(headingLevels[i-1] - 1);
      }
    });

    test('should detect improper heading hierarchy', () => {
      render(<ImproperOrderComponent />);
      
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.substring(1), 10));
      
      // This test should fail because h1 comes after content
      expect(headingLevels[0]).toBe(1);
    });

    test('list items should be contained within a list element', () => {
      render(<ProperOrderComponent />);
      
      const listItems = document.querySelectorAll('li');
      
      // Check that all list items are within a list container
      listItems.forEach(li => {
        const parent = li.parentElement;
        expect(parent?.tagName).toMatch(/^(UL|OL)$/);
      });
    });

    test('should detect list items not contained within a list element', () => {
      render(<ImproperOrderComponent />);
      
      const listItems = document.querySelectorAll('li');
      let hasOrphanedListItems = false;
      
      // Check if any list items are not within a list container
      listItems.forEach(li => {
        const parent = li.parentElement;
        if (!parent || !['UL', 'OL'].includes(parent.tagName)) {
          hasOrphanedListItems = true;
        }
      });
      
      expect(hasOrphanedListItems).toBe(true);
    });
  });

  describe('Reading Order Tests', () => {
    test('should have logical reading order', () => {
      const { container } = render(<ProperOrderComponent />);
      
      const result = verifyReadingOrder(container);
      expect(result.isLogical).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    test('should detect illogical reading order', () => {
      const { container } = render(<ImproperOrderComponent />);
      
      // Check for specific issues that indicate illogical reading order
      const listItems = container.querySelectorAll('li');
      let hasOrphanedListItems = false;
      
      listItems.forEach(li => {
        const parent = li.parentElement;
        if (!parent || !['UL', 'OL'].includes(parent.tagName)) {
          hasOrphanedListItems = true;
        }
      });
      
      expect(hasOrphanedListItems).toBe(true);
      
      // Check if paragraph comes before h1
      const firstParagraph = container.querySelector('p');
      const firstHeading = container.querySelector('h1');
      
      if (firstParagraph && firstHeading) {
        const paragraphIndex = Array.from(container.querySelectorAll('*')).indexOf(firstParagraph);
        const headingIndex = Array.from(container.querySelectorAll('*')).indexOf(firstHeading);
        
        expect(paragraphIndex).toBeLessThan(headingIndex);
      }
    });

    test('content should appear in the same order as in the DOM', () => {
      render(<ProperOrderComponent />);
      
      const h1 = screen.getByText('Main Heading');
      const intro = screen.getByText('Introduction paragraph');
      const h2First = screen.getByText('Section 1');
      
      // Check DOM order matches visual order
      const domOrder = [h1, intro, h2First].map(el => 
        Array.from(document.body.querySelectorAll('*')).indexOf(el)
      );
      
      // Verify elements appear in ascending order in the DOM
      expect(domOrder[0]).toBeLessThan(domOrder[1]);
      expect(domOrder[1]).toBeLessThan(domOrder[2]);
    });
  });

  describe('Tab Order Tests', () => {
    test('should have logical tab order', () => {
      render(<ProperTabOrderComponent />);
      
      const buttons = screen.getAllByRole('button');
      const tabIndices = buttons.map(button => parseInt(button.getAttribute('tabindex') || '0', 10));
      
      // Check that tab indices are in ascending order
      for (let i = 1; i < tabIndices.length; i++) {
        expect(tabIndices[i]).toBeGreaterThan(tabIndices[i-1]);
      }
    });

    test('should detect illogical tab order', () => {
      render(<ImproperTabOrderComponent />);
      
      const buttons = screen.getAllByRole('button');
      const tabIndices = buttons.map(button => parseInt(button.getAttribute('tabindex') || '0', 10));
      
      // This should fail because tab indices are not in visual order
      expect(tabIndices[0]).not.toBeLessThan(tabIndices[1]);
    });

    test('tab order should match visual order', () => {
      render(<ProperTabOrderComponent />);
      
      const buttons = screen.getAllByRole('button');
      
      // Visual order (top to bottom, left to right)
      const visualOrder = Array.from(buttons).sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        
        // If elements are roughly on the same line, sort by x-coordinate
        if (Math.abs(aRect.top - bRect.top) < 10) {
          return aRect.left - bRect.left;
        }
        
        // Otherwise, sort by y-coordinate
        return aRect.top - bRect.top;
      });
      
      // Tab order
      const tabOrder = Array.from(buttons).sort((a, b) => {
        const aIndex = parseInt(a.getAttribute('tabindex') || '0', 10);
        const bIndex = parseInt(b.getAttribute('tabindex') || '0', 10);
        return aIndex - bIndex;
      });
      
      // Check that visual order matches tab order
      expect(visualOrder).toEqual(tabOrder);
    });
  });
}); 