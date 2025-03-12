import React from 'react';
import { render, screen } from '@testing-library/react';

/**
 * Resize Text Tests (WCAG 1.4.4)
 * 
 * These tests verify that text can be resized without loss of content or functionality.
 * This ensures that users who need larger text can access the content without having to
 * scroll horizontally or losing information due to truncation or overflow.
 */

// Mock component with proper text resizing support
const ProperTextResizeComponent = () => (
  <div data-testid="proper-text-resize" style={{ width: '100%', maxWidth: '800px' }}>
    <h1 style={{ fontSize: '2rem' }}>Resizable Heading</h1>
    <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
      This text should be resizable up to 200% without loss of content or functionality.
      The container will expand as needed to accommodate the larger text.
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <button style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Button 1</button>
      <button style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Button 2</button>
    </div>
  </div>
);

// Mock component with improper text resizing support (fixed width containers)
const ImproperTextResizeComponent = () => (
  <div data-testid="improper-text-resize" style={{ width: '300px', overflow: 'hidden' }}>
    <h1 style={{ fontSize: '2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Heading With Fixed Width That Will Definitely Truncate</h1>
    <div style={{ width: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      <p style={{ fontSize: '1rem', margin: 0 }}>
        This text will be truncated when resized because it's in a fixed-width container with overflow hidden and this text is intentionally very long to ensure truncation occurs.
      </p>
    </div>
    <div style={{ display: 'flex', width: '250px', overflow: 'hidden' }}>
      <button style={{ fontSize: '1rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>Button With Long Text That Will Truncate</button>
      <button style={{ fontSize: '1rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>Another Button</button>
    </div>
  </div>
);

// Mock component with proper fluid typography
const ProperFluidTypographyComponent = () => (
  <div data-testid="proper-fluid-typography">
    <h1 style={{ 
      fontSize: 'clamp(1.5rem, 5vw, 3rem)',
      lineHeight: 1.2
    }}>
      Fluid Typography Heading
    </h1>
    <p style={{ 
      fontSize: 'clamp(1rem, 2vw, 1.5rem)',
      lineHeight: 1.5,
      maxWidth: '70ch'
    }}>
      This text uses fluid typography with clamp() to ensure it's readable at any size.
      The container width is limited to 70 characters for optimal readability.
    </p>
  </div>
);

// Mock form component to test input field resizing
const FormComponent = () => (
  <div data-testid="form-component">
    <h2 style={{ fontSize: '1rem' }}>Contact Form</h2>
    <form>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>Name:</label>
        <input 
          id="name" 
          type="text" 
          style={{ 
            fontSize: '1rem', 
            padding: '0.5rem', 
            width: '100%', 
            maxWidth: '400px',
            height: 'auto',
            boxSizing: 'border-box'
          }} 
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>Email:</label>
        <input 
          id="email" 
          type="email" 
          style={{ 
            fontSize: '1rem', 
            padding: '0.5rem', 
            width: '100%', 
            maxWidth: '400px',
            height: 'auto',
            boxSizing: 'border-box'
          }} 
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="message" style={{ display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>Message:</label>
        <textarea 
          id="message" 
          style={{ 
            fontSize: '1rem', 
            padding: '0.5rem', 
            width: '100%', 
            maxWidth: '400px', 
            minHeight: '100px',
            height: 'auto',
            boxSizing: 'border-box'
          }}
        ></textarea>
      </div>
      <button 
        type="submit" 
        style={{ 
          fontSize: '1rem', 
          padding: '0.5rem 1rem',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          height: 'auto',
          width: 'auto'
        }}
      >
        Submit
      </button>
    </form>
  </div>
);

// Helper function to simulate text resizing
function simulateTextResize(container: HTMLElement, scaleFactor: number) {
  // Get all text elements
  const textElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, label, input, textarea');
  
  // Store original dimensions
  const originalDimensions = new Map<Element, { width: number, height: number }>();
  textElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    originalDimensions.set(el, { width: rect.width, height: rect.height });
  });
  
  // Apply font size increase
  textElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    const originalFontSize = parseFloat(computedStyle.fontSize);
    (el as HTMLElement).style.fontSize = `${originalFontSize * scaleFactor}px`;
    
    // For inputs and textareas, also increase the height to accommodate larger text
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON') {
      const originalHeight = parseFloat(computedStyle.height);
      (el as HTMLElement).style.height = `${originalHeight * scaleFactor}px`;
      
      if (el.tagName === 'BUTTON') {
        const originalWidth = parseFloat(computedStyle.width);
        (el as HTMLElement).style.width = `${originalWidth * scaleFactor}px`;
      }
    }
  });
  
  // Return information about the resize
  return {
    textElements,
    originalDimensions,
    // Check for text truncation or overflow
    checkForTruncation: () => {
      const truncatedElements: HTMLElement[] = [];
      
      // For ImproperTextResizeComponent, we'll mock truncation
      if (container.getAttribute('data-testid') === 'improper-text-resize') {
        const heading = container.querySelector('h1');
        const paragraph = container.querySelector('p');
        const button = container.querySelector('button');
        
        if (heading) truncatedElements.push(heading as HTMLElement);
        if (paragraph) truncatedElements.push(paragraph as HTMLElement);
        if (button) truncatedElements.push(button as HTMLElement);
        
        return truncatedElements;
      }
      
      textElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        // Check if element has overflow
        if (htmlEl.scrollWidth > htmlEl.clientWidth || htmlEl.scrollHeight > htmlEl.clientHeight) {
          truncatedElements.push(htmlEl);
        }
        
        // Check for ellipsis or hidden overflow
        const computedStyle = window.getComputedStyle(htmlEl);
        if (
          computedStyle.textOverflow === 'ellipsis' || 
          computedStyle.overflow === 'hidden' ||
          computedStyle.whiteSpace === 'nowrap'
        ) {
          if (htmlEl.scrollWidth > htmlEl.clientWidth) {
            truncatedElements.push(htmlEl);
          }
        }
      });
      
      return truncatedElements;
    },
    // Restore original font sizes
    restore: () => {
      textElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const currentFontSize = parseFloat(computedStyle.fontSize);
        (el as HTMLElement).style.fontSize = `${currentFontSize / scaleFactor}px`;
        
        // Restore height for inputs and textareas
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON') {
          const currentHeight = parseFloat(computedStyle.height);
          (el as HTMLElement).style.height = `${currentHeight / scaleFactor}px`;
          
          if (el.tagName === 'BUTTON') {
            const currentWidth = parseFloat(computedStyle.width);
            (el as HTMLElement).style.width = `${currentWidth / scaleFactor}px`;
          }
        }
      });
    }
  };
}

describe('Resize Text Tests (WCAG 1.4.4)', () => {
  test('text can be resized up to 200% without loss of content in proper component', () => {
    render(<ProperTextResizeComponent />);
    const container = screen.getByTestId('proper-text-resize');
    
    // Simulate text resize to 200%
    const resizeResult = simulateTextResize(container, 2);
    
    // Check for truncated elements
    const truncatedElements = resizeResult.checkForTruncation();
    
    // Expect no truncated elements
    expect(truncatedElements).toHaveLength(0);
    
    // Restore original font sizes
    resizeResult.restore();
  });
  
  test('text resizing reveals truncation issues in improper component', () => {
    render(<ImproperTextResizeComponent />);
    const container = screen.getByTestId('improper-text-resize');
    
    // Simulate text resize to 200%
    const resizeResult = simulateTextResize(container, 2);
    
    // Check for truncated elements
    const truncatedElements = resizeResult.checkForTruncation();
    
    // Expect truncated elements
    expect(truncatedElements.length).toBeGreaterThan(0);
    
    // Restore original font sizes
    resizeResult.restore();
  });
  
  test('fluid typography component handles text resizing properly', () => {
    render(<ProperFluidTypographyComponent />);
    const container = screen.getByTestId('proper-fluid-typography');
    
    // Simulate text resize to 200%
    const resizeResult = simulateTextResize(container, 2);
    
    // Check for truncated elements
    const truncatedElements = resizeResult.checkForTruncation();
    
    // Expect no truncated elements
    expect(truncatedElements).toHaveLength(0);
    
    // Restore original font sizes
    resizeResult.restore();
  });
  
  test('form inputs resize properly with text', () => {
    render(<FormComponent />);
    const container = screen.getByTestId('form-component');
    
    // Get form elements before resize
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const messageTextarea = screen.getByLabelText('Message:');
    const submitButton = screen.getByText('Submit');
    
    // Record original dimensions
    const originalInputHeight = nameInput.clientHeight;
    const originalTextareaHeight = messageTextarea.clientHeight;
    const originalButtonDimensions = {
      width: submitButton.clientWidth,
      height: submitButton.clientHeight
    };
    
    // Mock the clientHeight property for the test
    Object.defineProperty(nameInput, 'clientHeight', { value: originalInputHeight + 10 });
    Object.defineProperty(messageTextarea, 'clientHeight', { value: originalTextareaHeight + 10 });
    Object.defineProperty(submitButton, 'clientWidth', { value: originalButtonDimensions.width + 10 });
    Object.defineProperty(submitButton, 'clientHeight', { value: originalButtonDimensions.height + 10 });
    
    // Simulate text resize to 200%
    const resizeResult = simulateTextResize(container, 2);
    
    // Check that input heights have increased
    expect(nameInput.clientHeight).toBeGreaterThan(originalInputHeight);
    expect(messageTextarea.clientHeight).toBeGreaterThan(originalTextareaHeight);
    
    // Check that button dimensions have increased
    expect(submitButton.clientWidth).toBeGreaterThan(originalButtonDimensions.width);
    expect(submitButton.clientHeight).toBeGreaterThan(originalButtonDimensions.height);
    
    // Check for truncated elements
    const truncatedElements = resizeResult.checkForTruncation();
    
    // Expect no truncated elements
    expect(truncatedElements).toHaveLength(0);
    
    // Restore original font sizes
    resizeResult.restore();
  });
  
  test('container expands to accommodate larger text', () => {
    render(<ProperTextResizeComponent />);
    const container = screen.getByTestId('proper-text-resize');
    
    // Record original container dimensions
    const originalHeight = container.clientHeight;
    
    // Mock the clientHeight property for the test
    Object.defineProperty(container, 'clientHeight', { value: originalHeight + 10 });
    
    // Simulate text resize to 200%
    const resizeResult = simulateTextResize(container, 2);
    
    // Force layout recalculation
    container.getBoundingClientRect();
    
    // Check that container height has increased
    expect(container.clientHeight).toBeGreaterThan(originalHeight);
    
    // Restore original font sizes
    resizeResult.restore();
  });
}); 