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

  const fetchChannels = useCallback(async (offset?: number, limit?: number) => {
    try {
      console.log("fetchChannels called with offset:", offset, "limit:", limit);
      setLoading(true);
      setError(null);
      
      const { count, error: countError } = await supabase
        .from("youtube_channels")
        .select("*", { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error fetching channel count:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      console.log("Total channel count:", count);
      
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (typeof offset === 'number') {
        console.log("Applying offset to query:", offset);
        query = query.range(offset, (offset + (limit || 10)) - 1);
      }
      else if (limit && typeof limit === 'number') {
        console.log("Applying limit to query:", limit);
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} channels from Supabase`);
      
      const typedChannels: Channel[] = (data || []).map(channel => ({
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
