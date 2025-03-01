
/**
 * Calculates the estimated ad value of YouTube content based on engagement metrics
 */
export const calculateReachValue = (
  views: number,
  likes: number,
  dislikes: number,
  comments: number,
  shares: number
) => {
  // Base CPM (cost per 1000 impressions) for YouTube ads - varies by industry
  const baseCpmRate = 7.00; // $7.00 per 1000 views is an average
  
  // Engagement weights (higher weights for more valuable engagement types)
  const likeWeight = 0.05;
  const commentWeight = 0.15;
  const shareWeight = 0.30;
  const dislikeWeight = -0.02; // Negative impact from dislikes
  
  // Calculate engagement score
  const engagementScore = (
    (likes * likeWeight) + 
    (comments * commentWeight) + 
    (shares * shareWeight) + 
    (dislikes * dislikeWeight)
  ) / Math.max(views, 1); // Prevent division by zero
  
  // Apply engagement multiplier (baseline 1.0, can go higher with good engagement)
  const engagementMultiplier = 1.0 + engagementScore;
  
  // Calculate effective CPM based on engagement
  const effectiveCpm = baseCpmRate * engagementMultiplier;
  
  // Calculate total value
  const totalValue = (views / 1000) * effectiveCpm;
  
  // Calculate value per user
  const valuePerUser = views > 0 ? totalValue / views : 0;
  
  return {
    totalValue,
    cpm: effectiveCpm,
    valuePerUser,
    engagementMultiplier
  };
};

// Calculate engagement rate from raw metrics
export const calculateEngagementRate = (
  views: number,
  likes: number,
  comments: number,
  shares: number
) => {
  const totalEngagements = likes + comments + shares;
  return views > 0 ? (totalEngagements / views) * 100 : 0;
};
