
import { useState, useCallback } from "react";
import { Channel } from "@/types/youtube";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fetchChannelData } from "./services/channelFetchService";
import { 
  deleteChannel, 
  navigateToChannelEdit,
  toggleFeaturedStatus,
  deleteMultipleChannels
} from "./services/channelMutationService";
import { useChannelSelection } from "./useChannelSelection";

export const useChannelOperations = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Use the channel selection hook
  const selection = useChannelSelection(channels);

  const fetchChannels = useCallback(async (offset: number = 0, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const { channels: fetchedChannels, totalCount } = await fetchChannelData(offset, limit);
      
      setChannels(fetchedChannels);
      setTotalCount(totalCount);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      setError(error.message || "Failed to load channels");
      toast.error("Failed to load channels. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = (channelId: string) => {
    navigateToChannelEdit(channelId, navigate);
  };

  const handleDelete = async (channelId: string) => {
    const success = await deleteChannel(channelId);
    if (success) {
      fetchChannels();
    }
  };

  const toggleFeatured = async (channelId: string, currentStatus: boolean) => {
    const success = await toggleFeaturedStatus(channelId, currentStatus);
    if (success) {
      setChannels(prev => 
        prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, is_featured: !currentStatus } 
            : channel
        )
      );
    }
  };

  const handleChannelAction = async (action: string, channelIds: string[], options = {}) => {
    try {
      if (action === 'edit' && channelIds.length === 1) {
        navigateToChannelEdit(channelIds[0], navigate);
      } else if (action === 'delete') {
        const success = await deleteMultipleChannels(channelIds);
        if (success) {
          fetchChannels();
        }
      }
    } catch (error: any) {
      console.error("Error handling channel action:", error);
      toast.error("Failed to handle channel action: " + error.message);
    }
  };

  return {
    channels,
    loading,
    error,
    totalCount,
    selectedChannels: selection.selectedChannels,
    fetchChannels,
    handleEdit,
    handleDelete,
    toggleFeatured,
    toggleChannelSelection: selection.toggleChannelSelection,
    clearSelection: selection.clearSelection,
    selectAllChannels: selection.selectAllChannels,
    isChannelSelected: selection.isChannelSelected,
    getSelectedCount: selection.getSelectedCount,
    getSelectedChannels: selection.getSelectedChannels,
    handleChannelAction
  };
}
