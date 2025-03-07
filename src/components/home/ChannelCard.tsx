import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import { Star } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import { generateChannelSlug } from "@/utils/channelSlug";

interface ChannelCardProps {
  channel: Channel;
  isFeatured?: boolean;
}

const ChannelCard = ({ channel, isFeatured = false }: ChannelCardProps) => {
  // Create SEO-friendly URL
  const channelSlug = generateChannelSlug(channel.channel_title);
  const seoUrl = `/channel/${channelSlug}-${channel.id}`;
  
  console.log(`ChannelCard for ${channel.channel_title} using URL: ${seoUrl}`);

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow overflow-hidden ${isFeatured ? 'border-yellow-400 border-2' : ''}`}
    >
      <Link to={seoUrl}>
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {channel.screenshot_url ? (
            <LazyImage 
              src={channel.screenshot_url} 
              alt={channel.channel_title || "Channel screenshot"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-400 font-lato">No screenshot</p>
            </div>
          )}
          {channel.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full flex items-center text-xs font-semibold">
              <Star className="h-3 w-3 mr-1" fill="white" />
              Featured
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-crimson text-lg font-semibold mb-2 line-clamp-1">{channel.channel_title}</h3>
          <div className="flex items-center gap-x-4 text-sm text-gray-500 mb-3 font-montserrat">
            <div className="flex items-center">
              <span className="font-medium">{channel.total_subscribers ? parseInt(channel.total_subscribers.toString()).toLocaleString() : '0'}</span>
              <span className="ml-1">subscribers</span>
            </div>
            <div>
              <span className="font-medium">{channel.total_views ? parseInt(channel.total_views.toString()).toLocaleString() : '0'}</span>
              <span className="ml-1">views</span>
            </div>
          </div>
          <p className="font-crimson text-black line-clamp-2 text-base mb-2">
            {channel.description || "No description available"}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {channel.niche && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-montserrat">
                {channel.niche}
              </span>
            )}
            {channel.channel_category && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-montserrat">
                {channel.channel_category}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ChannelCard;
