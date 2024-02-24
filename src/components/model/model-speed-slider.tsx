import React, {useState} from "react";

export const SpeedSlider = () => {
  const [value, setValue] = useState(1);
  const speedValue = ["slow", "medium", "fast", "fastest"];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(event.target.value, 10)); // Parse the value as an integer
  };

  return (
    <div className="speed-slider">
      <input
        type="range"
        min={0}
        max={3}
        value={value}
        onChange={handleChange}
        step={1}
        list="speedSettings"
        className="slider"
      />
      <div className="tick-marks-container">
          {speedValue.map((speed, i) => {
            return (
              <div className="tick-mark" key={`tick-${i}`}>
                <div className="tick-line"/>
              </div>
            );
          })}
      </div>
      <span id="speed-text" data-text={`DG.plugin.sampler.speed.${speedValue[value]}`} />
    </div>
  );
};
