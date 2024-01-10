import { kSpinnerRadius, kSpinnerX, kSpinnerY } from "./constants";

export const getVariableColor = (i: number, slices: number, lighten: boolean) => {
  const baseColorHue = 171;
  const hueDiff = Math.min(15, 60/slices);
  const hue = (baseColorHue + (hueDiff * i)) % 360;
  const lightPerc = 66 + (lighten ? 15 : 0);
  return `hsl(${hue}, 71%, ${lightPerc}%)`;
};

export const getTextShift = (text: string, maxLetters: number) => {
  const lettersOver = Math.max(0, text.length - maxLetters);
  return (0.2 * lettersOver) + "em";
};

export const calculateWedgePercentage = ({cx, cy, x1, y1, x2, y2}: Record<string, number>) => {
  // calculate angles in radians
  const angle1 = Math.atan2(y1 - cy, x1 - cx);
  const angle2 = Math.atan2(y2 - cy, x2 - cx);

  // calculate the angle between the two points
  let angle = angle2 - angle1;

  // handle cases where the angle crosses the boundary between -π and π
  if (angle < 0) {
      angle += 2 * Math.PI;
  }

  // calculate the percentage of the circle's circumference
  const percentage = (angle / (2 * Math.PI)) * 100;

  return percentage;
};

export const getCoordinatesForPercent = (percent: number, radius: number = kSpinnerRadius) => {
  const perc = percent + 0.75; // rotate 3/4 to start at top
  const x = kSpinnerX + (Math.cos(2 * Math.PI * perc) * radius);
  const y = kSpinnerY + (Math.sin(2 * Math.PI * perc) * radius);
  return [x, y];
};
