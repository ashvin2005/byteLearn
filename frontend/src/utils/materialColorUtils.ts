

// Type declarations
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  surface: string;
  error: string;
}

export interface ColorPalette {
  light: ThemeColors;
  dark: ThemeColors;
  source: string;
  colorHex: string[];
}

export interface ExtractedColors {
  primary: string;
  secondary: string;
  textColor: string;
  accentColor: string;
}

// ================================================================
// COLOR CONVERSION UTILITIES
// ================================================================

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Convert RGB to HSV color space for better color analysis
export const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
};

// Convert HSV to RGB
export const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  v /= 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// HSV to hex
export const hsvToHex = (h: number, s: number, v: number): string => {
  const [r, g, b] = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
};

// Hex to HSV
export const hexToHsv = (hex: string): [number, number, number] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// HSL to RGB
export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// HSL to hex
export const hslToHex = (h: number, s: number, l: number): string => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

// Hex to HSL
export const hexToHsl = (hex: string): [number, number, number] | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

// ================================================================
// COLOR SAMPLING AND ANALYSIS
// ================================================================

// Calculate color distance in RGB space
const colorDistance = (color1: [number, number, number], color2: [number, number, number]): number => {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Calculate perceptual weight of a color in an image


// Detect if a color is a skin tone (to avoid using skin tones for theming)


// ================================================================
// COLOR ACCESSIBILITY UTILITIES
// ================================================================

// Calculate relative luminance (for WCAG contrast)
export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Convert RGB to linear values
  const linearize = (c: number): number => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate contrast ratio between two colors (WCAG)
export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Ensure minimum contrast ratio by adjusting color
export const ensureContrast = (bgColor: string, fgColor: string, minRatio = 4.5): string => {
  const contrast = getContrastRatio(bgColor, fgColor);
  if (contrast >= minRatio) return fgColor;

  const hsv = hexToHsv(fgColor);
  if (!hsv) return fgColor;

  const [h, s, v] = hsv;
  const bgLuminance = getLuminance(bgColor);

  // Adjust value (brightness) to increase contrast
  let newV = v;
  const step = 5;
  let iterations = 0;

  while (getContrastRatio(bgColor, hsvToHex(h, s, newV)) < minRatio && iterations < 20) {
    // If background is dark, make foreground lighter
    // If background is light, make foreground darker
    if (bgLuminance < 0.5) {
      newV = Math.min(100, newV + step);
    } else {
      newV = Math.max(0, newV - step);
    }
    iterations++;
  }

  // If we couldn't reach contrast by brightness alone, adjust saturation
  if (getContrastRatio(bgColor, hsvToHex(h, s, newV)) < minRatio) {
    let newS = s;

    while (getContrastRatio(bgColor, hsvToHex(h, newS, newV)) < minRatio && iterations < 40) {
      newS = bgLuminance < 0.5 ? Math.max(0, newS - step) : Math.min(100, newS + step);
      iterations++;
    }

    return hsvToHex(h, newS, newV);
  }

  return hsvToHex(h, s, newV);
};

// Simple YIQ formula for contrast assessment
export const getContrastYIQ = (hexcolor: string): number => {
  const rgb = hexToRgb(hexcolor);
  if (!rgb) return 128;

  const { r, g, b } = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Get text color based on background
export const getTextColor = (bgColor: string): string => {
  return getContrastYIQ(bgColor) >= 128 ? "#000000" : "#ffffff";
};

// ================================================================
// COLOR HARMONY AND PALETTE GENERATION
// ================================================================

// Get analogous colors
export const getAnalogousColors = (hex: string, angle = 30): string[] => {
  const hsv = hexToHsv(hex);
  if (!hsv) return [hex];

  const [h, s, v] = hsv;

  return [
    hsvToHex((h - angle + 360) % 360, s, v),
    hex,
    hsvToHex((h + angle) % 360, s, v)
  ];
};

// Get complementary color
export const getComplementaryColor = (hex: string): string => {
  const hsv = hexToHsv(hex);
  if (!hsv) return hex;

  const [h, s, v] = hsv;
  return hsvToHex((h + 180) % 360, s, v);
};

// Get triadic colors
export const getTriadicColors = (hex: string): string[] => {
  const hsv = hexToHsv(hex);
  if (!hsv) return [hex];

  const [h, s, v] = hsv;

  return [
    hex,
    hsvToHex((h + 120) % 360, s, v),
    hsvToHex((h + 240) % 360, s, v)
  ];
};

// Function to check color similarity
export const areSimilarColors = (color1: string, color2: string, threshold = 30): boolean => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return false;

  return colorDistance(
    [rgb1.r, rgb1.g, rgb1.b],
    [rgb2.r, rgb2.g, rgb2.b]
  ) < threshold;
};

// ================================================================
// IMAGE ANALYSIS AND COLOR EXTRACTION
// ================================================================

// Update the extractColors function for more accurate color selection
export const extractColors = async (imageUrl: string): Promise<string[]> => {
  if (!imageUrl) return [];

  return new Promise<string[]>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        // Create a canvas to sample the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx || !img.complete || img.naturalWidth === 0) {
          resolve([]);
          return;
        }

        // Use larger dimensions for more accurate sampling
        const maxSize = 800; // Larger size to capture more detail
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas for analysis
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        // Create a precise color histogram - count exact pixel colors
        const colorMap = new Map<string, { count: number; rgb: [number, number, number] }>();
        const totalPixels = width * height;

        // Sample every pixel without skewing
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            // Skip transparent pixels
            if (pixels[i + 3] < 128) continue;

            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Skip pure white/black pixels
            if ((r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)) {
              continue;
            }

            // Use finer quantization to preserve more color detail
            // But still group similar colors
            const quantFactor = 4; // Very fine quantization
            const qR = Math.round(r / quantFactor) * quantFactor;
            const qG = Math.round(g / quantFactor) * quantFactor;
            const qB = Math.round(b / quantFactor) * quantFactor;

            const colorKey = `${qR},${qG},${qB}`;

            if (colorMap.has(colorKey)) {
              const existing = colorMap.get(colorKey)!;
              existing.count += 1; // Count each pixel equally (no weighting)
            } else {
              colorMap.set(colorKey, {
                count: 1,
                rgb: [qR, qG, qB]
              });
            }
          }
        }

        // Convert to array for sorting
        const colorEntries = Array.from(colorMap.entries());

        // Sort by pure frequency first - get the truly dominant colors
        const sortedByFrequency = colorEntries
          .map(([, data]) => {
            const { rgb, count } = data;
            const [r, g, b] = rgb;
            const hex = rgbToHex(r, g, b);
            const hsv = rgbToHsv(r, g, b);

            return {
              hex,
              rgb: [r, g, b] as [number, number, number],
              hsv: [hsv[0], hsv[1], hsv[2]] as [number, number, number],
              count,
              frequency: count / totalPixels
            };
          })
          // Filter out very dark, very light, and very desaturated colors
          .filter(color => {
            const [, s, v] = color.hsv;
            return s > 8 && v > 10 && v < 95;
          })
          // Sort by pure frequency
          .sort((a, b) => b.count - a.count);

        // Group colors into distinct color families
        const distinctColorGroups: Array<typeof sortedByFrequency[0][]> = [];

        // Process in frequency order
        for (const color of sortedByFrequency) {
          // Check if this color belongs to any existing group
          let foundGroup = false;
          for (const group of distinctColorGroups) {
            const seed = group[0]; // First color in group is the seed

            // Use a custom "is same color" function specialized for finding distinct colors
            if (isVisuallyDistinctColor(seed.rgb, color.rgb)) {
              group.push(color);
              foundGroup = true;
              break;
            }
          }

          // If not found in any group, create a new group
          if (!foundGroup) {
            distinctColorGroups.push([color]);
          }
        }

        // Sort groups by total frequency (sum of all colors in group)
        distinctColorGroups.sort((a, b) => {
          const totalA = a.reduce((sum, color) => sum + color.count, 0);
          const totalB = b.reduce((sum, color) => sum + color.count, 0);
          return totalB - totalA;
        });

        // Take the most representative color from each group (highest frequency)
        const selectedColors: string[] = [];

        // Get at least 5 distinct colors if possible
        for (let i = 0; i < Math.min(distinctColorGroups.length, 5); i++) {
          const group = distinctColorGroups[i];
          // Sort group by frequency and take the most frequent
          group.sort((a, b) => b.count - a.count);
          selectedColors.push(group[0].hex);
        }

        resolve(selectedColors);
      } catch (error) {
        console.error('Error extracting colors:', error);
        resolve([]);
      }
    };

    img.onerror = () => {
      console.error('Error loading image for color extraction');
      resolve([]);
    };

    img.src = imageUrl;
  });
};

// New function to determine if colors are visually distinct
function isVisuallyDistinctColor(rgb1: [number, number, number], rgb2: [number, number, number]): boolean {
  // Convert to HSV for better comparison
  const hsv1 = rgbToHsv(rgb1[0], rgb1[1], rgb1[2]);
  const hsv2 = rgbToHsv(rgb2[0], rgb2[1], rgb2[2]);

  // Calculate hue distance (accounting for circular nature of hue)
  const hueDiff = Math.min(Math.abs(hsv1[0] - hsv2[0]), 360 - Math.abs(hsv1[0] - hsv2[0]));

  // Calculate saturation and value differences
  const satDiff = Math.abs(hsv1[1] - hsv2[1]);
  const valDiff = Math.abs(hsv1[2] - hsv2[2]);

  // Colors are in the same family if:
  // 1. Hue is very similar (within 15 degrees)
  // 2. Saturation and value are reasonably similar
  return hueDiff < 15 && satDiff < 25 && valDiff < 25;
}

// Legacy function to maintain compatibility
export const extractColorsFromImage = (imageUrl: string): Promise<ExtractedColors> => {
  return new Promise((resolve) => {
    // Default colors in case extraction fails
    const defaultColors: ExtractedColors = {
      primary: "#6750A4",
      secondary: "#958DA5",
      textColor: "#ffffff",
      accentColor: "#B58392",
    };

    if (!imageUrl) {
      resolve(defaultColors);
      return;
    }

    // Use the advanced extraction method
    extractColors(imageUrl)
      .then(colors => {
        if (colors.length >= 3) {
          const primary = colors[0];

          // Find a secondary color with good contrast
          let secondary = colors[1];

          // Find an accent color that stands out more
          let accentColor = colors[2];

          // Ensure the colors work well together
          if (areSimilarColors(primary, secondary, 20)) {
            // If too similar, get an analogous color
            const alternatives = getAnalogousColors(primary);
            secondary = alternatives[2]; // Take the alternate analogous color
          }

          if (areSimilarColors(primary, accentColor, 20) || areSimilarColors(secondary, accentColor, 20)) {
            // If accent is too similar to primary/secondary, use a complementary color
            accentColor = getComplementaryColor(primary);
          }

          const textColor = getTextColor(primary);

          resolve({
            primary,
            secondary,
            textColor,
            accentColor
          });
        } else {
          resolve(defaultColors);
        }
      })
      .catch(() => resolve(defaultColors));
  });
};

// Now update the theme generation to create better backgrounds and use the actual image colors
export const generateThemePalette = (colors: string[]): ColorPalette => {
  if (!colors || colors.length < 3) {
    // Default Material 3 baseline theme
    return {
      light: {
        primary: '#6750A4',
        secondary: '#958DA5',
        tertiary: '#B58392',
        background: '#FFFBFE',
        surface: '#FDF8FD',
        error: '#B3261E'
      },
      dark: {
        primary: '#D0BCFF',
        secondary: '#CCC2DC',
        tertiary: '#EFB8C8',
        background: '#1C1B1F',
        surface: '#2B2930',
        error: '#F2B8B5'
      },
      source: '#6750A4',
      colorHex: ['#6750A4']
    };
  }

  // Use the top 3 distinct colors directly - no substitutions
  const primaryColor = colors[0];
  const secondaryColor = colors[1];
  const tertiaryColor = colors[2];

  // Get HSV values for all colors
  const primaryHsv = hexToHsv(primaryColor) || [0, 0, 0];

  // ============ LIGHT THEME ============

  // Create a more noticeable background tint from the primary color
  // Use MUCH higher saturation than previous algorithms
  const lightBackgroundHsv: [number, number, number] = [
    primaryHsv[0], // Use primary hue directly
    Math.min(Math.max(15, primaryHsv[1] / 5), 25), // Higher saturation (15-25%)
    97 // Slightly off-white
  ];

  // Create a more saturated and distinct surface based on the same color
  const lightSurfaceHsv: [number, number, number] = [
    primaryHsv[0],
    Math.min(Math.max(20, primaryHsv[1] / 4), 30), // Even higher saturation (20-30%)
    94 // Slightly darker than background
  ];

  // Convert to hex
  const lightBackground = hsvToHex(...lightBackgroundHsv);
  const lightSurface = hsvToHex(...lightSurfaceHsv);

  // Standard error color
  const lightError = '#B3261E';

  // Ensure good contrast
  const lightPrimary = ensureContrast(lightBackground, primaryColor, 4.5);
  const lightSecondary = ensureContrast(lightBackground, secondaryColor, 3.5);
  const lightTertiary = ensureContrast(lightBackground, tertiaryColor, 3.5);

  // ============ DARK THEME ============

  // Create a rich background with stronger color presence
  const darkBackgroundHsv: [number, number, number] = [
    primaryHsv[0],
    Math.min(Math.max(20, primaryHsv[1] / 3), 35), // Much higher saturation (20-35%)
    10 // Very dark
  ];

  // More saturated surface
  const darkSurfaceHsv: [number, number, number] = [
    primaryHsv[0],
    Math.min(Math.max(25, primaryHsv[1] / 2.5), 40), // Even higher saturation (25-40%)
    16 // Slightly lighter than background
  ];

  const darkBackground = hsvToHex(...darkBackgroundHsv);
  const darkSurface = hsvToHex(...darkSurfaceHsv);

  // Standard error color
  const darkError = '#F2B8B5';

  // Adjust colors for better visibility in dark theme
  const darkPrimary = adjustBrightnessSaturation(primaryColor, 18, -5, darkBackground, 4.5);
  const darkSecondary = adjustBrightnessSaturation(secondaryColor, 18, -5, darkBackground, 3.5);
  const darkTertiary = adjustBrightnessSaturation(tertiaryColor, 18, -5, darkBackground, 3.5);

  return {
    light: {
      primary: lightPrimary,
      secondary: lightSecondary,
      tertiary: lightTertiary,
      background: lightBackground,
      surface: lightSurface,
      error: lightError
    },
    dark: {
      primary: darkPrimary,
      secondary: darkSecondary,
      tertiary: darkTertiary,
      background: darkBackground,
      surface: darkSurface,
      error: darkError
    },
    source: primaryColor,
    colorHex: colors
  };
};

// Utility to adjust brightness and saturation while ensuring contrast
function adjustBrightnessSaturation(
  color: string,
  brightnessChange: number,
  saturationChange: number,
  bgColor: string,
  minContrast = 4.5
): string {
  const hsv = hexToHsv(color);
  if (!hsv) return color;

  const [h, s, v] = hsv;

  // Adjust brightness and saturation
  const newV = Math.min(100, Math.max(0, v + brightnessChange));
  const newS = Math.min(100, Math.max(0, s + saturationChange));

  let adjusted = hsvToHex(h, newS, newV);

  // Ensure it meets contrast requirements
  if (getContrastRatio(bgColor, adjusted) < minContrast) {
    adjusted = ensureContrast(bgColor, adjusted, minContrast);
  }

  return adjusted;
}