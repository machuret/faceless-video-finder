
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { DatabaseChannelType, ChannelCategory } from "@/types/youtube";

export const useChannelDataFetcher = (
  setLoading: (loading: boolean) => void,
  setFormData: (data: ChannelFormData) => void
) => {
  const [error, setError] = useState<string | null>(null);

  const fetchChannelData = async (channelId: string) => {
    console.log("Fetching channel data for ID:", channelId);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", channelId)
        .single();

      if (error) {
        console.error("Error fetching channel:", error);
        setError(error.message);
        toast.error(`Failed to fetch channel: ${error.message}`);
        return;
      }

      if (!data) {
        const notFoundMsg = `Channel with ID ${channelId} not found`;
        console.error(notFoundMsg);
        setError(notFoundMsg);
        toast.error(notFoundMsg);
        return;
      }

      console.log("Channel data fetched:", data);

      // Validate channel_type enum values
      const validChannelTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
      const channelType = data.channel_type && validChannelTypes.includes(data.channel_type as DatabaseChannelType) 
        ? data.channel_type 
        : "other";

      // Validate channel_category enum values
      const validCategories: ChannelCategory[] = ["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"];
      const channelCategory = data.channel_category && validCategories.includes(data.channel_category as ChannelCategory)
        ? data.channel_category
        : "other";

      // Format the data for the form
      const formattedData: ChannelFormData = {
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: data.start_date || "",
        video_count: data.video_count?.toString() || "",
        cpm: data.cpm?.toString() || "4",
        channel_type: channelType || undefined,
        country: data.country || undefined,
        channel_category: channelCategory || undefined,
        notes: data.notes || ""
      };

      console.log("Formatted channel data for form:", formattedData);
      setFormData(formattedData);
      toast.success("Channel data loaded successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Unexpected error fetching channel:", err);
      setError(errorMsg);
      toast.error(`Error loading channel: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return { fetchChannelData, error };
};
