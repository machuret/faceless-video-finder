
/**
 * Utility functions for calculating channel revenue metrics
 */

/**
 * Calculate the potential total revenue based on views and CPM
 */
export const calculatePotentialRevenue = (totalViews: number | null, cpm: number | null): number | null => {
  if (!totalViews || !cpm) return null;
  return Math.round((totalViews / 1000) * cpm);
};

/**
 * Calculate the average revenue per video
 */
export const calculateRevenuePerVideo = (
  totalViews: number | null, 
  cpm: number | null, 
  videoCount: number | null
): number | null => {
  if (!totalViews || !cpm || !videoCount || videoCount === 0) return null;
  return Math.round(((totalViews / 1000) * cpm) / videoCount);
};

/**
 * Calculate the average revenue per month
 */
export const calculateRevenuePerMonth = (
  totalViews: number | null,
  cpm: number | null,
  startDate: string | null
): number | null => {
  if (!totalViews || !cpm || !startDate) return null;

  const start = new Date(startDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + 
                    (now.getMonth() - start.getMonth());
  
  if (monthsDiff === 0) {
    return Math.round((totalViews / 1000) * cpm);
  }

  const averageViewsPerMonth = totalViews / monthsDiff;
  
  return Math.round((averageViewsPerMonth / 1000) * cpm);
};
