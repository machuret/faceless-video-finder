
import { Dispatch, SetStateAction, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { ChannelCategory, Channel, DatabaseChannelType } from "@/types/youtube";

export const useChannelDataFetcher = (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  const fetchChannelData = useCallback(async (channelId: string) => {
    console.log("Fetching channel data for ID:", channelId);
    setLoading(true);
    
    try {
      // Fetch channel data from database
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", channelId)
        .single();
      
      if (error) {
        console.error("Error fetching channel data:", error);
        toast.error(`Failed to load channel data: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.error("No channel found with ID:", channelId);
        toast.error("Channel not found");
        return;
      }
      
      console.log("Channel data fetched:", data);
      
      // Map database data to form data
      const channel = data as Channel;
      
      // Handle enum types and validate
      let channelType = channel.channel_type as DatabaseChannelType;
      if (!channelType || !["creator", "brand", "media", "other"].includes(channelType)) {
        channelType = "other";
      }
      
      let channelCategory = channel.channel_category as ChannelCategory;
      if (!channelCategory || !["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"].includes(channelCategory)) {
        channelCategory = "other";
      }
      
      // Check for UI channel type in metadata
      const uiChannelType = channel.metadata?.ui_channel_type || "other";
      
      // Format data for the form
      const formattedData: ChannelFormData = {
        video_id: channel.video_id,
        channel_title: channel.channel_title,
        channel_url: channel.channel_url,
        description: channel.description || "",
        screenshot_url: channel.screenshot_url || "",
        total_subscribers: channel.total_subscribers?.toString() || "",
        total_views: channel.total_views?.toString() || "",
        start_date: channel.start_date || "",
        video_count: channel.video_count?.toString() || "",
        cpm: channel.cpm?.toString() || "4",
        channel_type: uiChannelType, // Use UI channel type from metadata
        country: channel.country || "",
        channel_category: channelCategory,
        notes: channel.notes || "",
        keywords: channel.keywords || []
      };
      
      console.log("Formatted channel data for form:", formattedData);
      setFormData(formattedData);
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred while loading channel data");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setFormData]);
  
  return { fetchChannelData };
};
