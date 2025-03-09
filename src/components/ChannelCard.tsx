
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Channel } from "@/types/youtube";
import { CheckCircle } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";
import { generateChannelSlug } from "@/pages/ChannelDetails";

interface ChannelCardProps {
  channel: Channel;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const { id, channel_title, total_subscribers, screenshot_url, is_featured, is_editor_verified, niche } = channel;

  // Create SEO-friendly URL
  const channelSlug = generateChannelSlug(channel_title);
  const seoUrl = `/channel/${channelSlug}-${id}`;

  // Format subscriber count (e.g., 1,500,000 -> 1.5M)
  const formatSubscriberCount = (count?: number | null) => {
    if (!count) return "N/A";
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    } else if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full border border-gray-200 hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-full aspect-video bg-gray-100 overflow-hidden">
          <LazyImage
            src={screenshot_url || "/placeholder.svg"}
            alt={channel_title}
            className="w-full h-full object-cover"
            fallback="/placeholder.svg"
          />
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate flex items-center">
          {channel_title}
          {is_editor_verified && (
            <CheckCircle className="ml-1 h-4 w-4 text-blue-500" aria-label="Editor Verified" />
          )}
        </CardTitle>
        <CardDescription className="flex flex-col">
          <span>{formatSubscriberCount(Number(total_subscribers))} subscribers</span>
          {niche && <span className="text-xs mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">{niche}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link 
          to={seoUrl}
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
        >
          View Channel
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
