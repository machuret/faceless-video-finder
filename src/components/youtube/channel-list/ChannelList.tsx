import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, AlertCircle, Loader2, Star, StarOff } from "lucide-react";
import { Channel, ChannelMetadata } from "@/types/youtube";
import { Badge } from "@/components/ui/badge";

interface ChannelListProps {
  isAdmin: boolean;
  limit?: number;
}

export const ChannelList: React.FC<ChannelListProps> = ({ isAdmin, limit }) => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    fetchChannels();
  }, [limit]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to ensure metadata is properly typed
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is treated as ChannelMetadata or undefined
        metadata: channel.metadata as ChannelMetadata | undefined
      }));
      
      setChannels(typedChannels);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      setError(error.message || "Failed to load channels");
      uiToast({
        title: "Error",
        description: "Failed to load channels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (channelId: string) => {
    navigate(`/admin/edit-channel/${channelId}`);
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    
    try {
      const { error } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("id", channelId);
      
      if (error) throw error;
      
      toast.success("Channel deleted successfully");
      fetchChannels(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting channel:", error);
      toast.error("Failed to delete channel: " + error.message);
    }
  };

  const toggleFeatured = async (channelId: string, currentStatus: boolean) => {
    try {
      // Update using the dedicated is_featured column instead of metadata
      const { error } = await supabase
        .from("youtube_channels")
        .update({ 
          is_featured: !currentStatus 
        })
        .eq("id", channelId);
      
      if (error) throw error;
      
      toast.success(`Channel ${!currentStatus ? "featured" : "unfeatured"} successfully`);
      
      // Update local state to avoid refetching
      setChannels(prev => 
        prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, is_featured: !currentStatus } 
            : channel
        )
      );
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      toast.error("Failed to update featured status: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-gray-500">Loading channels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <p className="text-gray-700 mb-2 font-semibold">Error loading channels</p>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchChannels}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500 mb-4">No channels found in the database.</p>
        {isAdmin && (
          <Button variant="outline" onClick={() => navigate("/admin/add-channel")}>
            Add Your First Channel
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Channels</h2>
        {isAdmin && (
          <Button onClick={() => navigate("/admin/add-channel")} size="sm">
            Add New Channel
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
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
                      <DropdownMenuItem onClick={() => handleEdit(channel.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleFeatured(channel.id, Boolean(channel.is_featured))}
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
                        onClick={() => handleDelete(channel.id)}
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
                  onClick={() => navigate(`/channel/${channel.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
