
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
  const [deletingChannels, setDeletingChannels] = useState(false);

  const fetchChannels = useCallback(async (offset?: number, limit?: number) => {
    try {
      console.log("fetchChannels called with offset:", offset, "limit:", limit);
      setLoading(true);
      setError(null);
      
      // First fetch the total count of channels
      const { count, error: countError } = await supabase
        .from("youtube_channels")
        .select("*", { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error fetching channel count:", countError);
        throw countError;
      }
      
      setTotalCount(count || 0);
      console.log("Total channel count:", count);
      
      // Then fetch the actual data with pagination
      let query = supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Apply pagination parameters if provided
      if (typeof offset === 'number') {
        console.log("Applying offset to query:", offset);
        query = query.range(offset, (offset + (limit || 10)) - 1);
      }
      // Apply limit if provided but no offset (legacy behavior)
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
      
      // Transform the data to ensure metadata is properly typed
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is treated as ChannelMetadata or undefined
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

  const bulkDeleteChannels = async () => {
    if (selectedChannels.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedChannels.size} channels? This action cannot be undone.`)) return;
    
    try {
      setDeletingChannels(true);
      const channelIds = Array.from(selectedChannels);
      
      // Delete channels in batches to prevent timeout issues
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < channelIds.length; i += batchSize) {
        const batch = channelIds.slice(i, i + batchSize);
        
        // Process each channel in the batch
        for (const channelId of batch) {
          const { error } = await supabase
            .from("youtube_channels")
            .delete()
            .eq("id", channelId);
          
          if (error) {
            console.error(`Error deleting channel ${channelId}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        }
      }
      
      // Clear selection after deletion
      setSelectedChannels(new Set());
      
      // Show appropriate toast
      if (errorCount === 0) {
        toast.success(`Successfully deleted ${successCount} channels`);
      } else {
        toast.warning(`Deleted ${successCount} channels, but failed to delete ${errorCount} channels`);
      }
      
      // Refresh the channel list
      fetchChannels();
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      toast.error("An error occurred during bulk delete: " + error.message);
    } finally {
      setDeletingChannels(false);
    }
  };

  const toggleFeatured = async (channelId: string, currentStatus: boolean) => {
    try {
      // Update using the dedicated is_featured column
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

  // Toggle channel selection
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

  // Clear all selections
  const clearSelection = () => {
    setSelectedChannels(new Set());
  };

  // Select all channels on the current page
  const selectAllChannels = () => {
    const channelIds = channels.map(channel => channel.id);
    setSelectedChannels(new Set(channelIds));
  };

  // Check if a channel is selected
  const isChannelSelected = (channelId: string) => {
    return selectedChannels.has(channelId);
  };

  // Get the number of selected channels
  const getSelectedCount = () => {
    return selectedChannels.size;
  };

  // Get the selected channel IDs and URLs as an array of objects
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
    deletingChannels,
    fetchChannels,
    handleEdit,
    handleDelete,
    bulkDeleteChannels,
    toggleFeatured,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels
  };
}
