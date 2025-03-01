
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, DollarSign } from "lucide-react";
import { Channel, ChannelSize } from "@/types/youtube";
import { getGrowthRange, formatRevenue, getUploadFrequencyLabel } from "@/utils/channelUtils";
import { Link } from "react-router-dom";

interface ChannelStatsProps {
  channel: Channel;
  channelSize: ChannelSize;
  uploadFrequency: number | null;
  uploadFrequencyCategory: string;
}

const ChannelStats = ({ channel, channelSize, uploadFrequency, uploadFrequencyCategory }: ChannelStatsProps) => {
  // Get the channel type to display - prioritize metadata.ui_channel_type if available
  const displayChannelType = channel.channel_type || "other";
  
  // Format the channel type for display
  const formatChannelType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format for URL - make sure it's lowercase and has underscores
  const getChannelTypeUrl = (type: string): string => {
    return type.toLowerCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Channel Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Channel Size</h3>
          <p className="text-xl font-semibold text-blue-600">
            {channelSize.charAt(0).toUpperCase() + channelSize.slice(1)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Expected Monthly Growth: {getGrowthRange(channelSize)} subscribers
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Upload Frequency</h3>
          <p className="text-xl font-semibold text-green-600">
            {uploadFrequencyCategory.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {getUploadFrequencyLabel(uploadFrequency)}
          </p>
        </div>

        {channel.keywords && channel.keywords.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {channel.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {channel.cpm && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Metrics</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <p className="text-base">CPM: {formatRevenue(channel.cpm)}</p>
              </div>
              {channel.revenue_per_video && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <p className="text-base">Revenue per Video: {formatRevenue(channel.revenue_per_video)}</p>
                </div>
              )}
              {channel.revenue_per_month && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <p className="text-base">Monthly Revenue: {formatRevenue(channel.revenue_per_month)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {channel.channel_category && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
            <p className="text-base capitalize">{channel.channel_category}</p>
          </div>
        )}

        {displayChannelType && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Type</h3>
            <Link 
              to={`/channel-types/${getChannelTypeUrl(displayChannelType)}`}
              className="text-base text-blue-600 hover:text-blue-800 hover:underline"
            >
              {formatChannelType(displayChannelType)}
            </Link>
          </div>
        )}

        {channel.niche && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Niche</h3>
            <p className="text-base">{channel.niche}</p>
          </div>
        )}

        {channel.country && (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Country</h3>
              <p className="text-base">{channel.country}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelStats;
