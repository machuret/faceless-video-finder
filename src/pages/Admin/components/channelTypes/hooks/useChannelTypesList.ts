
import { useState, useCallback, useEffect } from "react";
import { ChannelTypeInfo, fetchChannelTypes, deleteChannelType } from "@/services/channelTypeService";
import { toast } from "sonner";

export const useChannelTypesList = () => {
  const [channelTypes, setChannelTypes] = useState<ChannelTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadChannelTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching channel types in useChannelTypesList");
      const types = await fetchChannelTypes();
      console.log(`Received ${types.length} channel types from service`);
      setChannelTypes(types);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching channel types');
      console.error("Error loading channel types:", error);
      setError(error);
      toast.error("Failed to load channel types");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load channel types on mount with retry logic
  useEffect(() => {
    // Retry up to 3 times with increasing delay
    const loadWithRetry = async () => {
      try {
        await loadChannelTypes();
      } catch (error) {
        if (retryCount < 3) {
          const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
          console.log(`Retrying channel types load after ${delay}ms (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      }
    };
    
    loadWithRetry();
  }, [loadChannelTypes, retryCount]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this channel type?`)) {
      return;
    }

    try {
      await deleteChannelType(id);
      toast.success("Channel type deleted successfully");
      
      // Refresh the list
      loadChannelTypes();
    } catch (error) {
      console.error("Error deleting channel type:", error);
      toast.error("Failed to delete channel type");
    }
  }, [loadChannelTypes]);

  return {
    channelTypes,
    loading,
    error,
    loadChannelTypes,
    handleDelete
  };
};
