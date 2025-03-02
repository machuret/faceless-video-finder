
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "../components/ChannelForm";

export const useChannelDataFetcher = (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<ChannelFormData>>
) => {
  const fetchChannelData = async (id: string) => {
    setLoading(true);
    console.log("🔍 FETCHING CHANNEL DATA - ID:", id);
    
    try {
      if (!id) {
        throw new Error("No channel ID provided");
      }

      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("❌ Database error when fetching channel:", error);
        throw new Error(`Error fetching channel: ${error.message}`);
      }

      if (!data) {
        console.error("❌ Channel not found - ID:", id);
        throw new Error(`Channel with ID ${id} not found`);
      }

      console.log("✅ Channel data retrieved successfully:", data);

      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

      const formData = {
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
      };
      
      console.log("📝 Setting form data with:", formData);
      setFormData(formData);

      toast.success("Channel data loaded successfully");
    } catch (error) {
      console.error("❌ Error in fetchChannelData:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to load channel data");
    } finally {
      setLoading(false);
    }
  };

  return { fetchChannelData };
};
