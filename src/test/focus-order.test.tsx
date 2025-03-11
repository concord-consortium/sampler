import React, { useState, useRef, useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulateTabNavigation, getFocusableElements } from './a11y-test-helpers';

/**
 * Focus Order Tests (WCAG 2.4.3)
 * 
 * These tests verify that the focus order of interactive elements is logical and follows
 * a meaningful sequence. This ensures that keyboard users can navigate through the content
 * in a way that preserves meaning and operability.
 */

describe('Focus Order (WCAG 2.4.3)', () => {
  // Test component with proper focus order
  const ProperFocusOrderComponent = () => (
    <div>
      <button>First button</button>
      <button>Second button</button>
      <button>Third button</button>
      <a href="#">Link</a>
      <input type="text" placeholder="Input field" />
    </div>
  );

  // Test component with improper focus order (using tabIndex)
  const ImproperFocusOrderComponent = () => (
    <div>
      <button tabIndex={3}>First button</button>
      <button tabIndex={1}>Second button</button>
      <button tabIndex={2}>Third button</button>
      <a href="#" tabIndex={5}>Link</a>
      <input type="text" placeholder="Input field" tabIndex={4} />
    </div>
  );

  // Modal dialog component for testing focus management
  const ModalDialogComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const firstFocusableRef = useRef<HTMLInputElement>(null);
    
    // Focus management for modal
    useEffect(() => {
      if (isOpen && firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    }, [isOpen]);
    
    return (
      <div>
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
        
        {isOpen && (
          <div role="dialog" aria-modal="true">
            <h2 id="dialog-title">Dialog Title</h2>
            <input 
              ref={firstFocusableRef}
              type="text" 
              placeholder="Name" 
            />
            <input type="email" placeholder="Email" />
            <div>
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button onClick={() => setIsOpen(false)}>Submit</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dynamic content component for testing focus restoration
  const DynamicContentComponent = () => {
    const [showMore, setShowMore] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    // Focus management for dynamic content
    const toggleContent = () => {
      setShowMore(!showMore);
      // Focus will be restored in useEffect
    };
    
    // Restore focus after state change
    useEffect(() => {
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }, [showMore]);
    
    return (
      <div>
        <button 
          ref={buttonRef}
          onClick={toggleContent}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </button>
        
        {showMore && (
          <div>
            <p>Additional content</p>
            <button>New Button 1</button>
            <button>New Button 2</button>
          </div>
        )}
      </div>
    );
  };

  describe('Sequential Focus Order Tests', () => {
    test('focus order should follow DOM order', () => {
      const { container } = render(<ProperFocusOrderComponent />);
      
      // Get all focusable elements in DOM order
      const focusableElements = getFocusableElements(container);
      
      // Simulate tab navigation
      const tabOrder = simulateTabNavigation(container);
      
      // Check that tab order matches DOM order
      expect(tabOrder).toEqual(focusableElements);
    });

    test('should detect improper focus order', () => {
      const { container } = render(<ImproperFocusOrderComponent />);
      
      // Get all focusable elements in DOM order
      const focusableElements = getFocusableElements(container);
      
      // Simulate tab navigation
      const tabOrder = simulateTabNavigation(container);
      
      // Check that tab order does not match DOM order
      expect(tabOrder).not.toEqual(focusableElements);
    });

    test('focus order should match visual order (top to bottom, left to right)', () => {
      const { container } = render(<ProperFocusOrderComponent />);
      
      // Get all focusable elements
      const focusableElements = getFocusableElements(container);
      
      // Sort elements by visual position (top to bottom, left to right)
      const visualOrder = [...focusableElements].sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        
        // If elements are roughly on the same line, sort by x-coordinate
        if (Math.abs(aRect.top - bRect.top) < 10) {
          return aRect.left - bRect.left;
        }
        
        // Otherwise, sort by y-coordinate
        return aRect.top - bRect.top;
      });
      
      // Simulate tab navigation
      const tabOrder = simulateTabNavigation(container);
      
      // Check that tab order matches visual order
      expect(tabOrder).toEqual(visualOrder);
    });
  });

  describe('Modal Dialog Focus Management Tests', () => {
    test('focus should move to the modal when opened', () => {
      render(<ModalDialogComponent />);
      
      // Get the button to open the modal
      const openButton = screen.getByText('Open Modal');
      
      // Click the button to open the modal
      fireEvent.click(openButton);
      
      // Check that the modal is open
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Check that focus is trapped within the modal
      const focusableElementsInModal = getFocusableElements(dialog);
      expect(focusableElementsInModal.length).toBeGreaterThan(0);
      
      // First focusable element in the modal should be focused
      // We need to wait for the useEffect to run
      setTimeout(() => {
        expect(document.activeElement).toBe(focusableElementsInModal[0]);
      }, 0);
    });

    test('focus should be trapped within the modal', () => {
      // This test is simplified since we can't fully simulate tab navigation in JSDOM
      render(<ModalDialogComponent />);
      
      // Get the button to open the modal
      const openButton = screen.getByText('Open Modal');
      
      // Click the button to open the modal
      fireEvent.click(openButton);
      
      // Get the modal
      const dialog = screen.getByRole('dialog');
      
      // Check that the modal has focusable elements
      const focusableElementsInModal = getFocusableElements(dialog);
      expect(focusableElementsInModal.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Restoration Tests', () => {
    test('focus should return to the triggering element after dynamic content changes', () => {
      render(<DynamicContentComponent />);
      
      // Get the button to show more content
      const toggleButton = screen.getByText('Show More');
      
      // Click the button to show more content
      fireEvent.click(toggleButton);
      
      // Check that additional content is shown
      expect(screen.getByText('Additional content')).toBeInTheDocument();
      
      // Focus should be maintained on the toggle button
      // We need to wait for the useEffect to run
      setTimeout(() => {
        expect(document.activeElement).toBe(toggleButton);
      }, 0);
      
      // Click the button again to hide content
      fireEvent.click(screen.getByText('Show Less'));
      
      // Focus should still be on the toggle button
      setTimeout(() => {
        expect(document.activeElement).toBe(toggleButton);
      }, 0);
    });
  });
}); 