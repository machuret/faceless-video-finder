export class YouTubeDataFetcher {
  private supabase;
  private setLoading;
  private setFormData;

  constructor(
    supabase: any,
    setLoading: (loading: boolean) => void,
    setFormData: (formData: any) => void
  ) {
    this.supabase = supabase;
    this.setLoading = setLoading;
    this.setFormData = setFormData;
  }

  async fetchChannelData(url: string) {
    this.setLoading(true);
    
    // Preserve the original casing when fetching YouTube channels
    // This is especially important for channel IDs which are case-sensitive
    try {
      // Clean the URL but preserve casing for channel IDs
      let processedUrl = url.trim();
      
      // Add protocol if missing
      if (!processedUrl.startsWith('http') && !processedUrl.startsWith('@')) {
        processedUrl = `https://${processedUrl}`;
      }
      
      // Ensure consistent format for the edge function
      if (processedUrl.startsWith('@')) {
        processedUrl = `https://www.youtube.com/${processedUrl}`;
      }
      
      // Continue with the fetch using the properly formatted URL
      const { data, error } = await this.supabase
        .functions.invoke('fetch-youtube-data', {
          body: { url: processedUrl }
        });

      if (error) {
        console.error("Error fetching YouTube data:", error);
        throw new Error(`Failed to fetch YouTube data: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from YouTube API");
      }

      if (data.error) {
        console.error("YouTube API error:", data.error);
        throw new Error(`YouTube API error: ${data.error}`);
      }

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
        keywords: []
      };

      // Update the form with the fetched data
      this.setFormData(formattedData);
      
      return {
        success: true,
        data: formattedData,
        debugInfo: {
          basicInfo,
          channelData,
          rawResponse: data
        }
      };
    } catch (error) {
      console.error("Error in fetchChannelData:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        debugInfo: { error }
      };
    } finally {
      this.setLoading(false);
    }
  }
}
