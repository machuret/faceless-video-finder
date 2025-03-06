
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
      
      // Add a client-side timeout for the edge function call
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30-second timeout
      
      // Call the edge function with improved error handling
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: youtubeUrl.trim(),
          allowMockData: useMockData,
          timestamp,
          attempt: attempts + 1
        },
        signal: abortController.signal
      });
      
      // Clear timeout as soon as response is received
      clearTimeout(timeoutId);
      
      // Store response for debugging
      setLastResponse(data);
      console.log(`[${timestamp}] 📡 Edge function response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, error);
        setLastError(error.message);
        
        if (error.message.includes('AbortError') || error.message.includes('timeout')) {
          toast.error("Request timed out. The YouTube API may be experiencing issues.");
        } else {
          toast.error(`Edge function error: ${error.message}`);
        }
        return;
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data received from edge function`);
        setLastError('No data received from edge function');
        toast.error("No data received from the server");
        return;
      }
      
      if (data.error) {
        console.error(`[${timestamp}] ❌ Error from edge function:`, data.error);
        setLastError(data.error);
        
        // Check for common YouTube API errors
        if (data.error.includes('quota')) {
          toast.error("YouTube API quota exceeded. Please try again tomorrow.");
        } else if (data.error.includes('API key')) {
          toast.error("YouTube API key error. Please check your API key configuration.");
        } else {
          toast.error(`Error: ${data.error}`);
        }
        return;
      }
      
      if (!data.channelData) {
        console.error(`[${timestamp}] ❌ No channel data in response:`, data);
        setLastError('No channel data received');
        toast.error("No channel data received");
        return;
      }
      
      const { channelData, extractionMethod } = data;
      
      if (data.isMockData) {
        console.log(`[${timestamp}] ⚠️ Using mock data as fallback`);
        toast.warning("Using mock data as fallback. YouTube API extraction failed.");
      } else {
        console.log(`[${timestamp}] ✅ Successfully received channel data via ${extractionMethod || 'unknown'} method`);
        toast.success(`Successfully fetched YouTube channel data (${extractionMethod || 'direct'} method)`);
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
      toast.success("YouTube data loaded successfully");
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Unexpected error:`, error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again or use mock data.");
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
