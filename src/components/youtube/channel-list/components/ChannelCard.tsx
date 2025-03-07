
import React from "react";
import { Channel } from "@/types/youtube";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Star, StarOff } from "lucide-react";
import { generateChannelSlug } from "@/pages/ChannelDetails";

interface ChannelCardProps {
  channel: Channel;
  isAdmin: boolean;
  onEdit: (channelId: string) => void;
  onDelete: (channelId: string) => void;
  onToggleFeatured: (channelId: string, currentStatus: boolean) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isAdmin,
  onEdit,
  onDelete,
  onToggleFeatured
}) => {
  const navigate = useNavigate();
  
  // Generate a SEO-friendly URL like the homepage does
  const channelSlug = generateChannelSlug(channel.channel_title);
  const seoUrl = `/channel/${channelSlug}-${channel.id}`;

  console.log(`Admin ChannelCard for ${channel.channel_title} using URL: ${seoUrl}`);

  return (
    <Card key={channel.id} className={`overflow-hidden hover:shadow-md transition-shadow ${channel.is_featured ? 'border-yellow-400 border-2' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg truncate">
              {channel.channel_title}
            </h3>
            {channel.is_featured && (
              <Badge className="bg-yellow-500 text-white mt-1">Featured</Badge>
            )}
          </div>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-white">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(channel.id)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onToggleFeatured(channel.id, Boolean(channel.is_featured))}
                >
                  {channel.is_featured ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Remove Featured
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Make Featured
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(channel.id)}
                  className="text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-1">
          {channel.total_subscribers?.toLocaleString() || 0} subscribers
        </p>
        <p className="text-sm text-gray-500">
          {channel.channel_type || 'Unknown'} · {channel.channel_category || 'Uncategorized'}
        </p>
        <div className="mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate(seoUrl)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
