
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "../components/ChannelForm";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";

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

      // Explicitly validate channel_type and channel_category
      const validTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
      const validCategories: ChannelCategory[] = ["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"];
      
      const channelType: DatabaseChannelType = validTypes.includes(data.channel_type as DatabaseChannelType) 
        ? data.channel_type as DatabaseChannelType 
        : "other";
        
      const channelCategory: ChannelCategory = validCategories.includes(data.channel_category as ChannelCategory)
        ? data.channel_category as ChannelCategory
        : "other";
      
      console.log("Raw channel type from database:", data.channel_type);
      console.log("Processed channel type to use:", channelType);
      console.log("Raw channel category from database:", data.channel_category);
      console.log("Processed channel category to use:", channelCategory);

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
        channel_type: channelType,
        country: data.country || "",
        channel_category: channelCategory,
        notes: data.notes || ""
      };
      
      console.log("📝 Setting form data with:", formData);
      setFormData(formData);
      setLoading(false);

      toast.success("Channel data loaded successfully");
    } catch (error) {
      console.error("❌ Error in fetchChannelData:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to load channel data");
      setLoading(false);
    }
  };

  return { fetchChannelData };
};
