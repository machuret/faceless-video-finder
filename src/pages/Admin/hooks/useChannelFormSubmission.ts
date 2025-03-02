
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChannelFormData } from "../components/ChannelForm";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";

export const useChannelFormSubmission = (
  isEditMode: boolean,
  channelId: string | undefined,
  formData: ChannelFormData,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

  // Utility function to validate channel type
  const validateChannelType = (type: string | undefined): DatabaseChannelType => {
    const validTypes = ["other", "creator", "brand", "media"];
    
    if (!type || !validTypes.includes(type)) {
      console.warn(`Invalid channel type: ${type}, defaulting to "other"`);
      return "other";
    }
    
    console.log(`Validated channel type: ${type}`);
    return type as DatabaseChannelType;
  };

  // Utility function to validate channel category
  const validateChannelCategory = (category: string | undefined): ChannelCategory => {
    const validCategories = [
      "entertainment", "education", "gaming", "music", 
      "news", "sports", "technology", "other"
    ];
    
    if (!category || !validCategories.includes(category)) {
      console.warn(`Invalid channel category: ${category}, defaulting to "other"`);
      return "other";
    }
    
    console.log(`Validated channel category: ${category}`);
    return category as ChannelCategory;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validatedType = validateChannelType(formData.channel_type);
      const validatedCategory = validateChannelCategory(formData.channel_category);
      
      console.log("Form submission - channel_type:", formData.channel_type, "->", validatedType);
      console.log("Form submission - channel_category:", formData.channel_category, "->", validatedCategory);
      
      // Convert string values to appropriate types
      const parsedData = {
        video_id: formData.video_id,
        channel_title: formData.channel_title,
        channel_url: formData.channel_url,
        description: formData.description,
        screenshot_url: formData.screenshot_url,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : 0,
        total_views: formData.total_views ? parseInt(formData.total_views) : 0,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : 0,
        cpm: formData.cpm ? parseFloat(formData.cpm) : 4,
        channel_type: validatedType,
        country: formData.country || null,
        channel_category: validatedCategory,
        notes: formData.notes || null
      };

      console.log("Channel data to submit:", parsedData);

      if (isEditMode && channelId) {
        // Update existing channel
        console.log("Updating channel with ID:", channelId);
        const { error } = await supabase
          .from("youtube_channels")
          .update(parsedData)
          .eq("id", channelId);

        if (error) {
          console.error("Error updating channel:", error);
          throw new Error(`Error updating channel: ${error.message}`);
        }

        toast.success("Channel updated successfully");
      } else {
        // Create new channel
        console.log("Creating new channel");
        const { error } = await supabase
          .from("youtube_channels")
          .insert(parsedData);

        if (error) {
          console.error("Error creating channel:", error);
          throw new Error(`Error creating channel: ${error.message}`);
        }

        toast.success("Channel created successfully");
      }

      // Redirect to dashboard after successful operation
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save channel");
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit };
};
