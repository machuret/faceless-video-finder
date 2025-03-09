
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, CheckCircle } from "lucide-react";
import { Channel } from "@/types/youtube";
import LazyImage from "@/components/ui/lazy-image";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface ChannelCardProps {
  channel: Channel;
  isAdmin: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (channelId: string) => void;
  onEdit?: (channelId: string) => void;
  onDelete?: (channelId: string) => void;
  onToggleFeatured?: (channelId: string, currentStatus: boolean) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isAdmin,
  selectable = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleFeatured
}) => {
  const { id, channel_title, total_subscribers, screenshot_url, is_featured, is_editor_verified, niche } = channel;

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
        {selectable && (
          <div className="absolute top-2 left-2 z-10 bg-white/80 rounded-full p-1">
            <Checkbox 
              id={`select-${id}`}
              checked={isSelected}
              onCheckedChange={() => onSelect?.(id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
        {isAdmin && is_featured !== undefined && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/80 rounded-full p-1">
            <Star className={`w-4 h-4 ${is_featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
            <Switch 
              checked={is_featured}
              onCheckedChange={() => onToggleFeatured?.(id, is_featured)}
              aria-label={is_featured ? "Unfeature this channel" : "Feature this channel"}
            />
          </div>
        )}
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
            <CheckCircle className="ml-1 h-4 w-4 text-blue-500" title="Editor Verified" />
          )}
        </CardTitle>
        <CardDescription className="flex flex-col">
          <span>{formatSubscriberCount(Number(total_subscribers))} subscribers</span>
          {niche && <span className="text-xs mt-1 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">{niche}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Additional content could go here */}
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit?.(id)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={() => onDelete?.(id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
