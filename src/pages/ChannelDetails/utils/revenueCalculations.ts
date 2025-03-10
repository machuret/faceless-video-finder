
/**
 * Utility functions for channel revenue and statistics calculations
 */

/**
 * Calculate total revenue from views and CPM
 */
export const calculateTotalRevenue = (totalViews?: number, cpm?: number): number | null => {
  if (!totalViews || !cpm || totalViews <= 0 || cpm <= 0) return null;
  // Formula: Total Revenue = (Total Views / 1000) * CPM
  return Math.round((totalViews / 1000) * cpm);
};

/**
 * Calculate revenue per subscriber
 */
export const calculateRevenuePerSubscriber = (
  totalRevenue: number | null, 
  totalSubscribers?: number
): number | null => {
  if (!totalRevenue || !totalSubscribers || totalSubscribers <= 0) return null;
  return Number((totalRevenue / totalSubscribers).toFixed(2));
};

/**
 * Calculate revenue per video
 */
export const calculateRevenuePerVideo = (
  totalRevenue: number | null, 
  videoCount?: number
): number | null => {
  if (!totalRevenue || !videoCount || videoCount <= 0) return null;
  return Math.round(totalRevenue / videoCount);
};

/**
 * Calculate potential revenue for next 12 months
 * Assuming a modest 5% growth rate per month if not specified
 */
export const calculatePotentialRevenue = (totalRevenue: number | null, growthRate = 0.05): number | null => {
  if (!totalRevenue) return null;
  
  // Base calculation is current monthly revenue
  let baseMonthlyRevenue = totalRevenue / 12;
  
  // Add growth component - assuming 5% monthly growth compounded
  const monthlyGrowthRate = growthRate; // 5% monthly growth by default
  let potentialRevenue = 0;
  
  for (let i = 0; i < 12; i++) {
    // For each month, calculate that month's revenue with compound growth
    const monthRevenue = baseMonthlyRevenue * Math.pow(1 + monthlyGrowthRate, i);
    potentialRevenue += monthRevenue;
  }
  
  return Math.round(potentialRevenue);
};

/**
 * Format date in a consistent way
 */
export const formatStartDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
