
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";

export const useYouTubeDataFetcher = (
  youtubeUrl: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  const fetchYoutubeData = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 Starting YouTube data fetch for:`, youtubeUrl);
    
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl.trim() }
      });
      
      console.log(`[${timestamp}] 📡 Edge function response:`, { data, error });
      
      if (error) throw error;
      if (!data?.channelData) throw new Error('No channel data received');
      
      const { channelData } = data;
      
      // Map the data to our form structure
      const formattedData: ChannelFormData = {
        video_id: channelData.channelId || "",
        channel_title: channelData.title || "",
        channel_url: channelData.url || "",
        description: channelData.description || "",
        screenshot_url: channelData.thumbnailUrl || "",
        total_subscribers: String(channelData.subscriberCount || ""),
        total_views: String(channelData.viewCount || ""),
        start_date: channelData.publishedAt || "",
        video_count: String(channelData.videoCount || ""),
        cpm: "4",
        channel_type: "creator",
        country: channelData.country || "",
        channel_category: "other",
        notes: "",
        keywords: []
      };
      
      console.log(`[${timestamp}] ✅ Formatted data:`, formattedData);
      
      setFormData(formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Error:`, error);
      toast.error(`Failed to load YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchYoutubeData };
};
