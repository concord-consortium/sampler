import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../components/App';

describe('Skip Navigation Link', () => {
  test('skip navigation link should be present and have correct attributes', () => {
    render(<App />);
    
    // Find the skip navigation link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    
    // Initially, the skip link should not be visible (CSS will handle this)
    // But it should be in the DOM
    expect(skipLink.tagName.toLowerCase()).toBe('a');
    expect(skipLink).toHaveAttribute('href', '#main-content');
    
    // Verify that the main content area exists and has the correct attributes
    const mainContent = document.getElementById('main-content');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveAttribute('tabIndex', '-1');
    expect(mainContent).toHaveAttribute('role', 'main');
  });
  
  test('navigation tabs should be keyboard accessible', () => {
    render(<App />);
    
    // Find all tab elements
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
    
    // Check that each tab is keyboard accessible
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('tabIndex', '0');
      
      // Simulate pressing Enter on a tab
      fireEvent.keyDown(tab, { key: 'Enter' });
      expect(tab).toHaveAttribute('aria-selected', 'true');
    });
  });
}); 