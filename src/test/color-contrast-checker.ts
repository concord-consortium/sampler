/**
 * Color contrast checker utility for accessibility testing
 * Based on WCAG 2.0 guidelines for color contrast
 */

/**
 * Converts a hex color to RGB
 * @param hex Hex color code (e.g., #FFFFFF)
 * @returns RGB values as an object {r, g, b}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const bigint = parseInt(hex, 16);
  
  // Handle different hex formats (3 or 6 digits)
  if (hex.length === 3) {
    const r = ((bigint >> 8) & 0xF) / 15 * 255;
    const g = ((bigint >> 4) & 0xF) / 15 * 255;
    const b = (bigint & 0xF) / 15 * 255;
    return { r, g, b };
  } else if (hex.length === 6) {
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
  
  return null;
}

/**
 * Converts RGB values to relative luminance
 * @param rgb RGB values as an object {r, g, b}
 * @returns Relative luminance value
 */
export function getLuminance(rgb: { r: number; g: number; b: number }): number {
  // Convert RGB to sRGB
  const sRGB = {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  };
  
  // Apply transformation
  const transformed = {
    r: sRGB.r <= 0.03928 ? sRGB.r / 12.92 : Math.pow((sRGB.r + 0.055) / 1.055, 2.4),
    g: sRGB.g <= 0.03928 ? sRGB.g / 12.92 : Math.pow((sRGB.g + 0.055) / 1.055, 2.4),
    b: sRGB.b <= 0.03928 ? sRGB.b / 12.92 : Math.pow((sRGB.b + 0.055) / 1.055, 2.4)
  };
  
  // Calculate luminance
  return 0.2126 * transformed.r + 0.7152 * transformed.g + 0.0722 * transformed.b;
}

/**
 * Calculates the contrast ratio between two colors
 * @param color1 First color in hex format (e.g., #FFFFFF)
 * @param color2 Second color in hex format (e.g., #000000)
 * @returns Contrast ratio as a number
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format');
  }
  
  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);
  
  // Calculate contrast ratio
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if a color combination meets WCAG 2.0 AA standards
 * @param foreground Foreground color in hex format (e.g., #FFFFFF)
 * @param background Background color in hex format (e.g., #000000)
 * @param isLargeText Whether the text is large (>=18pt or >=14pt bold)
 * @returns Object with contrast ratio and whether it passes AA standards
 */
export function meetsWCAG2AA(foreground: string, background: string, isLargeText = false): { ratio: number; passes: boolean } {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 3.0 : 4.5;
  
  return {
    ratio,
    passes: ratio >= threshold
  };
}

/**
 * Checks if a color combination meets WCAG 2.0 AAA standards
 * @param foreground Foreground color in hex format (e.g., #FFFFFF)
 * @param background Background color in hex format (e.g., #000000)
 * @param isLargeText Whether the text is large (>=18pt or >=14pt bold)
 * @returns Object with contrast ratio and whether it passes AAA standards
 */
export function meetsWCAG2AAA(foreground: string, background: string, isLargeText = false): { ratio: number; passes: boolean } {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 4.5 : 7.0;
  
  return {
    ratio,
    passes: ratio >= threshold
  };
}

/**
 * Extracts colors from a CSS string
 * @param css CSS string
 * @returns Array of hex colors found in the CSS
 */
export function extractColorsFromCSS(css: string): string[] {
  const hexColorRegex = /#([0-9A-Fa-f]{3}){1,2}\b/g;
  const rgbColorRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  
  const hexColors = css.match(hexColorRegex) || [];
  const rgbColors = Array.from(css.matchAll(rgbColorRegex)).map(match => {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return rgbToHex(r, g, b);
  });
  
  return [...hexColors, ...rgbColors];
}

/**
 * Converts RGB values to hex color
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
} 