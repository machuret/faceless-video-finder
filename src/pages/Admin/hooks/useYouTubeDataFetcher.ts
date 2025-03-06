
import { Dispatch, SetStateAction, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";

/**
 * Hook for fetching YouTube channel data from various URL formats
 */
export const useYouTubeDataFetcher = (
  youtubeUrl: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [testResults, setTestResults] = useState<Array<{url: string, success: boolean, data: any}>>([]);

  /**
   * Main function to fetch YouTube data from a URL
   */
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
      console.log(`[${timestamp}] 📡 Calling edge function with URL:`, youtubeUrl.trim());
      
      // Add a little delay to make sure logs appear in the correct order
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Make the request to the edge function
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: youtubeUrl.trim(),
          allowMockData: useMockData,
          timestamp,
          attempt: attempts + 1
        }
      });
      
      setLastResponse(data);
      console.log(`[${timestamp}] 📡 Edge function response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, error);
        setLastError(error.message);
        toast.error(`Error: ${error.message}`);
        setLoading(false);
        return;
      }
      
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
        toast.error(`Error: ${data.error}`);
        setLoading(false);
        return;
      }
      
      // Handle response with just basic info
      if (data.basicInfo) {
        console.log(`[${timestamp}] ✅ Successfully received basic info:`, data.basicInfo);
        
        // Extract data
        const { videoTitle, channelTitle, channelId, videoId } = data.basicInfo;
        
        // Map to our form structure
        const formattedData: ChannelFormData = {
          video_id: videoId || "",
          channel_title: channelTitle || "",
          channel_url: channelId && channelId !== "Unknown" && channelId !== "Error" 
            ? `https://www.youtube.com/channel/${channelId}` 
            : "",
          description: `Video title: ${videoTitle || "Unknown"}` || "",
          screenshot_url: "",
          total_subscribers: "0",
          total_views: "0",
          start_date: new Date().toISOString().split('T')[0],
          video_count: "0",
          cpm: "4",
          channel_type: "creator",
          country: "",
          channel_category: "other",
          notes: `This is minimal data extracted via ${data.extractionMethod || "unknown method"}. Original URL: ${youtubeUrl}`,
          keywords: []
        };
        
        console.log(`[${timestamp}] ✅ Formatted minimal data:`, formattedData);
        toast.success("Successfully fetched basic YouTube data");
        setFormData(formattedData);
      } 
      // Handle full channel data response (mock or real)
      else if (data.channelData) {
        const { channelData, isMockData } = data;
        
        console.log(`[${timestamp}] ✅ Successfully received channel data:`, channelData);
        
        if (isMockData) {
          toast.warning("Using mock data (YouTube API extraction failed)");
        } else {
          toast.success("Successfully fetched YouTube channel data");
        }
        
        // Map the data to our form structure
        const formattedData: ChannelFormData = {
          video_id: channelData.channelId || "",
          channel_title: channelData.title || "",
          channel_url: channelData.url || "",
          description: channelData.description || "",
          screenshot_url: channelData.thumbnailUrl || "",
          total_subscribers: String(channelData.subscriberCount || "0"),
          total_views: String(channelData.viewCount || "0"),
          start_date: channelData.publishedAt || new Date().toISOString().split('T')[0],
          video_count: String(channelData.videoCount || "0"),
          cpm: "4",
          channel_type: channelData.channelType || "creator",
          country: channelData.country || "",
          channel_category: "other",
          notes: "",
          keywords: channelData.keywords || []
        };
        
        console.log(`[${timestamp}] ✅ Formatted data:`, formattedData);
        setFormData(formattedData);
      } else {
        console.error(`[${timestamp}] ❌ Unexpected data format:`, data);
        setLastError('Unexpected data format');
        toast.error("Received unexpected data format");
      }
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Unexpected error:`, error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Failed to load YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Test function to ping the edge function
   */
  const testEdgeFunction = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🧪 Testing edge function with ping...`);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { ping: true, timestamp }
      });
      
      console.log(`[${timestamp}] 🧪 Edge function ping response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function ping error:`, error);
        setLastError(error.message);
        toast.error(`Edge function error: ${error.message}`);
      } else {
        console.log(`[${timestamp}] ✅ Edge function ping successful:`, data);
        setLastResponse(data);
        toast.success("Edge function is working!");
      }
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Unexpected error testing edge function:`, error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Run a comprehensive test suite on multiple URL formats
   */
  const runTestSuite = async () => {
    setLoading(true);
    setTestResults([]);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🧪 Running comprehensive test suite...`);
    
    // Define test URLs
    const testUrls = [
      // Channel ID format
      "https://www.youtube.com/channel/UCttFk8-Nysnyw59aNlWOWzw", // 7-Second Riddles
      "https://youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw", // PewDiePie
      
      // Handle format
      "https://www.youtube.com/@7SecondRiddles",
      "@MrBeast",
      
      // Custom channel format
      "https://www.youtube.com/c/MarkRober",
      "https://youtube.com/c/veritasium",
      
      // User channel format
      "https://www.youtube.com/user/nigahiga",
      
      // Video format
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Astley
      "https://youtu.be/jNQXAC9IVRw", // First YouTube video
      
      // Short URLs
      "youtu.be/dQw4w9WgXcQ",
      
      // Invalid/unusual formats
      "https://www.youtube.com",
      "rickastley"
    ];
    
    // Test results
    const results = [];
    
    // Test each URL
    for (const url of testUrls) {
      try {
        console.log(`[${timestamp}] 🧪 Testing URL: ${url}`);
        
        const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
          body: { 
            url: url.trim(),
            timestamp,
            test: true
          }
        });
        
        if (error) {
          console.error(`[${timestamp}] ❌ Test failed for URL ${url}:`, error);
          results.push({
            url,
            success: false,
            data: { error: error.message }
          });
        } else if (data && data.basicInfo) {
          console.log(`[${timestamp}] ✅ Test passed for URL ${url}:`, data.basicInfo);
          results.push({
            url,
            success: true,
            data
          });
        } else {
          console.error(`[${timestamp}] ❌ Unexpected response format for URL ${url}:`, data);
          results.push({
            url,
            success: false,
            data: { error: "Unexpected response format", response: data }
          });
        }
        
        // Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`[${timestamp}] ❌ Error testing URL ${url}:`, error);
        results.push({
          url,
          success: false,
          data: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }
    }
    
    console.log(`[${timestamp}] 🧪 Test suite complete. Results:`, results);
    setTestResults(results);
    setLoading(false);
    
    // Count successful tests
    const successCount = results.filter(r => r.success).length;
    toast.info(`Test suite complete: ${successCount}/${testUrls.length} tests passed`);
    
    return results;
  };
  
  // Expose debug information and test functions
  const debugInfo = {
    lastError,
    lastResponse,
    attempts,
    testEdgeFunction,
    runTestSuite,
    testResults
  };
  
  return { fetchYoutubeData, debugInfo };
};
