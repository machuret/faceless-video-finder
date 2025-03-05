
import { Channel } from "@/types/youtube";
import ChannelStatsGrid from "./ChannelStatsGrid";
import ChannelScreenshot from "./ChannelScreenshot";
import MonthlyRevenueCard from "./MonthlyRevenueCard";

interface ChannelStatsProps {
  channel: Channel;
  showOnlyRevenue?: boolean;
  showOnlyScreenshot?: boolean;
}

const ChannelStats = ({ channel, showOnlyRevenue = false, showOnlyScreenshot = false }: ChannelStatsProps) => {
  // If we're only showing revenue and there's no revenue data, don't render
  if (showOnlyRevenue && !channel.revenue_per_month) {
    return null;
  }

  // If we're only showing screenshot and there's no screenshot, don't render
  if (showOnlyScreenshot && !channel.screenshot_url) {
    return null;
  }

  return (
    <div>
      {/* Only show the heading if showing full stats */}
      {!showOnlyRevenue && !showOnlyScreenshot && (
        <h2 className="text-xl font-semibold mb-4">Channel Statistics</h2>
      )}
      
      {/* Full Stats Grid - Only shown in full mode */}
      {!showOnlyRevenue && !showOnlyScreenshot && (
        <ChannelStatsGrid channel={channel} />
      )}
      
      {/* Revenue Card - Shown when showOnlyRevenue is true */}
      {channel.revenue_per_month && showOnlyRevenue && (
        <MonthlyRevenueCard revenuePerMonth={channel.revenue_per_month} />
      )}

      {/* Channel Screenshot Section - Shown in full mode or when showOnlyScreenshot is true */}
      {((!showOnlyRevenue && !showOnlyScreenshot) || showOnlyScreenshot) && channel.screenshot_url && (
        <ChannelScreenshot 
          screenshotUrl={channel.screenshot_url} 
          channelTitle={channel.channel_title} 
        />
      )}
    </div>
  );
};

export default ChannelStats;
