
import { Link } from "react-router-dom";
import { Channel } from "@/types/youtube";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumberWithCommas } from "@/utils/channelUtils";
import { channelTypes } from "./channel-list/constants";

interface ChannelCardProps {
  channel: Channel;
}

export const ChannelCard = ({ channel }: ChannelCardProps) => {
  const {
    id,
    channel_title,
    channel_url,
    screenshot_url,
    description,
    total_subscribers,
    total_views,
    channel_category,
    channel_type,
  } = channel;

  // Find the channel type label from our constants
  const getChannelTypeLabel = (typeId: string | undefined) => {
    if (!typeId) return "Other";
    const typeInfo = channelTypes.find(type => type.id === typeId);
    return typeInfo ? typeInfo.label : typeId;
  };

  return (
    <Link to={`/channels/${id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          {screenshot_url ? (
            <img
              src={screenshot_url}
              alt={channel_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Screenshot
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold truncate">{channel_title}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {channel_category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                {channel_category}
              </span>
            )}
            {channel_type && (
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">
                {getChannelTypeLabel(channel_type)}
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
            {description || "No description available"}
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <div>
              <span className="font-medium">
                {formatNumberWithCommas(total_subscribers || 0)}
              </span>{" "}
              <span className="text-gray-500">subs</span>
            </div>
            <div>
              <span className="font-medium">
                {formatNumberWithCommas(total_views || 0)}
              </span>{" "}
              <span className="text-gray-500">views</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
