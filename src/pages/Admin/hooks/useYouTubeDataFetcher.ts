
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "../components/ChannelForm";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";

export const useYouTubeDataFetcher = (
  youtubeUrl: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<ChannelFormData>>
) => {
  const fetchYoutubeData = async () => {
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching YouTube data for URL:", youtubeUrl);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Failed to fetch YouTube data: ${error.message}`);
      }

      if (!data) {
        console.error('No data received');
        throw new Error("No data received from YouTube API. Please check if the URL is correct.");
      }

      console.log("Received data from YouTube API:", data);

      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

      // Ensure we set valid default types
      const defaultChannelType: DatabaseChannelType = "other";
      const defaultChannelCategory: ChannelCategory = "other";

      setFormData({
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: formattedStartDate,
        video_count: data.video_count?.toString() || "",
        cpm: "4",
        channel_type: defaultChannelType,
        country: "",
        channel_category: defaultChannelCategory,
        notes: ""
      });

      toast.success("Channel data fetched successfully");
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error instanceof Error 
        ? `Failed to fetch channel data: ${error.message}` 
        : "Failed to fetch channel data. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return { fetchYoutubeData };
};
