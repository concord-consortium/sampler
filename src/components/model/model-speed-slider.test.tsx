import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeedSlider } from './model-speed-slider';
import { useGlobalStateContext } from '../../hooks/useGlobalState';
import { Speed, speedLabels } from '../../types';

// Mock the useGlobalStateContext hook
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('SpeedSlider Component', () => {
  // Mock the setGlobalState function
  const mockSetGlobalState = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the useGlobalStateContext hook to return a default state
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Medium },
      setGlobalState: mockSetGlobalState
    });
  });
  
  it('renders the speed slider with the correct initial speed', () => {
    render(<SpeedSlider />);
    
    // Check that the speed text is displayed
    expect(screen.getByText('Speed:')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
  
  it('renders tick marks for each speed option', () => {
    render(<SpeedSlider />);
    
    // Check that there are tick marks for each speed option
    const tickMarks = screen.getAllByTestId(/tick-mark/);
    expect(tickMarks.length).toBe(Object.keys(speedLabels).length);
  });

  // Tests for new functionality

  it('updates speed when a tick mark is clicked', () => {
    render(<SpeedSlider />);
    
    // Find all tick marks
    const tickMarks = screen.getAllByTestId(/tick-mark/);
    
    // Click on the Fast tick mark (index 2)
    fireEvent.click(tickMarks[2]);
    
    // Check that setGlobalState was called with the correct speed
    expect(mockSetGlobalState).toHaveBeenCalled();
    
    // Get the callback function passed to setGlobalState
    const callback = mockSetGlobalState.mock.calls[0][0];
    
    // Create a draft state to pass to the callback
    const draftState = { speed: Speed.Medium };
    
    // Call the callback with the draft state
    callback(draftState);
    
    // Check that the draft state was updated correctly
    expect(draftState.speed).toBe(Speed.Fast);
  });
  
  it('highlights the active speed option', () => {
    // Set the initial speed to Fast
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Fast },
      setGlobalState: mockSetGlobalState
    });
    
    render(<SpeedSlider />);
    
    // Find all tick marks
    const tickMarks = screen.getAllByTestId(/tick-mark/);
    
    // Check that the Fast tick mark (index 2) has the active class
    expect(tickMarks[2]).toHaveClass('active');
    
    // Check that the other tick marks don't have the active class
    expect(tickMarks[0]).not.toHaveClass('active');
    expect(tickMarks[1]).not.toHaveClass('active');
    expect(tickMarks[3]).not.toHaveClass('active');
  });

  it('updates global state when slider value changes', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Change the slider value
    fireEvent.change(slider, { target: { value: Speed.Fast } });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fast);
  });

  it('shows the active tick mark based on current speed', () => {
    // Set the initial speed to Fast
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Fast },
      setGlobalState: mockSetGlobalState
    });
    
    render(<SpeedSlider />);
    
    // Find all tick marks
    const tickMarks = screen.getAllByTestId(/tick-mark/);
    
    // Check that the Fast tick mark (index 2) has the active class
    expect(tickMarks[2]).toHaveClass('active');
    
    // Check that the other tick marks don't have the active class
    expect(tickMarks[0]).not.toHaveClass('active');
    expect(tickMarks[1]).not.toHaveClass('active');
    expect(tickMarks[3]).not.toHaveClass('active');
  });

  it('updates the speed text when speed changes', () => {
    render(<SpeedSlider />);
    
    // Find the slider
    const slider = screen.getByRole('slider');
    
    // Change the slider value to Fast
    fireEvent.change(slider, { target: { value: Speed.Fast } });
    
    // Mock the global state update
    const setStateFn = mockSetGlobalState.mock.calls[0][0];
    const draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    
    // Re-render with the updated state
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Fast },
      setGlobalState: mockSetGlobalState
    });
    
    // Re-render the component
    const { rerender } = render(<SpeedSlider />);
    rerender(<SpeedSlider />);
    
    // Now check for the updated text using a more specific selector
    const speedText = screen.getByText('Fast', { selector: '#speed-text' });
    expect(speedText).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<SpeedSlider />);
    
    const slider = screen.getByRole('slider');
    
    // Press right arrow to increase speed
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    let setStateFn = mockSetGlobalState.mock.calls[0][0];
    let draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fast);
    
    // Reset mock
    mockSetGlobalState.mockClear();
    
    // Press left arrow to decrease speed
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    setStateFn = mockSetGlobalState.mock.calls[0][0];
    draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Slow);
    
    // Reset mock
    mockSetGlobalState.mockClear();
    
    // Press End key to set to fastest
    fireEvent.keyDown(slider, { key: 'End' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    setStateFn = mockSetGlobalState.mock.calls[0][0];
    draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Fastest);
    
    // Reset mock
    mockSetGlobalState.mockClear();
    
    // Press Home key to set to slowest
    fireEvent.keyDown(slider, { key: 'Home' });
    
    // Check that setGlobalState was called with the correct value
    expect(mockSetGlobalState).toHaveBeenCalled();
    setStateFn = mockSetGlobalState.mock.calls[0][0];
    draftState = { speed: Speed.Medium };
    setStateFn(draftState);
    expect(draftState.speed).toBe(Speed.Slow);
  });
});
