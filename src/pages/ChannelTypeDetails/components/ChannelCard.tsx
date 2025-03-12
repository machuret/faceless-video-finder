
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import { formatDate, getChannelSlug } from "@/utils/channelUtils";

interface ChannelCardProps {
  channel: Channel;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const seoUrl = `/channel/${getChannelSlug(channel)}`;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Link to={seoUrl} className="flex-grow p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-4 mb-4">
          {channel.screenshot_url && (
            <img
              src={channel.screenshot_url}
              alt={channel.channel_title}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold line-clamp-2">{channel.channel_title}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {channel.channel_category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {channel.channel_category}
                </span>
              )}
              {channel.niche && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {channel.niche}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-sm text-gray-500">Subscribers</p>
            <p className="font-medium">{channel.total_subscribers?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Videos</p>
            <p className="font-medium">{channel.video_count?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="font-medium">{channel.total_views?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Since</p>
            <p className="font-medium">{channel.start_date ? formatDate(channel.start_date) : 'N/A'}</p>
          </div>
        </div>
        
        {channel.description && (
          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-3">{channel.description}</p>
          </div>
        )}
      </Link>
      
      <div className="p-3 bg-gray-50 border-t">
        <a 
          href={channel.channel_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View YouTube Channel
        </a>
      </div>
    </Card>
  );
};

export default ChannelCard;
