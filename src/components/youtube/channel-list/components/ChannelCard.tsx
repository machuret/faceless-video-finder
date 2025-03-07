
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star } from "lucide-react";
import { Channel } from "@/types/youtube";
import { Link } from "react-router-dom";
import { getChannelSlug } from "@/utils/channelUtils";

interface ChannelCardProps {
  channel: Channel;
  isAdmin: boolean;
  onEdit?: (channelId: string) => void;
  onDelete?: (channelId: string) => void;
  onToggleFeatured?: (channelId: string, isFeatured: boolean) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isAdmin,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const channelPath = `/channel/${getChannelSlug(channel)}`;
  console.log(`Admin ChannelCard for ${channel.channel_title} using URL: ${channelPath}`);

  const formatSubscribers = (count: string | number | undefined) => {
    if (!count) return "N/A";
    const num = typeof count === "string" ? parseInt(count, 10) : count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        {/* Featured badge */}
        {channel.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full z-10">
            Featured
          </div>
        )}
        
        {/* Screenshot preview */}
        {channel.screenshot_url && (
          <div className="w-full h-36 overflow-hidden">
            <img 
              src={channel.screenshot_url} 
              alt={channel.channel_title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <Link to={channelPath} className="block">
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-blue-600 transition-colors">
            {channel.channel_title}
          </h3>
        </Link>
        
        <div className="mt-2 text-sm text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Subscribers:</span>
            <span className="font-medium text-gray-700">
              {formatSubscribers(channel.total_subscribers)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Videos:</span>
            <span className="font-medium text-gray-700">
              {channel.video_count || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium text-gray-700 capitalize">
              {channel.channel_category || "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="px-4 py-3 bg-gray-50 border-t flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit && onEdit(channel.id)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className={`flex-1 ${channel.is_featured ? 'bg-yellow-100' : ''}`}
            onClick={() => onToggleFeatured && onToggleFeatured(channel.id, !!channel.is_featured)}
          >
            <Star className={`h-4 w-4 mr-1 ${channel.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {channel.is_featured ? 'Unfeature' : 'Feature'}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete && onDelete(channel.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
