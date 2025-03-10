import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeedSlider } from './model-speed-slider';
import { Speed, speedLabels } from '../../types';
import { useGlobalStateContext } from '../../hooks/useGlobalState';

// Mock the useGlobalStateContext hook
jest.mock('../../hooks/useGlobalState', () => ({
  useGlobalStateContext: jest.fn()
}));

describe('SpeedSlider Component', () => {
  const mockSetGlobalState = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useGlobalStateContext as jest.Mock).mockReturnValue({
      globalState: { speed: Speed.Medium },
      setGlobalState: mockSetGlobalState
    });
  });

  it('renders with the correct initial speed value', () => {
    render(<SpeedSlider />);
    
    // Check that the slider has the correct value
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue(Speed.Medium.toString());
    
    // Check that the speed text is displayed - use a more specific selector
    expect(screen.getByText(speedLabels[Speed.Medium], { selector: '#speed-text' })).toBeInTheDocument();
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

  it('renders tick marks for each speed option', () => {
    render(<SpeedSlider />);
    
    // Check that there are tick marks for each speed option
    const tickMarksContainer = document.querySelector('.tick-marks-container');
    const tickMarks = tickMarksContainer?.querySelectorAll('.tick-mark');
    expect(tickMarks?.length).toBe(Object.keys(speedLabels).length);
  });

  // Tests for new functionality

  it('updates speed when a tick mark is clicked', () => {
    render(<SpeedSlider />);
    
    // Find all tick marks
    const tickMarks = document.querySelectorAll('.tick-mark');
    
    // Click on the Fast tick mark (index 2)
    fireEvent.click(tickMarks[2]);
    
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
    const tickMarks = document.querySelectorAll('.tick-mark');
    
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
