/**
 * Utility function to conditionally join classNames
 * Simple alternative to clsx + tailwind-merge
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Turbidity normalization utilities
 * Turbidity is normalized from 0-1000 NTU to 0-1 scale where:
 * - 0 represents optimal/clear water
 * - 1 represents dangerous/very cloudy water
 */

/**
 * Get a color based on normalized turbidity (0 = good, 1 = bad)
 * @param normalizedTurbidity - Normalized value between 0 and 1
 * @returns Color name for UI display
 */
export function getTurbidityColor(normalizedTurbidity: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (normalizedTurbidity <= 0.3) return 'green';
  if (normalizedTurbidity <= 0.5) return 'yellow';
  if (normalizedTurbidity <= 0.7) return 'orange';
  return 'red';
}

/**
 * Get a descriptive status based on normalized turbidity
 * @param normalizedTurbidity - Normalized value between 0 and 1
 * @returns Status description
 */
export function getTurbidityStatus(normalizedTurbidity: number): 'Excellent' | 'Good' | 'Fair' | 'Warning' | 'Danger' {
  if (normalizedTurbidity <= 0.1) return 'Excellent';
  if (normalizedTurbidity <= 0.3) return 'Good';
  if (normalizedTurbidity <= 0.5) return 'Fair';
  if (normalizedTurbidity <= 0.7) return 'Warning';
  return 'Danger';
}

/**
 * Get turbidity description
 * @param normalizedTurbidity - Normalized value between 0 and 1
 * @param rawValue - Original raw turbidity value in NTU
 * @returns Human-readable description
 */
export function getTurbidityDescription(normalizedTurbidity: number, rawValue: number): string {
  const status = getTurbidityStatus(normalizedTurbidity);

  if (status === 'Excellent' || status === 'Good') {
    return `Water is clear at ${rawValue.toFixed(2)} NTU (optimal: <5 NTU)`;
  } else if (status === 'Fair') {
    return `Slight cloudiness detected at ${rawValue.toFixed(2)} NTU`;
  } else if (status === 'Warning') {
    return `High turbidity at ${rawValue.toFixed(2)} NTU`;
  } else {
    return `CRITICAL: Very high turbidity at ${rawValue.toFixed(2)} NTU`;
  }
}
