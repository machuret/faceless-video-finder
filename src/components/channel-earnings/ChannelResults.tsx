
import { Users, Video, DollarSign } from "lucide-react";
import { ChannelStatCard } from "./ChannelStatCard";

interface ChannelResultsProps {
  channelTitle: string;
  totalSubscribers: number;
  totalViews: number;
  totalEarnings: number;
  avgEarningsPerVideo: number;
  formatNumber: (num: number) => string;
}

export const ChannelResults = ({
  channelTitle,
  totalSubscribers,
  totalViews,
  totalEarnings,
  avgEarningsPerVideo,
  formatNumber
}: ChannelResultsProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {channelTitle}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChannelStatCard
          title="Total Subscribers"
          value={formatNumber(totalSubscribers)}
          icon={Users}
          iconColor="text-blue-500"
        />
        
        <ChannelStatCard
          title="Total Video Views"
          value={formatNumber(totalViews)}
          icon={Video}
          iconColor="text-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChannelStatCard
          title="Total Estimated Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-green-600"
          cardClassName="bg-green-50"
          valueClassName="text-green-700"
          description="Based on average YouTube CPM rates"
        />
        
        <ChannelStatCard
          title="Average Earnings per Video"
          value={`$${avgEarningsPerVideo.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-green-600"
          cardClassName="bg-green-50"
          valueClassName="text-green-700"
          description="Estimated average revenue per video"
        />
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> These estimates are based on industry averages and actual earnings may vary. 
          YouTube typically pays creators between $0.25 to $4.00 per 1000 views, depending on factors such as 
          niche, audience location, and engagement.
        </p>
      </div>
    </>
  );
};
