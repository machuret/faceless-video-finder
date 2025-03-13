
import { useState, useCallback, useEffect } from "react";
import { ChannelTypeInfo, fetchChannelTypes, deleteChannelType } from "@/services/channelTypeService";
import { toast } from "sonner";

export const useChannelTypesList = () => {
  const [channelTypes, setChannelTypes] = useState<ChannelTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChannelTypes = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching channel types in useChannelTypesList");
      const types = await fetchChannelTypes();
      console.log(`Received ${types.length} channel types from service`);
      setChannelTypes(types);
    } catch (error) {
      console.error("Error loading channel types:", error);
      toast.error("Failed to load channel types");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load channel types on mount
  useEffect(() => {
    loadChannelTypes();
  }, [loadChannelTypes]);

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
    loadChannelTypes,
    handleDelete
  };
};
