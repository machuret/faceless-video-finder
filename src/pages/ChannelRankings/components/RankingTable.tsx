
import React from "react";
import { Channel } from "@/types/youtube";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getChannelSlug } from "@/utils/channelUtils";

interface RankingTableProps {
  channels: Channel[];
  rankingMetric: string;
}

const RankingTable = ({ channels, rankingMetric }: RankingTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleRowClick = (channel: Channel) => {
    const channelSlug = getChannelSlug(channel);
    navigate(`/channel/${channelSlug}`);
  };
  
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      if (rankingMetric.includes('revenue')) {
        return `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
      return value.toLocaleString();
    }
    return value || 'N/A';
  };
  
  const getColumnLabel = () => {
    switch (rankingMetric) {
      case 'revenue_per_video':
        return 'Revenue Per Video';
      case 'revenue_per_month':
        return 'Revenue Per Subscriber';
      default:
        return 'Value';
    }
  };
  
  if (!user && rankingMetric.includes('revenue')) {
    // Show teaser for non-logged in users
    return (
      <div className="p-8 text-center bg-gray-50 rounded-b-lg border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Sign In to View Rankings</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Our detailed revenue rankings are available exclusively to registered users. 
          Sign in now to access valuable insights about the top performing channels.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/auth">Sign in to view rankings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-y border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Rank</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Channel</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Subscribers</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">{getColumnLabel()}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {channels.map((channel, index) => (
            <tr 
              key={channel.id} 
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(channel)}
            >
              <td className="px-4 py-4 font-semibold text-gray-800">{index + 1}</td>
              <td className="px-4 py-4">
                <div className="flex items-center space-x-3">
                  {channel.screenshot_url && (
                    <img 
                      src={channel.screenshot_url} 
                      alt={channel.channel_title} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{channel.channel_title}</p>
                    <p className="text-xs text-gray-500">{channel.niche || channel.channel_category || 'Uncategorized'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-700">
                {channel.total_subscribers ? channel.total_subscribers.toLocaleString() : 'N/A'}
              </td>
              <td className="px-4 py-4 font-medium text-green-600">
                {formatValue(channel[rankingMetric as keyof Channel])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
