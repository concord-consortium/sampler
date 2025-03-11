/**
 * Visual Testing Helpers
 * 
 * This file contains utility functions to support visual accessibility testing.
 */

/**
 * Simulate text resizing in the document
 * @param size Percentage size (e.g., '200%')
 * @returns Cleanup function to restore original size
 */
export function simulateTextResize(size: string): () => void {
  // Store original font size
  const originalFontSize = document.documentElement.style.fontSize;
  
  // Set new font size
  document.documentElement.style.fontSize = size;
  
  // Return cleanup function
  return () => {
    document.documentElement.style.fontSize = originalFontSize;
  };
}

/**
 * Check if text is truncated or overflowing its container
 * @param element Element to check
 * @returns Object with result and details
 */
export function checkTextOverflow(element: HTMLElement): {
  isTruncated: boolean;
  isOverflowing: boolean;
  details: {
    scrollWidth: number;
    clientWidth: number;
    scrollHeight: number;
    clientHeight: number;
    textOverflow: string;
    overflow: string;
    whiteSpace: string;
  }
} {
  const styles = window.getComputedStyle(element);
  
  const details = {
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    textOverflow: styles.textOverflow,
    overflow: styles.overflow,
    whiteSpace: styles.whiteSpace
  };
  
  // Check for truncation (ellipsis)
  const isTruncated = styles.textOverflow === 'ellipsis' && 
                      element.scrollWidth > element.clientWidth;
  
  // Check for overflow
  const isOverflowing = (element.scrollWidth > element.clientWidth || 
                         element.scrollHeight > element.clientHeight) &&
                        styles.overflow !== 'visible';
  
  return {
    isTruncated,
    isOverflowing,
    details
  };
}

/**
 * Check if elements overlap each other
 * @param element1 First element
 * @param element2 Second element
 * @returns Whether the elements overlap
 */
export function doElementsOverlap(element1: HTMLElement, element2: HTMLElement): boolean {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

/**
 * Check if an element is fully visible in the viewport
 * @param element Element to check
 * @returns Whether the element is fully visible
 */
export function isElementFullyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Check if text containers expand appropriately with larger text
 * @param container Container element
 * @param textSize Text size to test (e.g., '200%')
 * @returns Object with result and details
 */
export function checkContainerExpansion(
  container: HTMLElement, 
  textSize: string
): {
  expandsAppropriately: boolean;
  details: {
    originalHeight: number;
    expandedHeight: number;
    originalWidth: number;
    expandedWidth: number;
    textOverflow: boolean;
  }
} {
  // Measure original dimensions
  const originalRect = container.getBoundingClientRect();
  const originalHeight = originalRect.height;
  const originalWidth = originalRect.width;
  
  // Resize text
  const cleanup = simulateTextResize(textSize);
  
  // Measure expanded dimensions
  const expandedRect = container.getBoundingClientRect();
  const expandedHeight = expandedRect.height;
  const expandedWidth = expandedRect.width;
  
  // Check for text overflow
  const textElements = Array.from(
    container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label, input, textarea')
  ) as HTMLElement[];
  
  const hasTextOverflow = textElements.some(el => {
    const { isTruncated, isOverflowing } = checkTextOverflow(el);
    return isTruncated || isOverflowing;
  });
  
  // Cleanup
  cleanup();
  
  // Determine if container expands appropriately
  const expandsAppropriately = (
    expandedHeight >= originalHeight &&
    expandedWidth >= originalWidth &&
    !hasTextOverflow
  );
  
  return {
    expandsAppropriately,
    details: {
      originalHeight,
      expandedHeight,
      originalWidth,
      expandedWidth,
      textOverflow: hasTextOverflow
    }
  };
}

/**
 * Check layout integrity at different text sizes
 * @param container Container element
 * @param textSizes Array of text sizes to test
 * @returns Object with results for each size
 */
export function checkLayoutIntegrity(
  container: HTMLElement,
  textSizes: string[] = ['100%', '125%', '150%', '175%', '200%']
): {
  [size: string]: {
    maintainsIntegrity: boolean;
    issues: Array<{
      element: HTMLElement;
      issue: string;
    }>;
  }
} {
  const results: {
    [size: string]: {
      maintainsIntegrity: boolean;
      issues: Array<{
        element: HTMLElement;
        issue: string;
      }>;
    }
  } = {};
  
  // Test each text size
  textSizes.forEach(size => {
    const issues: Array<{ element: HTMLElement; issue: string }> = [];
    
    // Resize text
    const cleanup = simulateTextResize(size);
    
    // Get all visible elements
    const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
    const visibleElements = elements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    // Check for text overflow
    const textElements = visibleElements.filter(el => 
      el.tagName === 'P' || 
      el.tagName === 'SPAN' || 
      el.tagName === 'H1' || 
      el.tagName === 'H2' || 
      el.tagName === 'H3' || 
      el.tagName === 'H4' || 
      el.tagName === 'H5' || 
      el.tagName === 'H6' || 
      el.tagName === 'A' || 
      el.tagName === 'BUTTON' || 
      el.tagName === 'LABEL' || 
      el.tagName === 'INPUT' || 
      el.tagName === 'TEXTAREA'
    );
    
    textElements.forEach(el => {
      const { isTruncated, isOverflowing } = checkTextOverflow(el);
      
      if (isTruncated) {
        issues.push({
          element: el,
          issue: 'Text is truncated'
        });
      }
      
      if (isOverflowing) {
        issues.push({
          element: el,
          issue: 'Text is overflowing its container'
        });
      }
    });
    
    // Check for element overlap
    for (let i = 0; i < visibleElements.length; i++) {
      for (let j = i + 1; j < visibleElements.length; j++) {
        if (doElementsOverlap(visibleElements[i], visibleElements[j])) {
          // Check if they're parent/child
          if (!visibleElements[i].contains(visibleElements[j]) && 
              !visibleElements[j].contains(visibleElements[i])) {
            issues.push({
              element: visibleElements[i],
              issue: `Overlaps with ${visibleElements[j].tagName.toLowerCase()}`
            });
          }
        }
      }
    }
    
    // Check if elements are fully visible
    visibleElements.forEach(el => {
      if (!isElementFullyVisible(el)) {
        issues.push({
          element: el,
          issue: 'Element is not fully visible in viewport'
        });
      }
    });
    
    // Cleanup
    cleanup();
    
    // Store results
    results[size] = {
      maintainsIntegrity: issues.length === 0,
      issues
    };
  });
  
  return results;
} 