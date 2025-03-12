
// Web Worker for handling complex calculations
// This file will be run in a separate thread from the main UI

interface RevenueAdditionalFactors {
  niche?: string;
  nicheMultipliers?: Record<string, number>;
  country?: string;
  countryMultipliers?: Record<string, number>;
  seasonalMultiplier?: number;
  months?: number;
  videoCount?: number;
}

interface RevenueCalculationParams {
  views: number;
  cpm?: number;
  monetizedViewsPercentage?: number;
  additionalFactors?: RevenueAdditionalFactors;
}

interface ViewsProjectionParams {
  currentViews: number;
  growthRate: number;
  months: number;
  videoUploadRate: number;
}

interface ViewsDataPoint {
  date: string;
  views: number;
}

interface SubscribersDataPoint {
  date: string;
  count: number;
}

interface GrowthRateParams {
  viewsData: ViewsDataPoint[];
  subscribersData?: SubscribersDataPoint[];
}

// Message handler
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'calculateChannelRevenue':
      const result = calculateChannelRevenue(data);
      self.postMessage({ type: 'revenueResult', data: result });
      break;
      
    case 'calculateViewsProjection':
      const projectionResult = calculateViewsProjection(data);
      self.postMessage({ type: 'viewsProjectionResult', data: projectionResult });
      break;
      
    case 'calculateGrowthRate':
      const growthResult = calculateGrowthRate(data);
      self.postMessage({ type: 'growthRateResult', data: growthResult });
      break;
      
    default:
      self.postMessage({ 
        type: 'error', 
        message: `Unknown calculation type: ${type}` 
      });
  }
};

// Calculate channel revenue based on views, CPM, and other factors
function calculateChannelRevenue({ 
  views, 
  cpm = 2.0, 
  monetizedViewsPercentage = 0.7, 
  additionalFactors = {}
}: RevenueCalculationParams) {
  try {
    // Basic calculation
    let revenue = (views * monetizedViewsPercentage * cpm) / 1000;
    
    // Apply additional factors if provided
    if (additionalFactors.niche && additionalFactors.nicheMultipliers) {
      const nicheMultiplier = additionalFactors.nicheMultipliers[additionalFactors.niche] || 1;
      revenue *= nicheMultiplier;
    }
    
    if (additionalFactors.country && additionalFactors.countryMultipliers) {
      const countryMultiplier = additionalFactors.countryMultipliers[additionalFactors.country] || 1;
      revenue *= countryMultiplier;
    }
    
    if (additionalFactors.seasonalMultiplier) {
      revenue *= additionalFactors.seasonalMultiplier;
    }
    
    return {
      totalRevenue: revenue,
      monthlyRevenue: revenue / (additionalFactors.months || 1),
      perVideoRevenue: revenue / (additionalFactors.videoCount || 1),
      factors: {
        appliedCpm: cpm,
        monetizedViews: views * monetizedViewsPercentage,
        appliedMultipliers: {
          niche: additionalFactors.nicheMultipliers?.[additionalFactors.niche] || 1,
          country: additionalFactors.countryMultipliers?.[additionalFactors.country] || 1,
          seasonal: additionalFactors.seasonalMultiplier || 1
        }
      }
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Calculation error' };
  }
}

// Calculate views projection based on historical data and growth rate
function calculateViewsProjection({
  currentViews,
  growthRate,
  months,
  videoUploadRate
}: ViewsProjectionParams) {
  try {
    const projections = [];
    let cumulativeViews = currentViews;
    let monthlyViews = currentViews / 6; // Assume current views are from past 6 months
    
    for (let i = 1; i <= months; i++) {
      // Calculate compounded growth
      const monthlyGrowthFactor = 1 + (growthRate / 100);
      
      // Add views from new videos
      const newVideoViews = videoUploadRate * (monthlyViews / 10); // Each new video gets ~10% of monthly views
      
      // Calculate total for this month
      monthlyViews = (monthlyViews * monthlyGrowthFactor) + newVideoViews;
      cumulativeViews += monthlyViews;
      
      projections.push({
        month: i,
        monthlyViews: Math.round(monthlyViews),
        cumulativeViews: Math.round(cumulativeViews)
      });
    }
    
    return {
      initialMonthlyViews: currentViews / 6,
      projections,
      totalProjectedViews: Math.round(cumulativeViews),
      averageMonthlyViews: Math.round(cumulativeViews / months)
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Projection calculation error' };
  }
}

// Calculate growth rate based on historical data
function calculateGrowthRate({
  viewsData, // Array of { date, views } objects
  subscribersData // Array of { date, count } objects
}: GrowthRateParams) {
  try {
    // Sort data by date
    const sortedViews = [...viewsData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const sortedSubs = subscribersData ? [...subscribersData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ) : null;
    
    // Need at least 2 data points to calculate growth
    if (sortedViews.length < 2) {
      return { error: 'Insufficient data points for growth calculation' };
    }
    
    // Calculate views growth rate
    const firstViews = sortedViews[0].views;
    const lastViews = sortedViews[sortedViews.length - 1].views;
    const viewsGrowthRate = ((lastViews - firstViews) / firstViews) * 100;
    
    // Calculate time period in months
    const firstDate = new Date(sortedViews[0].date);
    const lastDate = new Date(sortedViews[sortedViews.length - 1].date);
    const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                       (lastDate.getMonth() - firstDate.getMonth());
    
    // Calculate monthly growth rate
    const monthlyViewsGrowthRate = monthsDiff > 0 ? viewsGrowthRate / monthsDiff : viewsGrowthRate;
    
    // Calculate subscribers growth rate if data is available
    let subscribersGrowthRate = null;
    let monthlySubscribersGrowthRate = null;
    
    if (sortedSubs && sortedSubs.length >= 2) {
      const firstSubs = sortedSubs[0].count;
      const lastSubs = sortedSubs[sortedSubs.length - 1].count;
      subscribersGrowthRate = ((lastSubs - firstSubs) / firstSubs) * 100;
      
      const firstSubsDate = new Date(sortedSubs[0].date);
      const lastSubsDate = new Date(sortedSubs[sortedSubs.length - 1].date);
      const subsMonthsDiff = (lastSubsDate.getFullYear() - firstSubsDate.getFullYear()) * 12 +
                             (lastSubsDate.getMonth() - firstSubsDate.getMonth());
                             
      monthlySubscribersGrowthRate = subsMonthsDiff > 0 ? subscribersGrowthRate / subsMonthsDiff : subscribersGrowthRate;
    }
    
    // Return calculated growth rates
    return {
      totalViewsGrowthRate: viewsGrowthRate.toFixed(2),
      monthlyViewsGrowthRate: monthlyViewsGrowthRate.toFixed(2),
      totalSubscribersGrowthRate: subscribersGrowthRate !== null ? subscribersGrowthRate.toFixed(2) : null,
      monthlySubscribersGrowthRate: monthlySubscribersGrowthRate !== null ? monthlySubscribersGrowthRate.toFixed(2) : null,
      timeSpanMonths: monthsDiff || 1,
      dataPoints: {
        views: sortedViews.length,
        subscribers: sortedSubs ? sortedSubs.length : 0
      }
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Growth rate calculation error' };
  }
}

// Export nothing - web workers don't use export statements
