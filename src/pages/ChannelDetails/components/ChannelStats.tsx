
import { Card, CardContent } from "@/components/ui/card";
import { Users, Play, Calendar, CircleDollarSign } from "lucide-react";
import { Channel } from "@/types/youtube";
import LazyImage from "@/components/ui/lazy-image";

interface ChannelStatsProps {
  channel: Channel;
}

const ChannelStats = ({ channel }: ChannelStatsProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Channel Statistics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Subscribers</p>
              <p className="text-xl font-bold">
                {channel.total_subscribers ? 
                  parseInt(channel.total_subscribers.toString()).toLocaleString() : 
                  'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <Play className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Views</p>
              <p className="text-xl font-bold">
                {channel.total_views ? 
                  parseInt(channel.total_views.toString()).toLocaleString() : 
                  'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Videos</p>
              <p className="text-xl font-bold">
                {channel.video_count || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <CircleDollarSign className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Est. CPM</p>
              <p className="text-xl font-bold">
                {channel.cpm ? `$${channel.cpm.toFixed(2)}` : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {channel.revenue_per_month && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Estimated Monthly Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ${parseFloat(channel.revenue_per_month.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Channel Screenshot Section */}
      {channel.screenshot_url && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Channel Screenshot</h3>
          <Card>
            <CardContent className="p-4">
              <LazyImage 
                src={channel.screenshot_url} 
                alt={`${channel.channel_title} screenshot`}
                className="w-full h-auto rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChannelStats;
