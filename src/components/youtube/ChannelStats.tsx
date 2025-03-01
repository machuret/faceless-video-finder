
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Globe, 
  DollarSign, 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Layers, 
  FileType
} from "lucide-react";
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
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-semibold">Channel Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-800">Channel Size</h3>
          </div>
          <p className="text-xl font-semibold text-blue-600 ml-7">
            {channelSize.charAt(0).toUpperCase() + channelSize.slice(1)}
          </p>
          <div className="flex items-center gap-2 ml-7 mt-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">
              Expected Monthly Growth: {getGrowthRange(channelSize)} subscribers
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-semibold text-gray-800">Upload Frequency</h3>
          </div>
          <p className="text-xl font-semibold text-green-600 ml-7">
            {uploadFrequencyCategory.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </p>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            {getUploadFrequencyLabel(uploadFrequency)}
          </p>
        </div>

        {channel.keywords && channel.keywords.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-semibold text-gray-800">Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2 ml-7">
              {channel.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {channel.cpm && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-gray-800">Revenue Metrics</h3>
            </div>
            <div className="space-y-2 ml-7">
              <div className="flex items-center gap-2">
                <p className="text-sm">CPM: <span className="font-medium">{formatRevenue(channel.cpm)}</span></p>
              </div>
              {channel.revenue_per_video && (
                <div className="flex items-center gap-2">
                  <p className="text-sm">Revenue per Video: <span className="font-medium">{formatRevenue(channel.revenue_per_video)}</span></p>
                </div>
              )}
              {channel.revenue_per_month && (
                <div className="flex items-center gap-2">
                  <p className="text-sm">Monthly Revenue: <span className="font-medium">{formatRevenue(channel.revenue_per_month)}</span></p>
                </div>
              )}
            </div>
          </div>
        )}

        {channel.channel_category && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-gray-800">Category</h3>
            </div>
            <p className="text-sm capitalize ml-7">{channel.channel_category}</p>
          </div>
        )}

        {displayChannelType && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <FileType className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-800">Type</h3>
            </div>
            <Link 
              to={`/channel-types/${getChannelTypeUrl(displayChannelType)}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline ml-7 flex items-center"
            >
              {formatChannelType(displayChannelType)}
            </Link>
          </div>
        )}

        {channel.niche && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-800">Niche</h3>
            </div>
            <p className="text-sm ml-7">{channel.niche}</p>
          </div>
        )}

        {channel.country && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Country</h3>
            </div>
            <p className="text-sm ml-7">{channel.country}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelStats;

