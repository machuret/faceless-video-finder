
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";

export class DataFetcher {
  private youtubeUrl: string;
  private setLoading: Dispatch<SetStateAction<boolean>>;
  private setFormData: Dispatch<SetStateAction<ChannelFormData>>;
  private setLastError: Dispatch<SetStateAction<string | null>>;
  private setLastResponse: Dispatch<SetStateAction<any>>;
  private setAttempts: Dispatch<SetStateAction<number>>;

  constructor(
    youtubeUrl: string,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setFormData: Dispatch<SetStateAction<ChannelFormData>>,
    setLastError: Dispatch<SetStateAction<string | null>>,
    setLastResponse: Dispatch<SetStateAction<any>>,
    setAttempts: Dispatch<SetStateAction<number>>
  ) {
    this.youtubeUrl = youtubeUrl;
    this.setLoading = setLoading;
    this.setFormData = setFormData;
    this.setLastError = setLastError;
    this.setLastResponse = setLastResponse;
    this.setAttempts = setAttempts;
  }

  async fetchYoutubeData(useMockData = false): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 Starting YouTube data fetch for:`, this.youtubeUrl);
    
    if (!this.youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    
    try {
      this.setLoading(true);
      this.setLastError(null);
      this.setAttempts(prev => prev + 1);
      console.log(`[${timestamp}] 📡 Calling edge function with URL:`, this.youtubeUrl.trim());
      
      // Add a little delay to make sure logs appear in the correct order
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Make the request to the edge function
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: this.youtubeUrl.trim(),
          allowMockData: useMockData,
          timestamp,
          attempt: this.getAttempts() + 1
        }
      });
      
      this.setLastResponse(data);
      console.log(`[${timestamp}] 📡 Edge function response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function error:`, error);
        this.setLastError(error.message);
        toast.error(`Error: ${error.message}`);
        this.setLoading(false);
        return;
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data received`);
        this.setLastError('No data received');
        toast.error("No data received from the server");
        this.setLoading(false);
        return;
      }
      
      if (data.error) {
        console.error(`[${timestamp}] ❌ API error:`, data.error);
        this.setLastError(data.error);
        toast.error(`Error: ${data.error}`);
        this.setLoading(false);
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
          notes: `This is minimal data extracted via ${data.extractionMethod || "unknown method"}. Original URL: ${this.youtubeUrl}`,
          keywords: []
        };
        
        console.log(`[${timestamp}] ✅ Formatted minimal data:`, formattedData);
        toast.success("Successfully fetched basic YouTube data");
        this.setFormData(formattedData);
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
        this.setFormData(formattedData);
      } else {
        console.error(`[${timestamp}] ❌ Unexpected data format:`, data);
        this.setLastError('Unexpected data format');
        toast.error("Received unexpected data format");
      }
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Unexpected error:`, error);
      this.setLastError(error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Failed to load YouTube data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.setLoading(false);
    }
  }

  private getAttempts(): number {
    let currentAttempts = 0;
    this.setAttempts(attempts => {
      currentAttempts = attempts;
      return attempts;
    });
    return currentAttempts;
  }
}
