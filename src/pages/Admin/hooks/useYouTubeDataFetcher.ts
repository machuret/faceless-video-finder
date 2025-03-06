
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
      // Clear console to make logs more readable
      console.clear();
      
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🚀 [useYouTubeDataFetcher] Starting fetch with URL:`, youtubeUrl);
      
      if (!youtubeUrl) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] YouTube URL is empty`);
        toast.error("Please enter a YouTube URL");
        return;
      }
      
      console.log(`[${timestamp}] 🔍 [useYouTubeDataFetcher] URL validation passed, proceeding with fetch`);
      setLoading(true);
      
      // Create properly formatted payload
      const payload = { url: youtubeUrl.trim() };
      console.log(`[${timestamp}] 📦 [useYouTubeDataFetcher] Payload:`, JSON.stringify(payload));
      
      // Log function invocation start
      console.log(`[${timestamp}] 🔄 [useYouTubeDataFetcher] Invoking edge function now...`);

      // Use supabase.functions.invoke() instead of direct URL access
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: payload
      });
      
      console.log(`[${timestamp}] 📦 [useYouTubeDataFetcher] Response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] Error:`, error);
        throw new Error(error.message);
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] No data returned`);
        throw new Error('No data returned from the server');
      }
      
      const { channelData } = data;
      
      if (!channelData) {
        console.error(`[${timestamp}] ❌ [useYouTubeDataFetcher] No channel data:`, data);
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
      console.error(`[${new Date().toISOString()}] ❌ [useYouTubeDataFetcher] Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] ❌ [useYouTubeDataFetcher] Error details:`, errorMessage);
      toast.error(`Failed to fetch YouTube data: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log(`[${new Date().toISOString()}] ⏱️ [useYouTubeDataFetcher] Loading state reset`);
    }
  };
  
  return { fetchYoutubeData };
};
