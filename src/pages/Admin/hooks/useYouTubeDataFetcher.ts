
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
    console.log(`[${timestamp}] 🚀 [useYouTubeDataFetcher] Starting fetch with URL:`, youtubeUrl);
    
    if (!youtubeUrl) {
      console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] YouTube URL is empty`);
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    console.log(`[${timestamp}] 🔍 [useYouTubeDataFetcher] URL validation passed, proceeding with fetch`);
    setLoading(true);
    
    try {
      // Add more detailed logging
      console.log(`[${timestamp}] 📡 [useYouTubeDataFetcher] Preparing to call Supabase function with URL:`, youtubeUrl);
      
      // Create payload with the correct format
      const payload = { url: youtubeUrl.trim() };
      console.log(`[${timestamp}] 📦 [useYouTubeDataFetcher] Payload:`, JSON.stringify(payload));
      
      // Call the Supabase edge function with explicit content type
      console.log(`[${timestamp}] 🔄 [useYouTubeDataFetcher] Invoking edge function now...`);
      
      // Direct fetch to debug
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'fetch-youtube-data',
        {
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log(`[${timestamp}] 📦 [useYouTubeDataFetcher] Response received:`, 
        { functionData, functionError });
      
      if (functionError) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] Function error:`, functionError);
        throw new Error(`Edge function error: ${functionError.message || 'Unknown error'}`);
      }
      
      if (!functionData) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] No data returned`);
        throw new Error('No data returned from the server');
      }
      
      const { channelData, error } = functionData;
      
      if (error) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] Channel data error:`, error);
        throw new Error(error);
      }
      
      if (!channelData) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] No channel data:`, functionData);
        throw new Error('No channel data was found');
      }
      
      console.log(`[${timestamp}] ✅ [useYouTubeDataFetcher] Channel data fetched:`, channelData);
      
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
        channel_type: channelData.channelType || "creator",
        country: channelData.country || "",
        channel_category: "other", // Default category
        notes: "",
        keywords: channelData.keywords || []
      };
      
      console.log(`[${timestamp}] 📋 [useYouTubeDataFetcher] Formatted data:`, formattedData);
      setFormData(formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] Error details:`, errorMessage);
      toast.error(`Failed to fetch YouTube data: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log(`[${timestamp}] ⏱️ [useYouTubeDataFetcher] Loading state reset`);
    }
  };
  
  return { fetchYoutubeData };
};
