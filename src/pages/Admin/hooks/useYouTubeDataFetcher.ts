
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
      console.error("YouTube URL is empty");
      return;
    }
    
    console.log("🔍 [useYouTubeDataFetcher] Attempting to fetch YouTube data for URL:", youtubeUrl);
    setLoading(true);
    
    try {
      console.log("📡 [useYouTubeDataFetcher] Sending request to edge function with URL:", youtubeUrl);
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'fetch-youtube-data',
        {
          body: { url: youtubeUrl }
        }
      );
      
      console.log("📦 [useYouTubeDataFetcher] Raw response from edge function:", functionData);
      
      if (functionError) {
        console.error('❌ [useYouTubeDataFetcher] Edge Function error:', functionError);
        throw functionError;
      }
      
      if (!functionData) {
        console.error('❌ [useYouTubeDataFetcher] Edge Function returned no data');
        throw new Error('No data returned from the server');
      }
      
      const { channelData, error } = functionData;
      
      if (error) {
        console.error('❌ [useYouTubeDataFetcher] Edge Function returned error:', error);
        throw new Error(error);
      }
      
      if (!channelData) {
        console.error('❌ [useYouTubeDataFetcher] No channel data in response:', functionData);
        throw new Error('No channel data was found');
      }
      
      console.log("✅ [useYouTubeDataFetcher] YouTube data fetched successfully:", channelData);
      
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
      
      console.log("📋 [useYouTubeDataFetcher] Form data prepared:", formattedData);
      setFormData(formattedData);
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error("❌ [useYouTubeDataFetcher] Error fetching YouTube data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ [useYouTubeDataFetcher] Error details:", errorMessage);
      toast.error(`Failed to fetch YouTube data: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log("⏱️ [useYouTubeDataFetcher] Loading state set to false");
    }
  };
  
  return { fetchYoutubeData };
};
