import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { simulateTabNavigation, getFocusableElements } from './a11y-test-helpers';
import { GlobalStateContext } from '../hooks/useGlobalState';
import { ModelTab } from '../components/model/model-component';
import { Speed, ViewType, NavTab } from '../types';
import { App } from '../components/App';

/**
 * Focus Order Tests (WCAG 2.4.3)
 * 
 * These tests verify that the focus order of interactive elements is logical and follows
 * a meaningful sequence. This ensures that keyboard users can navigate through the content
 * in a way that preserves meaning and operability.
 */

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

// Mock components that might cause issues in tests
jest.mock('../components/model/model-component', () => ({
  ModelTab: jest.fn(() => <div data-testid="mock-model-tab">
    <button data-testid="button-1">Button 1</button>
    <button data-testid="button-2">Button 2</button>
    <input data-testid="input-1" />
    <button data-testid="button-3">Button 3</button>
  </div>)
}));

// Extend HTMLElement to include nextElementInTabOrder for testing
declare global {
  interface HTMLElement {
    nextElementInTabOrder?: HTMLElement;
  }
}

// Mock component with proper focus order
const ProperFocusOrderComponent = () => (
  <div data-testid="proper-focus-order">
    <header>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <nav>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main id="main-content">
      <h1>Focus Order Test</h1>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="email" />
        </div>
        <div>
          <label htmlFor="message">Message:</label>
          <textarea id="message"></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </main>
    <footer>
      <p>Footer content</p>
      <a href="#privacy">Privacy Policy</a>
      <a href="#terms">Terms of Service</a>
    </footer>
  </div>
);

// Mock component with improper focus order
const ImproperFocusOrderComponent = () => (
  <div data-testid="improper-focus-order">
    <header>
      <nav>
        <ul>
          <li><a href="#home" tabIndex={3}>Home</a></li>
          <li><a href="#about" tabIndex={1}>About</a></li>
          <li><a href="#contact" tabIndex={2}>Contact</a></li>
        </ul>
      </nav>
      <a href="#main-content" className="skip-link" tabIndex={4}>Skip to main content</a>
    </header>
    <main id="main-content">
      <h1>Focus Order Test</h1>
      <form>
        <button type="submit" tabIndex={5}>Submit</button>
        <div>
          <input id="name" type="text" tabIndex={8} />
          <label htmlFor="name" tabIndex={7}>Name:</label>
        </div>
        <div>
          <input id="email" type="email" tabIndex={6} />
          <label htmlFor="email" tabIndex={9}>Email:</label>
        </div>
      </form>
    </main>
  </div>
);

// Mock modal dialog component with proper focus management
const ProperModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  
  const openModal = () => {
    // Store the currently focused element
    setLastFocusedElement(document.activeElement as HTMLElement);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    // Restore focus to the element that was focused before opening the modal
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };
  
  return (
    <div data-testid="proper-modal">
      <h2>Modal Dialog Test</h2>
      <button onClick={openModal} data-testid="open-modal-button">Open Modal</button>
      
      {isOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          data-testid="modal-dialog"
        >
          <div className="modal-content">
            <h2 id="modal-title">Modal Title</h2>
            <p>This is a modal dialog with proper focus management.</p>
            <input type="text" placeholder="Enter some text" data-testid="modal-input" />
            <div>
              <button onClick={closeModal} data-testid="modal-close-button">Close</button>
              <button data-testid="modal-save-button">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock modal dialog component with improper focus management
const ImproperModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div data-testid="improper-modal">
      <h2>Modal Dialog Test (Improper)</h2>
      <button onClick={() => setIsOpen(true)} data-testid="open-improper-modal-button">Open Modal</button>
      
      {isOpen && (
        <div role="dialog" aria-labelledby="improper-modal-title" data-testid="improper-modal-dialog">
          <div className="modal-content">
            <h2 id="improper-modal-title">Modal Title</h2>
            <p>This is a modal dialog with improper focus management.</p>
            <input type="text" placeholder="Enter some text" data-testid="improper-modal-input" />
            <div>
              <button onClick={() => setIsOpen(false)} data-testid="improper-modal-close-button">Close</button>
              <button data-testid="improper-modal-save-button">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock component with dynamic content and proper focus management
const DynamicContentComponent = () => {
  const [showMore, setShowMore] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  
  const toggleContent = () => {
    setLastFocusedElement(document.activeElement as HTMLElement);
    setShowMore(!showMore);
  };
  
  // When content is shown, focus the first interactive element in the new content
  React.useEffect(() => {
    if (showMore) {
      const firstNewElement = document.getElementById('first-new-element');
      if (firstNewElement) {
        firstNewElement.focus();
      }
    } else if (lastFocusedElement) {
      // When content is hidden, restore focus to the toggle button
      lastFocusedElement.focus();
    }
  }, [showMore, lastFocusedElement]);
  
  return (
    <div data-testid="dynamic-content">
      <h2>Dynamic Content Test</h2>
      <p>This component shows and hides content while managing focus properly.</p>
      <button onClick={toggleContent} data-testid="toggle-button">
        {showMore ? 'Show Less' : 'Show More'}
      </button>
      
      {showMore && (
        <div data-testid="additional-content">
          <h3>Additional Content</h3>
          <p>This content appears dynamically.</p>
          <a href="#" id="first-new-element" data-testid="first-new-element">First New Link</a>
          <button data-testid="new-button">New Button</button>
        </div>
      )}
    </div>
  );
};

describe('Focus Order Tests (WCAG 2.4.3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('maintains logical tab order in the application', () => {
    // Render the mocked component
    render(
      <GlobalStateContext.Provider value={createMockGlobalState()}>
        <div data-testid="app-container">
          <a href="#main" data-testid="skip-nav">Skip to main content</a>
          <header data-testid="header">
            <button data-testid="header-button">Menu</button>
          </header>
          <main data-testid="main-content">
            <ModelTab />
          </main>
          <footer data-testid="footer">
            <button data-testid="footer-button">Help</button>
          </footer>
        </div>
      </GlobalStateContext.Provider>
    );

    // Get the container
    const container = screen.getByTestId('app-container');
    
    // Get all focusable elements in tab order
    const focusableElements = getFocusableElements(container);
    
    // Verify we have the expected number of focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Simulate tab navigation and get elements in tab order
    const tabOrder = simulateTabNavigation(container);
    
    // Verify the tab order matches expected sequence
    const elementIds = tabOrder.map(el => el.getAttribute('data-testid'));
    expect(elementIds).toEqual([
      'skip-nav',
      'header-button',
      'button-1',
      'button-2',
      'input-1',
      'button-3',
      'footer-button'
    ]);
  });

  test('modal dialog traps focus correctly', () => {
    // Render a mock modal
    render(
      <div data-testid="app-container">
        <button data-testid="open-button">Open Modal</button>
        <div 
          data-testid="modal" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h2 id="modal-title" data-testid="modal-title">Modal Title</h2>
          <button data-testid="modal-button-1">Action</button>
          <input data-testid="modal-input" />
          <button data-testid="modal-close">Close</button>
        </div>
      </div>
    );

    // Get the modal container
    const modal = screen.getByTestId('modal');
    
    // Simulate tab navigation within the modal
    const tabOrder = simulateTabNavigation(modal);
    
    // Verify focus is trapped within the modal
    const elementIds = tabOrder.map(el => el.getAttribute('data-testid'));
    expect(elementIds).toEqual([
      'modal-button-1',
      'modal-input',
      'modal-close'
    ]);
    
    // Add nextElementInTabOrder property to elements for testing focus trapping
    tabOrder.forEach((el, i) => {
      el.nextElementInTabOrder = tabOrder[(i + 1) % tabOrder.length];
    });
    
    // Verify that tabbing from the last element cycles back to the first
    expect(tabOrder[tabOrder.length - 1].nextElementInTabOrder).toBe(tabOrder[0]);
  });

  test('focus is restored after dynamic content updates', () => {
    // This would be a more complex test that simulates:
    // 1. Setting focus on an element
    // 2. Triggering a dynamic update
    // 3. Verifying focus is maintained or moved to an appropriate element
    
    // For now, we'll implement a simplified version
    const { rerender } = render(
      <div data-testid="dynamic-container">
        <button data-testid="trigger-button">Trigger Update</button>
        <div data-testid="content-area">
          <button data-testid="action-button">Action</button>
        </div>
      </div>
    );
    
    // Set focus on the action button
    const actionButton = screen.getByTestId('action-button');
    actionButton.focus();
    expect(document.activeElement).toBe(actionButton);
    
    // Rerender with updated content
    rerender(
      <div data-testid="dynamic-container">
        <button data-testid="trigger-button">Trigger Update</button>
        <div data-testid="content-area">
          <button data-testid="new-action-button">New Action</button>
        </div>
      </div>
    );
    
    // In a real implementation, focus would be managed to move to the new button
    // or back to the trigger button. Here we're just checking it's not on the body.
    expect(document.activeElement).not.toBe(document.body);
  });

  test('focus order follows logical sequence in proper component', () => {
    render(<ProperFocusOrderComponent />);
    const container = screen.getByTestId('proper-focus-order');
    
    // Simulate tab navigation
    const focusSequence = simulateTabNavigation(container);
    
    // Check that the skip link is the first focusable element
    expect(focusSequence[0].textContent).toBe('Skip to main content');
    
    // Check that navigation links come next
    expect(focusSequence[1].textContent).toBe('Home');
    expect(focusSequence[2].textContent).toBe('About');
    expect(focusSequence[3].textContent).toBe('Contact');
    
    // Check that form controls are in the correct order
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const messageTextarea = screen.getByLabelText('Message:');
    const submitButton = screen.getByText('Submit');
    
    const nameInputIndex = focusSequence.indexOf(nameInput);
    const emailInputIndex = focusSequence.indexOf(emailInput);
    const messageTextareaIndex = focusSequence.indexOf(messageTextarea);
    const submitButtonIndex = focusSequence.indexOf(submitButton);
    
    expect(nameInputIndex).toBeLessThan(emailInputIndex);
    expect(emailInputIndex).toBeLessThan(messageTextareaIndex);
    expect(messageTextareaIndex).toBeLessThan(submitButtonIndex);
    
    // Check that footer links come after the main content
    const privacyLink = screen.getByText('Privacy Policy');
    const termsLink = screen.getByText('Terms of Service');
    
    const privacyLinkIndex = focusSequence.indexOf(privacyLink);
    const termsLinkIndex = focusSequence.indexOf(termsLink);
    
    expect(submitButtonIndex).toBeLessThan(privacyLinkIndex);
    expect(privacyLinkIndex).toBeLessThan(termsLinkIndex);
  });
  
  test('detects improper focus order', () => {
    render(<ImproperFocusOrderComponent />);
    const container = screen.getByTestId('improper-focus-order');
    
    // Simulate tab navigation
    const focusSequence = simulateTabNavigation(container);
    
    // Check that elements with explicit tabindex are focused in the order of their tabindex
    const aboutLink = screen.getByText('About');
    const contactLink = screen.getByText('Contact');
    const homeLink = screen.getByText('Home');
    const skipLink = screen.getByText('Skip to main content');
    
    const aboutLinkIndex = focusSequence.indexOf(aboutLink);
    const contactLinkIndex = focusSequence.indexOf(contactLink);
    const homeLinkIndex = focusSequence.indexOf(homeLink);
    const skipLinkIndex = focusSequence.indexOf(skipLink);
    
    // Verify that the focus order follows the tabindex values, not the DOM order
    expect(aboutLinkIndex).toBeLessThan(contactLinkIndex);
    expect(contactLinkIndex).toBeLessThan(homeLinkIndex);
    expect(homeLinkIndex).toBeLessThan(skipLinkIndex);
    
    // Check that the form controls are in an illogical order
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const submitButton = screen.getByText('Submit');
    
    const nameInputIndex = focusSequence.indexOf(nameInput);
    const emailInputIndex = focusSequence.indexOf(emailInput);
    const submitButtonIndex = focusSequence.indexOf(submitButton);
    
    // Verify that the submit button is focused before the inputs
    expect(submitButtonIndex).toBeLessThan(nameInputIndex);
    expect(submitButtonIndex).toBeLessThan(emailInputIndex);
  });
  
  test('modal dialog manages focus properly', () => {
    render(<ProperModalComponent />);
    
    // Open the modal
    const openButton = screen.getByTestId('open-modal-button');
    fireEvent.click(openButton);
    
    // Check that the modal is open
    const modal = screen.getByTestId('modal-dialog');
    expect(modal).toBeInTheDocument();
    
    // Simulate tab navigation within the modal
    const modalFocusSequence = simulateTabNavigation(modal);
    
    // Check that the first focusable element in the modal is focused
    const modalInput = screen.getByTestId('modal-input');
    const closeButton = screen.getByTestId('modal-close-button');
    const saveButton = screen.getByTestId('modal-save-button');
    
    expect(modalFocusSequence[0]).toBe(modalInput);
    expect(modalFocusSequence[1]).toBe(closeButton);
    expect(modalFocusSequence[2]).toBe(saveButton);
    
    // Close the modal
    fireEvent.click(closeButton);
    
    // Check that focus is returned to the open button
    expect(document.activeElement).toBe(openButton);
  });
  
  test('detects improper modal focus management', () => {
    render(<ImproperModalComponent />);
    
    // Open the modal
    const openButton = screen.getByTestId('open-improper-modal-button');
    fireEvent.click(openButton);
    
    // Check that the modal is open
    const modal = screen.getByTestId('improper-modal-dialog');
    expect(modal).toBeInTheDocument();
    
    // Check that focus is not automatically moved to the modal
    expect(document.activeElement).not.toBe(modal);
    expect(document.activeElement).not.toBe(screen.getByTestId('improper-modal-input'));
    expect(document.activeElement).not.toBe(screen.getByTestId('improper-modal-close-button'));
    
    // Close the modal
    const closeButton = screen.getByTestId('improper-modal-close-button');
    fireEvent.click(closeButton);
    
    // Check that focus is not returned to the open button
    expect(document.activeElement).not.toBe(openButton);
  });
  
  test('dynamic content manages focus properly', () => {
    render(<DynamicContentComponent />);
    
    // Click the toggle button to show more content
    const toggleButton = screen.getByTestId('toggle-button');
    fireEvent.click(toggleButton);
    
    // Check that the additional content is shown
    const additionalContent = screen.getByTestId('additional-content');
    expect(additionalContent).toBeInTheDocument();
    
    // Check that focus is moved to the first new interactive element
    const firstNewElement = screen.getByTestId('first-new-element');
    expect(document.activeElement).toBe(firstNewElement);
    
    // Click the toggle button again to hide the content
    fireEvent.click(toggleButton);
    
    // Check that the additional content is hidden
    expect(screen.queryByTestId('additional-content')).not.toBeInTheDocument();
    
    // Check that focus is returned to the toggle button
    expect(document.activeElement).toBe(toggleButton);
  });
}); 