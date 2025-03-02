
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "../components/ChannelForm";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";

export const useChannelFormSubmission = (
  isEditMode: boolean,
  channelId: string | undefined,
  formData: ChannelFormData,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.video_id || !formData.channel_title || !formData.channel_url) {
        throw new Error("Please fill in all required fields: Channel ID, Title, and URL");
      }

      // Ensure we have valid types that match the database enum
      const channelType: DatabaseChannelType = validateChannelType(formData.channel_type);
      const channelCategory: ChannelCategory = validateChannelCategory(formData.channel_category);

      console.log("Prepared data for submission:", {
        channelType,
        channelCategory,
        isEditMode,
        channelId
      });

      const dataToSubmit = {
        video_id: formData.video_id.trim(),
        channel_title: formData.channel_title.trim(),
        channel_url: formData.channel_url.trim(),
        description: formData.description?.trim() || null,
        screenshot_url: formData.screenshot_url || null,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : null,
        total_views: formData.total_views ? parseInt(formData.total_views) : null,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : null,
        cpm: formData.cpm ? parseFloat(formData.cpm) : 4,
        channel_type: channelType,
        country: formData.country || null,
        channel_category: channelCategory,
        notes: formData.notes || null
      };

      console.log(`${isEditMode ? "EDITING" : "CREATING"} CHANNEL:`, {
        isEditMode,
        channelId,
        dataToSubmit
      });

      let result;
      
      if (isEditMode && channelId) {
        console.log("🔄 UPDATE OPERATION - Channel ID:", channelId);
        
        result = await supabase
          .from("youtube_channels")
          .update(dataToSubmit)
          .eq("id", channelId);
        
        console.log("Update result:", result);
      } else {
        console.log("➕ INSERT OPERATION");
        result = await supabase
          .from("youtube_channels")
          .insert(dataToSubmit)
          .select();
      }

      // Handle errors
      if (result.error) {
        console.error("Database operation failed:", result.error);
        throw new Error(`Database error: ${result.error.message || result.error.details || 'Unknown error'}`);
      }

      // Success message and redirect
      console.log(`Operation successful - ${isEditMode ? "Update" : "Insert"}:`, result);
      toast.success(`Channel ${isEditMode ? "updated" : "added"} successfully!`);
      
      // Add slight delay before navigation to ensure toast is seen
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (error) {
      console.error(`❌ ${isEditMode ? "Update" : "Create"} error:`, error);
      toast.error(error instanceof Error 
        ? `Failed to ${isEditMode ? "update" : "add"} channel: ${error.message}` 
        : `An unexpected error occurred while ${isEditMode ? "updating" : "adding"} the channel`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate channel type
  const validateChannelType = (type?: string): DatabaseChannelType => {
    if (!type) return "other";
    
    const validTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
    
    if (validTypes.includes(type as DatabaseChannelType)) {
      return type as DatabaseChannelType;
    }
    
    console.warn(`Channel type "${type}" is not valid. Using "other" instead.`);
    return "other";
  };

  // Helper function to validate channel category
  const validateChannelCategory = (category?: string): ChannelCategory => {
    if (!category) return "other";
    
    const validCategories: ChannelCategory[] = [
      "entertainment", "education", "gaming", "music", 
      "news", "sports", "technology", "other"
    ];
    
    if (validCategories.includes(category as ChannelCategory)) {
      return category as ChannelCategory;
    }
    
    console.warn(`Channel category "${category}" is not valid. Using "other" instead.`);
    return "other";
  };

  return { handleSubmit };
};
