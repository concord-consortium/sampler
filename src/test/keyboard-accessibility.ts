/**
 * Keyboard accessibility testing utilities
 * These utilities help test keyboard navigation and interaction in components
 */

import { fireEvent } from '@testing-library/react';

/**
 * Simulates pressing the Tab key to navigate through focusable elements
 * @param container The container element to test
 * @param options Options for the tab simulation
 * @returns Array of elements that received focus in order
 */
export function simulateTabNavigation(
  container: HTMLElement,
  options: { 
    count?: number;       // Number of tab presses to simulate
    startElement?: HTMLElement; // Element to start from (defaults to document.body)
    shiftKey?: boolean;   // Whether to simulate Shift+Tab (backwards navigation)
  } = {}
): HTMLElement[] {
  const { 
    count = 10,           // Default to 10 tab presses
    startElement = document.body,
    shiftKey = false
  } = options;
  
  // Set initial focus
  if (startElement) {
    startElement.focus();
  }
  
  const focusedElements: HTMLElement[] = [];
  
  // Simulate tab presses
  for (let i = 0; i < count; i++) {
    fireEvent.keyDown(document.activeElement || document.body, {
      key: 'Tab',
      code: 'Tab',
      shiftKey,
      bubbles: true
    });
    
    // Record the newly focused element
    if (document.activeElement && document.activeElement !== document.body) {
      focusedElements.push(document.activeElement as HTMLElement);
      
      // If we've looped back to an element we've already seen, we're done
      if (i > 0 && focusedElements.indexOf(document.activeElement as HTMLElement) < i) {
        break;
      }
    }
  }
  
  return focusedElements;
}

/**
 * Checks if an element is keyboard accessible
 * @param element The element to check
 * @returns Object with properties indicating accessibility status
 */
export function isKeyboardAccessible(element: HTMLElement): {
  focusable: boolean;
  interactive: boolean;
  hasKeyboardHandler: boolean;
  hasClickHandler: boolean;
  hasAriaRole: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check if element is focusable
  const focusable = element.tabIndex >= 0 || 
    ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  
  if (!focusable) {
    issues.push('Element is not focusable');
  }
  
  // Check if element has keyboard event handlers
  // Note: This is a simplified check and may not detect all React event handlers
  // React attaches event handlers at the document level, not directly on elements
  const hasKeyboardHandler = element.hasAttribute('onkeydown') || 
    element.hasAttribute('onkeyup') || 
    element.hasAttribute('onkeypress') ||
    // Check for React-specific data attributes that might indicate event handlers
    Array.from(element.attributes).some(attr => 
      attr.name.startsWith('data-') && 
      (attr.name.includes('key') || attr.name.includes('keyboard'))
    );
  
  // Check if element has click handlers
  const hasClickHandler = element.hasAttribute('onclick') ||
    // Check for React-specific data attributes that might indicate event handlers
    Array.from(element.attributes).some(attr => 
      attr.name.startsWith('data-') && 
      attr.name.includes('click')
    );
  
  // Check if element is interactive but doesn't have keyboard handlers
  const interactive = hasClickHandler || 
    ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  
  // For buttons and links, we'll assume they have built-in keyboard handlers
  const hasBuiltInKeyboardHandlers = 
    ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  
  if (interactive && !hasKeyboardHandler && !hasBuiltInKeyboardHandlers) {
    issues.push('Interactive element has no keyboard event handlers');
  }
  
  // Check if element has appropriate ARIA role
  const hasAriaRole = element.hasAttribute('role');
  
  // Native elements have implicit roles, so we only check custom elements
  const needsExplicitRole = interactive && 
    !['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase());
  
  if (needsExplicitRole && !hasAriaRole) {
    issues.push('Interactive element has no ARIA role');
  }
  
  return {
    focusable,
    interactive,
    hasKeyboardHandler,
    hasClickHandler,
    hasAriaRole,
    issues
  };
}

/**
 * Finds all interactive elements in a container
 * @param container The container element to search
 * @returns Array of interactive elements
 */
export function findInteractiveElements(container: HTMLElement): HTMLElement[] {
  // Get all potentially interactive elements
  const interactiveSelectors = [
    'a', 'button', 'input', 'select', 'textarea',
    '[tabindex]', '[onclick]', '[role="button"]', '[role="link"]',
    '[role="checkbox"]', '[role="radio"]', '[role="switch"]',
    '[role="tab"]', '[role="menuitem"]'
  ];
  
  const elements = Array.from(
    container.querySelectorAll(interactiveSelectors.join(','))
  ) as HTMLElement[];
  
  return elements;
}

/**
 * Checks keyboard accessibility for all interactive elements in a container
 * @param container The container element to check
 * @returns Object with accessibility issues for each element
 */
export function checkKeyboardAccessibility(container: HTMLElement): {
  elements: HTMLElement[];
  issues: { element: HTMLElement; issues: string[] }[];
} {
  const elements = findInteractiveElements(container);
  const issues: { element: HTMLElement; issues: string[] }[] = [];
  
  elements.forEach(element => {
    const result = isKeyboardAccessible(element);
    if (result.issues.length > 0) {
      issues.push({
        element,
        issues: result.issues
      });
    }
  });
  
  return {
    elements,
    issues
  };
} 