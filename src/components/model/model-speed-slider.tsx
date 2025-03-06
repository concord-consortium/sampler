import React, { useRef } from "react";
import { useGlobalStateContext } from "../../hooks/useGlobalState";
import { Speed, speedLabels } from "../../types";

export const SpeedSlider = () => {
  const { globalState, setGlobalState } = useGlobalStateContext();
  const { speed } = globalState;
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    setGlobalState(draft => {
      draft.speed = newSpeed;
    });
  };

  // Handle click on tick marks or labels
  const handleTickClick = (speedValue: Speed) => {
    setGlobalState(draft => {
      draft.speed = speedValue;
    });
    // Focus the slider after clicking a tick
    if (sliderRef.current) {
      sliderRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        if (speed < Speed.Fastest) {
          setGlobalState(draft => {
            draft.speed = speed + 1;
          });
        }
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        if (speed > Speed.Slow) {
          setGlobalState(draft => {
            draft.speed = speed - 1;
          });
        }
        event.preventDefault();
        break;
      case 'Home':
        setGlobalState(draft => {
          draft.speed = Speed.Slow;
        });
        event.preventDefault();
        break;
      case 'End':
        setGlobalState(draft => {
          draft.speed = Speed.Fastest;
        });
        event.preventDefault();
        break;
    }
  };

  // Generate tick marks for each speed option
  const renderTickMarks = () => {
    return Object.values(Speed)
      .filter(value => !isNaN(parseInt(value.toString(), 10)))
      .map(speedValue => {
        const isActive = parseInt(speedValue.toString(), 10) === speed;
        return (
          <div 
            className={`tick-mark ${isActive ? 'active' : ''}`} 
            key={`tick-${speedValue}`}
            onClick={() => handleTickClick(speedValue as Speed)}
            role="button"
            tabIndex={-1}
            aria-label={`Set speed to ${speedLabels[speedValue as Speed]}`}
          >
            <div className="tick-line"/>
            <span className="tick-label">{speedLabels[speedValue as Speed]}</span>
          </div>
        );
      });
  };

  return (
    <div className="speed-slider">
      <input
        ref={sliderRef}
        type="range"
        min={Speed.Slow}
        max={Speed.Fastest}
        value={speed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step={1}
        list="speedSettings"
        className="slider"
        aria-label="Animation Speed"
        aria-valuemin={Speed.Slow}
        aria-valuemax={Speed.Fastest}
        aria-valuenow={speed}
        aria-valuetext={speedLabels[speed]}
      />
      <div className="tick-marks-container">
        {renderTickMarks()}
      </div>
      <span id="speed-text" data-text={`DG.plugin.Sampler.top-bar.${speedLabels[speed].toLowerCase()}-speed`}>
        {speedLabels[speed]}
      </span>
    </div>
  );
};
