
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { ChannelMetadata } from "@/types/youtube";

export const useChannelDataFetcher = (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  const fetchChannelData = async (channelId: string) => {
    console.log("Fetching channel data for ID:", channelId);
    
    if (!channelId) {
      console.error("No channel ID provided");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", channelId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error("Channel not found");
      }
      
      console.log("Channel data fetched:", data);
      
      // Map database data to form data
      const formattedData: ChannelFormData = {
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers ? String(data.total_subscribers) : "",
        total_views: data.total_views ? String(data.total_views) : "",
        start_date: data.start_date || "",
        video_count: data.video_count ? String(data.video_count) : "",
        cpm: data.cpm ? String(data.cpm) : "4",
        channel_type: data.metadata && typeof data.metadata === 'object' ? 
          (data.metadata as ChannelMetadata).ui_channel_type || data.channel_type || "" : 
          data.channel_type || "",
        country: data.country || "",
        channel_category: data.channel_category || "",
        notes: data.notes || "",
        keywords: data.keywords || []
      };
      
      setFormData(formattedData);
      console.log("Form data updated:", formattedData);
      toast.success("Channel data loaded successfully");
      
    } catch (error) {
      console.error("Error fetching channel data:", error);
      toast.error(`Failed to fetch channel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchChannelData };
};
