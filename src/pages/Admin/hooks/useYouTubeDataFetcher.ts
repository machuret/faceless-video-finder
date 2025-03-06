
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
  const [attempts, setAttempts] = useState(0);

  const fetchYoutubeData = async (useMockData = false) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 Starting YouTube data fetch for:`, youtubeUrl);
    
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    try {
      setLoading(true);
      setLastError(null);
      setAttempts(prev => prev + 1);
      console.log(`[${timestamp}] 📡 Calling edge function with URL:`, youtubeUrl.trim(), `(Attempt: ${attempts + 1})`);
      
      // Create timeout promise for client-side timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 12 seconds')), 12000);
      });
      
      // Make the actual request
      const fetchPromise = supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: youtubeUrl.trim(),
          allowMockData: useMockData || attempts > 0, // Allow mock data after first attempt
          timestamp,
          attempt: attempts + 1
        }
      });
      
      // Race between the fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      setLastResponse(result?.data);
      console.log(`[${timestamp}] 📡 Edge function response:`, result);
      
      if (result?.error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, result.error);
        setLastError(result.error.message);
        
        // Auto-retry with mock data on timeout
        if (result.error.message?.includes('timeout') || result.error.message?.includes('timed out')) {
          toast.error("Request timed out. Using mock data instead.");
          if (attempts < 2) {
            setTimeout(() => fetchYoutubeData(true), 500);
            return;
          }
        } else {
          toast.error(`Error: ${result.error.message}`);
        }
        setLoading(false);
        return;
      }
      
      const { data } = result || {};
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data received`);
        setLastError('No data received');
        toast.error("No data received from the server");
        setLoading(false);
        return;
      }
      
      if (data.error) {
        console.error(`[${timestamp}] ❌ API error:`, data.error);
        setLastError(data.error);
        
        // Auto-fallback to mock data on errors
        if (data.useMockData || attempts < 2) {
          toast.warning("API error. Using mock data instead.");
          setTimeout(() => fetchYoutubeData(true), 500);
          return;
        } else {
          toast.error(`Error: ${data.error}`);
        }
        
        setLoading(false);
        return;
      }
      
      const { channelData, isMockData } = data;
      
      if (!channelData) {
        console.error(`[${timestamp}] ❌ No channel data:`, data);
        setLastError('No channel data');
        toast.error("No channel data received");
        setLoading(false);
        return;
      }
      
      if (isMockData) {
        console.log(`[${timestamp}] ⚠️ Using mock data`);
        toast.warning("Using mock data (YouTube API extraction failed)");
      } else {
        console.log(`[${timestamp}] ✅ Successfully received channel data`);
        toast.success("Successfully fetched YouTube channel data");
      }
      
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
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Unexpected error:`, error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      
      // Auto-fallback to mock data on any error
      if (attempts < 2) {
        toast.error("Error occurred. Using mock data instead.");
        setTimeout(() => fetchYoutubeData(true), 500);
      } else {
        toast.error(`Failed to load YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Expose debug information
  const debugInfo = {
    lastError,
    lastResponse,
    attempts
  };
  
  return { fetchYoutubeData, debugInfo };
};
