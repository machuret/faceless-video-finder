
import { SetStateAction, Dispatch } from "react";
import { ChannelFormData } from "@/types/forms";
import { supabase } from "@/integrations/supabase/client";
import { formatChannelUrl } from "../../components/channel-stats-fetcher/hooks/urlUtils";

export class YouTubeDataFetcher {
  private url: string;
  private setLoading: Dispatch<SetStateAction<boolean>>;
  private setFormData: Dispatch<SetStateAction<ChannelFormData>>;
  private setLastError: Dispatch<SetStateAction<string | null>>;
  private setLastResponse: Dispatch<SetStateAction<any>>;
  private setAttempts: Dispatch<SetStateAction<number>>;

  constructor(
    url: string,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setFormData: Dispatch<SetStateAction<ChannelFormData>>,
    setLastError: Dispatch<SetStateAction<string | null>>,
    setLastResponse: Dispatch<SetStateAction<any>>,
    setAttempts: Dispatch<SetStateAction<number>>
  ) {
    this.url = url;
    this.setLoading = setLoading;
    this.setFormData = setFormData;
    this.setLastError = setLastError;
    this.setLastResponse = setLastResponse;
    this.setAttempts = setAttempts;
  }

  async fetchYoutubeData(useMockData = false): Promise<void> {
    try {
      this.setLoading(true);
      this.setAttempts(prev => prev + 1);
      
      // Format the URL to ensure proper case sensitivity
      const formattedUrl = formatChannelUrl(this.url);
      
      // Call the Edge Function to fetch YouTube data
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: formattedUrl,
          useMockData 
        }
      });

      if (error) {
        this.setLastError(`Edge function error: ${error.message}`);
        return;
      }

      if (data.error) {
        this.setLastError(`API error: ${data.error}`);
        return;
      }

      this.setLastResponse(data);
      this.setLastError(null);

      // Extract basic info from the response
      const basicInfo = data.basicInfo || {};
      const channelData = data.channelData || {};
      const statistics = channelData.statistics || {};
      const snippet = channelData.snippet || {};

      // Format the data for our form
      const formattedData = {
        video_id: basicInfo.videoId || "",
        channel_title: basicInfo.channelTitle || "",
        channel_url: `https://www.youtube.com/channel/${basicInfo.channelId}`,
        description: snippet.description || "",
        screenshot_url: "",
        total_subscribers: statistics.subscriberCount || "",
        total_views: statistics.viewCount || "",
        start_date: snippet.publishedAt ? new Date(snippet.publishedAt).toISOString().split('T')[0] : "",
        video_count: statistics.videoCount || "",
        cpm: "4", // Default CPM
        channel_type: "",
        country: snippet.country || "US",
        channel_category: "entertainment",
        notes: `Extracted via YouTube API. Channel ID: ${basicInfo.channelId}`,
        keywords: [],
        niche: "",
        is_editor_verified: false
      };

      // Update the form with the fetched data
      this.setFormData(formattedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.setLastError(`Error fetching data: ${errorMessage}`);
      console.error("Error in fetchYoutubeData:", error);
    } finally {
      this.setLoading(false);
    }
  }
}
