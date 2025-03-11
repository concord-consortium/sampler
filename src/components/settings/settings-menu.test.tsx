import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsMenu } from './settings-menu';
import { useGlobalStateContext } from '../../hooks/useGlobalState';

// Mock the useGlobalStateContext hook
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('SettingsMenu', () => {
  const mockSetGlobalState = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the global state
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { reduceMotion: false },
      setGlobalState: mockSetGlobalState
    });
  });
  
  it('renders the settings icon button', () => {
    render(<SettingsMenu />);
    
    // Check that the settings button is rendered
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });
  
  it('opens the dropdown menu when the button is clicked', () => {
    render(<SettingsMenu />);
    
    // Check that the dropdown is not visible initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    // Click the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    // Check that the dropdown is now visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    // Check that the reduce motion checkbox is rendered
    const reduceMotionCheckbox = screen.getByRole('checkbox', { name: /reduce motion/i });
    expect(reduceMotionCheckbox).toBeInTheDocument();
  });
  
  it('toggles the reduce motion setting when the checkbox is clicked', () => {
    render(<SettingsMenu />);
    
    // Open the dropdown
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    // Check the initial state of the checkbox
    const reduceMotionCheckbox = screen.getByRole('checkbox', { name: /reduce motion/i });
    expect(reduceMotionCheckbox).not.toBeChecked();
    
    // Click the checkbox
    fireEvent.click(reduceMotionCheckbox);
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the updater function that was passed to setGlobalState
    const updaterFn = mockSetGlobalState.mock.calls[0][0];
    
    // Create a draft object to pass to the updater function
    const draft = { reduceMotion: false };
    
    // Call the updater function
    updaterFn(draft);
    
    // Check that the draft was updated correctly
    expect(draft.reduceMotion).toBe(true);
  });
  
  it('closes the dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <SettingsMenu />
      </div>
    );
    
    // Open the dropdown
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    // Check that the dropdown is visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    // Click outside the dropdown
    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outsideElement);
    
    // Check that the dropdown is no longer visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
  
  it('handles keyboard navigation', () => {
    render(<SettingsMenu />);
    
    // Get the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    
    // Press Enter to open the dropdown
    fireEvent.keyDown(settingsButton, { key: 'Enter' });
    
    // Check that the dropdown is visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    // Press Escape to close the dropdown
    fireEvent.keyDown(settingsButton, { key: 'Escape' });
    
    // Check that the dropdown is no longer visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
}); 