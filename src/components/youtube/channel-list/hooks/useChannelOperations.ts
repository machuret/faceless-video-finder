
import { useState, useCallback, useRef } from "react";
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

export const useChannelOperations = () => {
  const navigate = useNavigate();
  // Use useRef for values that don't trigger re-renders
  const selectedChannelsRef = useRef<Record<string, boolean>>({});
  
  // Primary state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch channels with optimized data handling
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

  // Channel operations
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
      // Update local state to avoid refetching
      setChannels(prev => 
        prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, is_featured: !currentStatus } 
            : channel
        )
      );
    }
  };

  // Selection management
  const isChannelSelected = useCallback((channelId: string): boolean => {
    return !!selectedChannelsRef.current[channelId];
  }, []);

  const toggleChannelSelection = useCallback((channelId: string) => {
    selectedChannelsRef.current = {
      ...selectedChannelsRef.current,
      [channelId]: !selectedChannelsRef.current[channelId]
    };
    // Force a re-render
    setChannels(prev => [...prev]);
  }, []);

  const clearSelection = useCallback(() => {
    selectedChannelsRef.current = {};
    // Force a re-render
    setChannels(prev => [...prev]);
  }, []);

  const selectAllChannels = useCallback(() => {
    const newSelection: Record<string, boolean> = {};
    channels.forEach(channel => {
      newSelection[channel.id] = true;
    });
    selectedChannelsRef.current = newSelection;
    // Force a re-render
    setChannels(prev => [...prev]);
  }, [channels]);

  const getSelectedCount = useCallback((): number => {
    return Object.values(selectedChannelsRef.current).filter(Boolean).length;
  }, []);

  const getSelectedChannels = useCallback((): Channel[] => {
    return channels.filter(channel => selectedChannelsRef.current[channel.id]);
  }, [channels]);

  // Bulk operations
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
    fetchChannels,
    handleEdit,
    handleDelete,
    toggleFeatured,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels,
    handleChannelAction
  };
}
