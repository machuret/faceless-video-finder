
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "../components/ChannelForm";

export const useChannelDataFetcher = (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<ChannelFormData>>
) => {
  const fetchChannelData = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching channel: ${error.message}`);
      }

      if (!data) {
        throw new Error("Channel not found");
      }

      console.log("Channel data fetched for editing:", data);

      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

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
        cpm: data.cpm?.toString() || "4",
        channel_type: data.channel_type || "",
        country: data.country || "",
        channel_category: data.channel_category || "",
        notes: data.notes || ""
      });

      toast.success("Channel data loaded successfully");
    } catch (error) {
      console.error("Error fetching channel data:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to load channel data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchChannelData };
};
