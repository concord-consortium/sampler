/**
 * Screen reader testing utilities
 * These utilities help test screen reader announcements and accessibility
 */

import { render, RenderResult } from '@testing-library/react';
import { axe } from 'jest-axe';

/**
 * Analyzes a component for screen reader accessibility
 * @param element The React element to analyze
 * @returns Object with accessibility information
 */
export async function analyzeScreenReaderAccessibility(
  element: React.ReactElement
): Promise<{
  ariaAttributes: Record<string, string[]>;
  roles: string[];
  landmarks: string[];
  axeResults: any;
  renderResult: RenderResult;
}> {
  const renderResult = render(element);
  const { container } = renderResult;
  
  // Collect ARIA attributes
  const ariaAttributes: Record<string, string[]> = {};
  const allElements = container.querySelectorAll('*');
  
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        const attrName = attr.name;
        if (!ariaAttributes[attrName]) {
          ariaAttributes[attrName] = [];
        }
        ariaAttributes[attrName].push(attr.value);
      }
    });
  });
  
  // Collect roles
  const roles: string[] = [];
  const elementsWithRoles = container.querySelectorAll('[role]');
  elementsWithRoles.forEach(el => {
    const role = el.getAttribute('role');
    if (role) {
      roles.push(role);
    }
  });
  
  // Collect landmarks
  const landmarks: string[] = [];
  const landmarkRoles = [
    'banner', 'complementary', 'contentinfo', 'form', 
    'main', 'navigation', 'region', 'search'
  ];
  
  landmarkRoles.forEach(role => {
    const elements = container.querySelectorAll(`[role="${role}"]`);
    elements.forEach(() => {
      landmarks.push(role);
    });
  });
  
  // Also check for implicit landmarks
  const implicitLandmarkMap: Record<string, string> = {
    'header': 'banner',
    'nav': 'navigation',
    'main': 'main',
    'aside': 'complementary',
    'footer': 'contentinfo',
    'form[aria-labelledby], form[aria-label]': 'form',
    'section[aria-labelledby], section[aria-label]': 'region'
  };
  
  Object.entries(implicitLandmarkMap).forEach(([selector, landmark]) => {
    const elements = container.querySelectorAll(selector);
    elements.forEach(() => {
      landmarks.push(landmark);
    });
  });
  
  // Run axe for comprehensive accessibility check
  const axeResults = await axe(container);
  
  return {
    ariaAttributes,
    roles,
    landmarks,
    axeResults,
    renderResult
  };
}

/**
 * Checks if an element is properly labeled for screen readers
 * @param element The HTML element to check
 * @returns Object with information about the element's labeling
 */
export function checkElementLabeling(element: HTMLElement): {
  hasAccessibleName: boolean;
  accessibleName: string | null;
  labelingMethod: string | null;
} {
  // Check for aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return {
      hasAccessibleName: true,
      accessibleName: ariaLabel,
      labelingMethod: 'aria-label'
    };
  }
  
  // Check for aria-labelledby
  const ariaLabelledby = element.getAttribute('aria-labelledby');
  if (ariaLabelledby) {
    const labelElement = document.getElementById(ariaLabelledby);
    const labelText = labelElement?.textContent || null;
    return {
      hasAccessibleName: !!labelText,
      accessibleName: labelText,
      labelingMethod: 'aria-labelledby'
    };
  }
  
  // Check for associated label (for form controls)
  if (['input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      const labelText = label?.textContent || null;
      if (labelText) {
        return {
          hasAccessibleName: true,
          accessibleName: labelText,
          labelingMethod: 'label element'
        };
      }
    }
  }
  
  // Check for button/link text content
  if (['button', 'a'].includes(element.tagName.toLowerCase())) {
    const textContent = element.textContent?.trim() || null;
    if (textContent) {
      return {
        hasAccessibleName: true,
        accessibleName: textContent,
        labelingMethod: 'text content'
      };
    }
    
    // Check for title attribute as fallback
    const title = element.getAttribute('title');
    if (title) {
      return {
        hasAccessibleName: true,
        accessibleName: title,
        labelingMethod: 'title attribute'
      };
    }
    
    // Check for aria-describedby
    const ariaDescribedby = element.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      const descElement = document.getElementById(ariaDescribedby);
      const descText = descElement?.textContent || null;
      return {
        hasAccessibleName: !!descText,
        accessibleName: descText,
        labelingMethod: 'aria-describedby'
      };
    }
  }
  
  // No accessible name found
  return {
    hasAccessibleName: false,
    accessibleName: null,
    labelingMethod: null
  };
}

/**
 * Checks if an element has proper focus management for screen readers
 * @param element The HTML element to check
 * @returns Object with information about the element's focus management
 */
export function checkFocusManagement(element: HTMLElement): {
  isFocusable: boolean;
  hasFocusStyles: boolean;
  tabIndex: number | null;
} {
  // Check if element is focusable
  const focusableElements = ['a', 'button', 'input', 'select', 'textarea'];
  const isFocusableTag = focusableElements.includes(element.tagName.toLowerCase());
  
  // Check tabindex
  const tabIndexAttr = element.getAttribute('tabindex');
  const tabIndex = tabIndexAttr !== null ? parseInt(tabIndexAttr, 10) : null;
  
  // Element is focusable if it's a focusable tag or has a non-negative tabindex
  const isFocusable = isFocusableTag || (tabIndex !== null && tabIndex >= 0);
  
  // Check for focus styles (this is a simplified check)
  const computedStyle = window.getComputedStyle(element);
  const hasFocusStyles = computedStyle.outlineStyle !== 'none' || 
                         computedStyle.outlineWidth !== '0px' ||
                         computedStyle.outlineColor !== 'transparent';
  
  return {
    isFocusable,
    hasFocusStyles,
    tabIndex
  };
} 