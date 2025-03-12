
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Handles channel editing (navigation only)
 */
export const navigateToChannelEdit = (channelId: string, navigate: Function) => {
  navigate(`/admin/channels/edit/${channelId}`);
};

/**
 * Handles deletion of a single channel
 */
export const deleteChannel = async (channelId: string): Promise<boolean> => {
  if (!confirm("Are you sure you want to delete this channel?")) return false;
  
  try {
    const { error } = await supabase
      .from("youtube_channels")
      .delete()
      .eq("id", channelId);
    
    if (error) throw error;
    
    toast.success("Channel deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting channel:", error);
    toast.error("Failed to delete channel: " + error.message);
    return false;
  }
};

/**
 * Toggles featured status for a channel
 */
export const toggleFeaturedStatus = async (channelId: string, currentStatus: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("youtube_channels")
      .update({ 
        is_featured: !currentStatus 
      })
      .eq("id", channelId);
    
    if (error) throw error;
    
    toast.success(`Channel ${!currentStatus ? "featured" : "unfeatured"} successfully`);
    return true;
  } catch (error: any) {
    console.error("Error toggling featured status:", error);
    toast.error("Failed to update featured status: " + error.message);
    return false;
  }
};

/**
 * Handles bulk deletion of channels
 */
export const deleteMultipleChannels = async (channelIds: string[]): Promise<boolean> => {
  if (!confirm("Are you sure you want to delete these channels?")) return false;
  
  try {
    const { error } = await supabase
      .from("youtube_channels")
      .delete()
      .in("id", channelIds);
    
    if (error) throw error;
    
    toast.success("Channels deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error deleting channels:", error);
    toast.error("Failed to delete channels: " + error.message);
    return false;
  }
};
