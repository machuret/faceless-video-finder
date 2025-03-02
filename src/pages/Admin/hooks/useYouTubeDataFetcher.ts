
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { DatabaseChannelType, ChannelCategory } from "@/types/youtube";

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

    console.log("Fetching YouTube data for URL:", youtubeUrl);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });

      if (error) {
        console.error("Error fetching YouTube data:", error);
        throw new Error(`Error fetching YouTube data: ${error.message}`);
      }

      if (!data || !data.channelId) {
        console.error("Invalid YouTube data returned:", data);
        throw new Error("Could not extract channel data from the provided URL");
      }

      console.log("YouTube data fetched successfully:", data);

      // Default values for enum fields
      const channelType: DatabaseChannelType = "other";
      const channelCategory: ChannelCategory = "other";

      // Convert start date to proper format
      const startDate = data.publishedAt ? 
        new Date(data.publishedAt).toISOString().split('T')[0] : 
        "";

      setFormData({
        video_id: data.channelId || "",
        channel_title: data.title || "",
        channel_url: data.channelUrl || youtubeUrl,
        description: data.description || "",
        screenshot_url: data.thumbnailUrl || "",
        total_subscribers: data.subscriberCount?.toString() || "",
        total_views: data.viewCount?.toString() || "",
        start_date: startDate,
        video_count: data.videoCount?.toString() || "",
        cpm: "4", // Default CPM
        channel_type: channelType,
        country: "",
        channel_category: channelCategory,
        notes: ""
      });

      toast.success("Channel data fetched successfully");
    } catch (error) {
      console.error("Error in fetchYoutubeData:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to fetch channel data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchYoutubeData };
};
