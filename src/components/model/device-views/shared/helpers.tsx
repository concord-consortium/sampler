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
