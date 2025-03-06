
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
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🚀 Starting YouTube data fetch for: ${youtubeUrl}`);
      
      if (!youtubeUrl) {
        toast.error("Please enter a YouTube URL");
        return;
      }
      
      setLoading(true);
      
      // Prepare the payload
      const payload = { url: youtubeUrl.trim() };
      console.log(`[${timestamp}] 📦 Request payload:`, payload);
      
      console.log(`[${timestamp}] 🔄 Calling edge function: fetch-youtube-data`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: payload
      });
      
      console.log(`[${timestamp}] 📡 Response received:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data returned from edge function`);
        throw new Error('No data returned from the server');
      }
      
      const { channelData } = data;
      
      if (!channelData) {
        console.error(`[${timestamp}] ❌ No channel data in response:`, data);
        throw new Error('No channel data was found in the response');
      }
      
      console.log(`[${timestamp}] ✅ Channel data fetched successfully:`, channelData);
      
      // Map the data to our form structure
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
        channel_type: channelData.channelType || "creator",
        country: channelData.country || "",
        channel_category: "other", // Default category
        notes: "",
        keywords: channelData.keywords || []
      };
      
      console.log(`[${timestamp}] 📋 Mapped form data:`, formattedData);
      
      // Update the form
      setFormData(formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ Error in fetchYoutubeData:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load YouTube data: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log(`[${new Date().toISOString()}] ⏱️ Loading state reset to false`);
    }
  };
  
  return { fetchYoutubeData };
};
