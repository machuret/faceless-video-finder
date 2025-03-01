
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChannelTypeInfo, 
  fetchChannelTypes, 
  deleteChannelType 
} from "@/services/channelTypeService";

export const useChannelTypesList = () => {
  const { toast } = useToast();
  const [channelTypes, setChannelTypes] = useState<ChannelTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadChannelTypes = async () => {
    try {
      setLoading(true);
      console.log("Fetching channel types...");
      const data = await fetchChannelTypes();
      console.log("Fetched channel types:", data);
      setChannelTypes(data);
      return data;
    } catch (error) {
      console.error("Error loading channel types:", error);
      toast({
        title: "Error loading channel types",
        description: "There was a problem fetching the channel types.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this channel type? This action cannot be undone.")) {
      try {
        console.log("Deleting channel type with ID:", id);
        await deleteChannelType(id);
        
        // Update local state
        setChannelTypes(prev => prev.filter(type => type.id !== id));
        
        toast({
          title: "Success",
          description: "Channel type deleted successfully."
        });
      } catch (error) {
        console.error("Error deleting channel type:", error);
        toast({
          title: "Error",
          description: "There was a problem deleting the channel type.",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    loadChannelTypes();
  }, []);

  return {
    channelTypes,
    loading,
    loadChannelTypes,
    handleDelete
  };
};
