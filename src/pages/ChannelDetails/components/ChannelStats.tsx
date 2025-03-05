
import { Card, CardContent } from "@/components/ui/card";
import { Users, Play, Calendar, CircleDollarSign, TrendingUp, Clock, Globe } from "lucide-react";
import { Channel } from "@/types/youtube";
import LazyImage from "@/components/ui/lazy-image";

interface ChannelStatsProps {
  channel: Channel;
  showOnlyRevenue?: boolean;
}

const ChannelStats = ({ channel, showOnlyRevenue = false }: ChannelStatsProps) => {
  // If we're only showing revenue and there's no revenue data, don't render
  if (showOnlyRevenue && !channel.revenue_per_month) {
    return null;
  }

  // Calculate total revenue from views and CPM
  const calculateTotalRevenue = () => {
    if (!channel.total_views || !channel.cpm) return null;
    // Formula: Total Revenue = (Total Views / 1000) * CPM
    return Math.round((channel.total_views / 1000) * channel.cpm);
  };

  const totalRevenue = calculateTotalRevenue();

  // Calculate revenue per subscriber
  const revenuePerSubscriber = totalRevenue && channel.total_subscribers && channel.total_subscribers > 0
    ? totalRevenue / channel.total_subscribers
    : null;

  // Calculate potential revenue for next 12 months
  // Assuming a modest 5% growth rate per month if not specified
  const calculatePotentialRevenue = () => {
    if (!totalRevenue) return null;
    
    // Base calculation is current monthly revenue * 12
    let baseYearlyRevenue = totalRevenue / 12; // Monthly revenue
    
    // Add growth component - assuming 5% monthly growth compounded
    const monthlyGrowthRate = 0.05; // 5% monthly growth
    let potentialRevenue = 0;
    
    for (let i = 0; i < 12; i++) {
      // For each month, calculate that month's revenue with compound growth
      const monthRevenue = baseYearlyRevenue * Math.pow(1 + monthlyGrowthRate, i);
      potentialRevenue += monthRevenue;
    }
    
    return Math.round(potentialRevenue);
  };

  const potentialRevenue = calculatePotentialRevenue();

  // Format start date
  const formatStartDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      {!showOnlyRevenue && <h2 className="text-xl font-semibold mb-4">Channel Statistics</h2>}
      
      {!showOnlyRevenue && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Row 1 */}
          <Card>
            <CardContent className="p-4 flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Subscribers</p>
                <p className="text-xl font-bold">
                  {channel.total_subscribers ? 
                    parseInt(channel.total_subscribers.toString()).toLocaleString() : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <Play className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-xl font-bold">
                  {channel.total_views ? 
                    parseInt(channel.total_views.toString()).toLocaleString() : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Row 2 */}
          <Card>
            <CardContent className="p-4 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Videos</p>
                <p className="text-xl font-bold">
                  {channel.video_count || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <CircleDollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Est. CPM</p>
                <p className="text-xl font-bold">
                  {channel.cpm ? `$${channel.cpm.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Row 3 */}
          <Card>
            <CardContent className="p-4 flex items-center">
              <CircleDollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  {totalRevenue ? 
                    `$${totalRevenue.toLocaleString()}` : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <CircleDollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Revenue per Video</p>
                <p className="text-xl font-bold text-green-600">
                  {totalRevenue && channel.video_count && channel.video_count > 0 ? 
                    `$${Math.round(totalRevenue / channel.video_count).toLocaleString()}` : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Row 4 */}
          <Card>
            <CardContent className="p-4 flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Revenue per Subscriber</p>
                <p className="text-xl font-bold text-green-600">
                  {revenuePerSubscriber ? 
                    `$${revenuePerSubscriber.toFixed(4)}` : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Potential Revenue (12 months)</p>
                <p className="text-xl font-bold text-green-600">
                  {potentialRevenue ? 
                    `$${potentialRevenue.toLocaleString()}` : 
                    'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional info: Start Date and Country */}
          <Card>
            <CardContent className="p-4 flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date of Start</p>
                <p className="text-xl font-bold">
                  {formatStartDate(channel.start_date)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="text-xl font-bold">
                  {channel.country || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Revenue Card - Always shown */}
      {channel.revenue_per_month && showOnlyRevenue && (
        <Card className={showOnlyRevenue ? "" : "mt-4"}>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-1">Estimated Monthly Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              ${parseFloat(channel.revenue_per_month.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Channel Screenshot Section - Only shown in full mode */}
      {!showOnlyRevenue && channel.screenshot_url && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Channel Screenshot</h3>
          <Card>
            <CardContent className="p-4">
              <LazyImage 
                src={channel.screenshot_url} 
                alt={`${channel.channel_title} screenshot`}
                className="w-full h-auto rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChannelStats;
