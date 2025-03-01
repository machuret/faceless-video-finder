
/**
 * Calculates the growth rate between two values
 * @param startValue The starting value
 * @param endValue The ending value
 * @returns The growth rate as a percentage
 */
export const calculateGrowthRate = (
  startValue: number,
  endValue: number
): number => {
  // Check if startValue is zero to avoid division by zero
  if (startValue === 0) {
    return 0;
  }
  
  const difference = endValue - startValue;
  const growthRate = (difference / startValue) * 100;
  
  return growthRate;
};

/**
 * Classifies a growth rate based on industry benchmarks
 * @param growthRate The calculated growth rate
 * @returns A classification string
 */
export const classifyGrowthRate = (growthRate: number): string => {
  if (growthRate > 5) {
    return "exceptional";
  } else if (growthRate > 2) {
    return "excellent";
  } else if (growthRate > 0.55) {
    return "above-average";
  } else if (growthRate > 0) {
    return "positive";
  } else if (growthRate === 0) {
    return "stable";
  } else {
    return "declining";
  }
};
