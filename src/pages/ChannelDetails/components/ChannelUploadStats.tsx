
import { Video, Calendar, Upload } from "lucide-react";
import { Channel } from "@/types/youtube";
import StatCard from "./StatCard";
import { calculateMonthlyUploadRate, getUploadRateCategory } from "../utils/uploadCalculations";

interface ChannelUploadStatsProps {
  channel: Channel;
}

const ChannelUploadStats = ({ channel }: ChannelUploadStatsProps) => {
  // Calculate upload rate statistics
  const monthlyUploadRate = calculateMonthlyUploadRate(channel.start_date, channel.video_count);
  const uploadRateCategory = getUploadRateCategory(monthlyUploadRate);
  
  if (!monthlyUploadRate) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Upload Activity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          icon={Video} 
          label="Videos per Month" 
          value={`${monthlyUploadRate.toFixed(1)}`}
          iconColor="text-purple-600"
        />
        
        <StatCard 
          icon={Upload} 
          label="Upload Rate" 
          value={uploadRateCategory.label}
          iconColor={`${uploadRateCategory.color}`}
        />
      </div>
    </div>
  );
};

export default ChannelUploadStats;
