
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { DatabaseChannelType, ChannelCategory } from "@/types/youtube";

export const useChannelFormSubmission = (
  isEditMode: boolean,
  channelId: string | undefined,
  formData: ChannelFormData,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form submission: edit mode =", isEditMode);
    console.log("Form data to submit:", formData);
    
    try {
      // Validate required fields
      if (!formData.channel_title || !formData.video_id) {
        throw new Error("Channel title and ID are required");
      }

      // Verify enum types
      const validTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
      const validCategories: ChannelCategory[] = ["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"];
      
      const channelType = validTypes.includes(formData.channel_type as DatabaseChannelType) 
        ? formData.channel_type as DatabaseChannelType 
        : "other";
        
      const channelCategory = validCategories.includes(formData.channel_category as ChannelCategory)
        ? formData.channel_category as ChannelCategory
        : "other";
      
      // Format data for database
      const channelData = {
        video_id: formData.video_id,
        channel_title: formData.channel_title,
        channel_url: formData.channel_url,
        description: formData.description,
        screenshot_url: formData.screenshot_url,
        total_subscribers: parseInt(formData.total_subscribers) || null,
        total_views: parseInt(formData.total_views) || null,
        start_date: formData.start_date || null,
        video_count: parseInt(formData.video_count) || null,
        cpm: parseFloat(formData.cpm) || 4,
        channel_type: channelType,
        country: formData.country || null,
        channel_category: channelCategory,
        notes: formData.notes || null
      };
      
      console.log("Database data to submit:", channelData);

      // Perform insert or update based on mode
      let result;
      
      if (isEditMode && channelId) {
        console.log("Updating channel with ID:", channelId);
        result = await supabase
          .from("youtube_channels")
          .update(channelData)
          .eq("id", channelId);
          
        if (result.error) throw result.error;
        toast.success("Channel updated successfully");
      } else {
        console.log("Creating new channel");
        result = await supabase
          .from("youtube_channels")
          .insert(channelData)
          .select("id")
          .single();
          
        if (result.error) throw result.error;
        toast.success("Channel created successfully");
      }
      
      console.log("Operation completed successfully:", result);
      
      // Redirect to dashboard after successful operation
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1500);
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to save channel");
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
};
