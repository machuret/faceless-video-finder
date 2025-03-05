
import { Channel } from "@/types/youtube";
import ChannelStatsGrid from "./ChannelStatsGrid";
import ChannelScreenshot from "./ChannelScreenshot";
import MonthlyRevenueCard from "./MonthlyRevenueCard";

interface ChannelStatsProps {
  channel: Channel;
  showOnlyRevenue?: boolean;
}

const ChannelStats = ({ channel, showOnlyRevenue = false }: ChannelStatsProps) => {
  // If we're only showing revenue and there's no revenue data, don't render
  if (showOnlyRevenue && !channel.revenue_per_month) {
    return null;
  }

  return (
    <div>
      {!showOnlyRevenue && <h2 className="text-xl font-semibold mb-4">Channel Statistics</h2>}
      
      {/* Full Stats Grid - Only shown in full mode */}
      {!showOnlyRevenue && (
        <ChannelStatsGrid channel={channel} />
      )}
      
      {/* Revenue Card - Always shown */}
      {channel.revenue_per_month && showOnlyRevenue && (
        <MonthlyRevenueCard revenuePerMonth={channel.revenue_per_month} />
      )}

      {/* Channel Screenshot Section - Only shown in full mode */}
      {!showOnlyRevenue && channel.screenshot_url && (
        <ChannelScreenshot 
          screenshotUrl={channel.screenshot_url} 
          channelTitle={channel.channel_title} 
        />
      )}
    </div>
  );
};

export default ChannelStats;
