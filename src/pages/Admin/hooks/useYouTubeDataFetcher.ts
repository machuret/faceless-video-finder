
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
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    console.log("Fetching YouTube data for URL:", youtubeUrl);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });
      
      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }
      
      if (!data?.channelData) {
        console.error('No channel data in response:', data);
        throw new Error('No channel data was found');
      }
      
      console.log("YouTube data fetched:", data);
      
      const channelData = data.channelData;
      
      // Map API data to form data
      const formattedData: ChannelFormData = {
        video_id: channelData.channelId || "",
        channel_title: channelData.title || "",
        channel_url: channelData.url || "",
        description: channelData.description || "",
        screenshot_url: channelData.thumbnailUrl || "",
        total_subscribers: channelData.subscriberCount ? String(channelData.subscriberCount) : "",
        total_views: channelData.viewCount ? String(channelData.viewCount) : "",
        start_date: channelData.publishedAt || "",
        video_count: channelData.videoCount ? String(channelData.videoCount) : "",
        cpm: "4", // Default CPM
        channel_type: channelData.channelType || "other",
        country: channelData.country || "",
        channel_category: "other", // Default category
        notes: "",
        keywords: channelData.keywords || []
      };
      
      setFormData(formattedData);
      console.log("Form data updated:", formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
      toast.error(`Failed to fetch YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchYoutubeData };
};
