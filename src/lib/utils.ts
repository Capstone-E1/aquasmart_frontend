/**
 * Utility function to conditionally join classNames
 * Simple alternative to clsx + tailwind-merge
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Water parameter normalization utilities
 * All normalization functions return a value from 0 to 1 where:
 * - 0 represents optimal/good condition
 * - 1 represents dangerous/critical condition
 */

export type WaterParameter = 'ph' | 'turbidity' | 'tds';

/**
 * Get a color based on normalized value (0 = good, 1 = bad)
 * @param normalized - Normalized value between 0 and 1
 * @returns Color name for UI display
 */
export function getNormalizedColor(normalized: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (normalized <= 0.3) return 'green';
  if (normalized <= 0.5) return 'yellow';
  if (normalized <= 0.7) return 'orange';
  return 'red';
}

/**
 * Get a descriptive status based on normalized value
 * @param normalized - Normalized value between 0 and 1
 * @returns Status description
 */
export function getNormalizedStatus(normalized: number): 'Excellent' | 'Good' | 'Fair' | 'Warning' | 'Danger' {
  if (normalized <= 0.1) return 'Excellent';
  if (normalized <= 0.3) return 'Good';
  if (normalized <= 0.5) return 'Fair';
  if (normalized <= 0.7) return 'Warning';
  return 'Danger';
}

/**
 * Get parameter-specific description
 * @param type - Parameter type
 * @param normalized - Normalized value between 0 and 1
 * @param rawValue - Original raw value
 * @returns Human-readable description
 */
export function getParameterDescription(
  type: WaterParameter,
  normalized: number,
  rawValue: number
): string {
  const status = getNormalizedStatus(normalized);

  switch (type) {
    case 'ph':
      if (status === 'Excellent' || status === 'Good') {
        return `pH is optimal at ${rawValue.toFixed(1)} (ideal: 6.5-8.5)`;
      } else if (status === 'Fair') {
        return `pH is slightly off at ${rawValue.toFixed(1)}`;
      } else if (status === 'Warning') {
        return `pH requires attention at ${rawValue.toFixed(1)}`;
      } else {
        return `CRITICAL: pH is dangerous at ${rawValue.toFixed(1)}`;
      }

    case 'turbidity':
      if (status === 'Excellent' || status === 'Good') {
        return `Water is clear at ${rawValue.toFixed(2)} NTU (optimal: <5 NTU)`;
      } else if (status === 'Fair') {
        return `Slight cloudiness detected at ${rawValue.toFixed(2)} NTU`;
      } else if (status === 'Warning') {
        return `High turbidity at ${rawValue.toFixed(2)} NTU`;
      } else {
        return `CRITICAL: Very high turbidity at ${rawValue.toFixed(2)} NTU`;
      }

    case 'tds':
      if (status === 'Excellent' || status === 'Good') {
        return `TDS is optimal at ${rawValue} ppm (ideal: 300-600 ppm)`;
      } else if (status === 'Fair') {
        return `TDS is acceptable at ${rawValue} ppm`;
      } else if (status === 'Warning') {
        return `TDS requires attention at ${rawValue} ppm`;
      } else {
        return `CRITICAL: TDS is ${rawValue < 150 ? 'too low' : 'too high'} at ${rawValue} ppm`;
      }

    default:
      return `Status: ${status}`;
  }
}
