
import React from "react";
import { Channel } from "@/types/youtube";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { getChannelSlug } from "@/utils/channelUtils";
import { formatNumberWithCommas } from "@/utils/channelUtils";

interface RankingTableProps {
  channels: Channel[];
  rankingMetric: "revenue_per_video" | "revenue_per_month" | "total_subscribers" | "total_views";
}

const RankingTable = ({ channels, rankingMetric }: RankingTableProps) => {
  const getRankingValue = (channel: Channel) => {
    switch (rankingMetric) {
      case "revenue_per_video":
        return channel.revenue_per_video || 0;
      case "revenue_per_month":
        return channel.revenue_per_month || 0;
      case "total_subscribers":
        return channel.total_subscribers || 0;
      case "total_views":
        return channel.total_views || 0;
      default:
        return 0;
    }
  };

  const formatRankingValue = (channel: Channel) => {
    switch (rankingMetric) {
      case "revenue_per_video":
      case "revenue_per_month":
        return `$${formatNumberWithCommas(getRankingValue(channel))}`;
      case "total_subscribers":
      case "total_views":
        return formatNumberWithCommas(getRankingValue(channel));
      default:
        return String(getRankingValue(channel));
    }
  };

  const getMetricLabel = () => {
    switch (rankingMetric) {
      case "revenue_per_video":
        return "Revenue / Video";
      case "revenue_per_month":
        return "Monthly Revenue";
      case "total_subscribers":
        return "Subscribers";
      case "total_views":
        return "Total Views";
      default:
        return "Value";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Channel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {getMetricLabel()}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              YouTube
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {channels.map((channel, index) => (
            <tr key={channel.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link
                  to={`/channel/${getChannelSlug(channel)}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {channel.channel_title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {formatRankingValue(channel)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a
                  href={channel.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ExternalLink size={16} className="mr-1" />
                  <span>Visit</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
