
import { useState, useCallback } from "react";
import { Channel } from "@/types/youtube";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useChannelOperations() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const fetchChannels = useCallback(async (offset?: number, limit?: number = 10) => {
    try {
      console.log("fetchChannels called with offset:", offset, "limit:", limit);
      setLoading(true);
      setError(null);
      
      // First try getting the count using the edge function for consistency
      let count = 0;
      try {
        const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            limit: 1,
            offset: 0,
            countOnly: true
          }
        });
        
        if (!countError && countData?.totalCount) {
          count = countData.totalCount;
          console.log("Total channel count from edge function:", count);
        }
      } catch (err) {
        console.warn("Error fetching count from edge function, will try direct query");
      }
      
      // If edge function count failed, try direct query
      if (count === 0) {
        try {
          const { count: directCount, error: countError } = await supabase
            .from("youtube_channels")
            .select("*", { count: 'exact', head: true });
          
          if (countError) {
            console.error("Error fetching channel count:", countError);
          } else {
            count = directCount || 0;
            console.log("Total channel count from direct query:", count);
          }
        } catch (countErr) {
          console.error("Error getting count:", countErr);
        }
      }
      
      setTotalCount(count);
      
      // Now try to fetch the actual data
      const finalLimit = typeof limit === 'number' ? limit : 10;
      const finalOffset = typeof offset === 'number' ? offset : 0;
      
      // First try direct query
      let channelData: Channel[] = [];
      let directQuerySucceeded = false;
      
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .order("created_at", { ascending: false })
          .range(finalOffset, finalOffset + finalLimit - 1);

        if (error) {
          console.error("Supabase direct query error:", error);
        } else if (data && data.length > 0) {
          channelData = data as Channel[];
          directQuerySucceeded = true;
          console.log(`Fetched ${channelData.length} channels from direct Supabase query`);
        }
      } catch (directErr) {
        console.error("Error in direct query:", directErr);
      }
      
      // If direct query failed, try edge function
      if (!directQuerySucceeded) {
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
            body: { 
              limit: finalLimit,
              offset: finalOffset
            }
          });
          
          if (edgeError) {
            throw new Error(`Edge function error: ${edgeError.message}`);
          }
          
          if (edgeData?.channels && Array.isArray(edgeData.channels)) {
            channelData = edgeData.channels as Channel[];
            console.log(`Fetched ${channelData.length} channels from edge function`);
            
            // Update count if it seems more accurate
            if (edgeData.totalCount && edgeData.totalCount > count) {
              setTotalCount(edgeData.totalCount);
            }
          }
        } catch (edgeErr) {
          console.error("Edge function error:", edgeErr);
          throw edgeErr;
        }
      }
      
      if (channelData.length === 0) {
        console.log("No channels found in database");
      }
      
      // Map the metadata to ensure proper typing
      const typedChannels: Channel[] = channelData.map(channel => ({
        ...channel,
        metadata: channel.metadata as Channel['metadata']
      }));
      
      setChannels(typedChannels);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      setError(error.message || "Failed to load channels");
      toast.error("Failed to load channels. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = (channelId: string) => {
    navigate(`/admin/channels/edit/${channelId}`);
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
      fetchChannels();
    } catch (error: any) {
      console.error("Error deleting channel:", error);
      toast.error("Failed to delete channel: " + error.message);
    }
  };

  const toggleFeatured = async (channelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("youtube_channels")
        .update({ 
          is_featured: !currentStatus 
        })
        .eq("id", channelId);
      
      if (error) throw error;
      
      toast.success(`Channel ${!currentStatus ? "featured" : "unfeatured"} successfully`);
      
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

  const toggleChannelSelection = (channelId: string) => {
    setSelectedChannels(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(channelId)) {
        newSelection.delete(channelId);
      } else {
        newSelection.add(channelId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedChannels(new Set());
  };

  const selectAllChannels = () => {
    const channelIds = channels.map(channel => channel.id);
    setSelectedChannels(new Set(channelIds));
  };

  const isChannelSelected = (channelId: string) => {
    return selectedChannels.has(channelId);
  };

  const getSelectedCount = () => {
    return selectedChannels.size;
  };

  const getSelectedChannels = () => {
    return channels
      .filter(channel => selectedChannels.has(channel.id))
      .map(channel => ({
        id: channel.id,
        url: channel.channel_url,
        title: channel.channel_title
      }));
  };

  return {
    channels,
    loading,
    error,
    totalCount,
    selectedChannels,
    fetchChannels,
    handleEdit,
    handleDelete,
    toggleFeatured,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels
  };
}
