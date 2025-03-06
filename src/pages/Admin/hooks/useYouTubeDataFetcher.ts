
import { Dispatch, SetStateAction, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";

export const useYouTubeDataFetcher = (
  youtubeUrl: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const fetchYoutubeData = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 Starting YouTube data fetch for:`, youtubeUrl);
    
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    try {
      setLoading(true);
      setLastError(null);
      console.log(`[${timestamp}] 📡 Calling edge function with URL:`, youtubeUrl.trim());
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl.trim() }
      });
      
      // Store response for debugging
      setLastResponse(data);
      console.log(`[${timestamp}] 📡 Edge function response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, error);
        setLastError(error.message);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data received from edge function`);
        setLastError('No data received from edge function');
        throw new Error('No data received from edge function');
      }
      
      if (data.error) {
        console.error(`[${timestamp}] ❌ Error from edge function:`, data.error);
        setLastError(data.error);
        throw new Error(`Error from edge function: ${data.error}`);
      }
      
      if (!data.channelData) {
        console.error(`[${timestamp}] ❌ No channel data in response:`, data);
        setLastError('No channel data received');
        throw new Error('No channel data received');
      }
      
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
        channel_type: channelData.channelType || "creator",
        country: channelData.country || "",
        channel_category: "other",
        notes: "",
        keywords: channelData.keywords || []
      };
      
      console.log(`[${timestamp}] ✅ Formatted data:`, formattedData);
      
      setFormData(formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Error:`, error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Failed to load YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Expose debug information
  const debugInfo = {
    lastError,
    lastResponse
  };
  
  return { fetchYoutubeData, debugInfo };
};
