
import { Users, Play, Calendar, CircleDollarSign, TrendingUp, Clock, Globe, Upload } from "lucide-react";
import { Channel } from "@/types/youtube";
import StatCard from "./StatCard";
import { 
  calculateTotalRevenue, 
  calculateRevenuePerSubscriber, 
  calculateRevenuePerVideo,
  calculatePotentialRevenue,
  formatStartDate
} from "../utils/revenueCalculations";
import { calculateMonthlyUploadRate, getUploadRateCategory } from "../utils/uploadCalculations";

interface ChannelStatsGridProps {
  channel: Channel;
}

const ChannelStatsGrid = ({ channel }: ChannelStatsGridProps) => {
  // Calculate all the derived statistics
  const totalRevenue = calculateTotalRevenue(channel.total_views, channel.cpm);
  const revenuePerVideo = calculateRevenuePerVideo(totalRevenue, channel.video_count);
  const revenuePerSubscriber = calculateRevenuePerSubscriber(totalRevenue, channel.total_subscribers);
  const potentialRevenue = calculatePotentialRevenue(totalRevenue);
  
  // Calculate upload rate statistics
  const monthlyUploadRate = calculateMonthlyUploadRate(channel.start_date, channel.video_count);
  const uploadRateCategory = getUploadRateCategory(monthlyUploadRate);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      {/* Row 1 */}
      <StatCard 
        icon={Users} 
        label="Subscribers" 
        value={channel.total_subscribers ? 
          parseInt(channel.total_subscribers.toString()).toLocaleString() : 
          'N/A'}
      />
      
      <StatCard 
        icon={Play} 
        label="Total Views" 
        value={channel.total_views ? 
          parseInt(channel.total_views.toString()).toLocaleString() : 
          'N/A'}
      />
      
      {/* Row 2 */}
      <StatCard 
        icon={Calendar} 
        label="Videos" 
        value={channel.video_count || 'N/A'}
      />
      
      <StatCard 
        icon={CircleDollarSign} 
        label="Est. CPM" 
        value={channel.cpm ? `$${channel.cpm.toFixed(2)}` : 'N/A'}
      />
      
      {/* Upload Rate Stats - Added here after Videos and CPM */}
      <StatCard 
        icon={Upload} 
        label="Videos per Month" 
        value={monthlyUploadRate ? monthlyUploadRate.toFixed(1) : 'N/A'}
      />
      
      <StatCard 
        icon={Upload} 
        label="Upload Rate" 
        value={uploadRateCategory.label}
        valueColor={uploadRateCategory.color}
      />
      
      {/* Row 3 - Revenue Statistics */}
      <StatCard 
        icon={CircleDollarSign} 
        label="Total Revenue" 
        value={totalRevenue ? 
          `$${totalRevenue.toLocaleString()}` : 
          'N/A'}
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
      
      <StatCard 
        icon={CircleDollarSign} 
        label="Revenue per Video" 
        value={revenuePerVideo ? 
          `$${revenuePerVideo.toLocaleString()}` : 
          'N/A'}
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
      
      {/* Row 4 */}
      <StatCard 
        icon={Users} 
        label="Revenue per Subscriber" 
        value={revenuePerSubscriber ? 
          `$${revenuePerSubscriber.toFixed(4)}` : 
          'N/A'}
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
      
      <StatCard 
        icon={TrendingUp} 
        label="Potential Revenue (12 months)" 
        value={potentialRevenue ? 
          `$${potentialRevenue.toLocaleString()}` : 
          'N/A'}
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
      
      {/* Additional info: Start Date and Country */}
      <StatCard 
        icon={Clock} 
        label="Date of Start" 
        value={formatStartDate(channel.start_date)}
      />
      
      <StatCard 
        icon={Globe} 
        label="Country" 
        value={channel.country || 'N/A'}
      />
    </div>
  );
};

export default ChannelStatsGrid;
