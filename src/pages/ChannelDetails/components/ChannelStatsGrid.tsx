
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
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ChannelStatsGridProps {
  channel: Channel;
}

const ChannelStatsGrid = ({ channel }: ChannelStatsGridProps) => {
  const { user } = useAuth();
  
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
      {/* Row 1 - Basic stats (always visible) */}
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
      
      {/* Row 2 - More basic stats (always visible) */}
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
      
      {/* Upload Rate Stats - Added here after Videos and CPM (always visible) */}
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
      
      {/* Row 3 - Revenue Statistics (only visible for logged in users) */}
      {user ? (
        <>
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
          
          {/* Row 4 - More Revenue Statistics (only visible for logged in users) */}
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
        </>
      ) : (
        // Teaser card for non-registered users
        <div className="col-span-2 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            Want to see revenue estimates?
          </h3>
          <p className="text-gray-600 mb-4">
            Sign in to view detailed revenue metrics including:
          </p>
          <ul className="text-gray-700 mb-4 space-y-1">
            <li className="flex items-center">
              <CircleDollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span>Total channel revenue</span>
            </li>
            <li className="flex items-center">
              <CircleDollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span>Revenue per video</span>
            </li>
            <li className="flex items-center">
              <Users className="h-4 w-4 text-green-600 mr-2" />
              <span>Revenue per subscriber</span>
            </li>
            <li className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <span>12-month potential revenue</span>
            </li>
          </ul>
          <div className="flex justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/auth">Sign in now</Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Additional info: Start Date and Country (always visible) */}
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
