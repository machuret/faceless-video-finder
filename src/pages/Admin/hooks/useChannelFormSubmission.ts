
import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { DatabaseChannelType, ChannelCategory } from "@/types/youtube";

export const useChannelFormSubmission = (
  isEditMode: boolean,
  channelId: string | undefined,
  formData: ChannelFormData,
  setLoading: (loading: boolean) => void
) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submission initiated");
    console.log("Form data:", formData);
    
    // Validate required fields
    if (!formData.video_id || !formData.channel_title || !formData.channel_url) {
      toast.error("Please fill in all required fields");
      console.error("Missing required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Validate channel_type enum values
      const validChannelTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
      let channelType: DatabaseChannelType = "other";
      
      if (formData.channel_type && validChannelTypes.includes(formData.channel_type as DatabaseChannelType)) {
        channelType = formData.channel_type as DatabaseChannelType;
      }

      // Validate channel_category enum values
      const validCategories: ChannelCategory[] = [
        "entertainment", "education", "gaming", "music", 
        "news", "sports", "technology", "other"
      ];
      
      let channelCategory: ChannelCategory = "other";
      if (formData.channel_category && validCategories.includes(formData.channel_category as ChannelCategory)) {
        channelCategory = formData.channel_category as ChannelCategory;
      }
        
      // Format the data for the database
      const channelData = {
        video_id: formData.video_id,
        channel_title: formData.channel_title,
        channel_url: formData.channel_url,
        description: formData.description || null,
        screenshot_url: formData.screenshot_url || null,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : null,
        total_views: formData.total_views ? parseInt(formData.total_views) : null,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : null,
        cpm: formData.cpm ? parseFloat(formData.cpm) : 4,
        channel_type: channelType,
        country: formData.country || null,
        channel_category: channelCategory,
        notes: formData.notes || null,
        keywords: formData.keywords || null
      };
      
      console.log("Formatted data for submission:", channelData);
      
      let response;
      
      if (isEditMode && channelId) {
        console.log(`Updating channel with ID: ${channelId}`);
        response = await supabase
          .from("youtube_channels")
          .update(channelData)
          .eq("id", channelId);
      } else {
        console.log("Creating new channel");
        response = await supabase
          .from("youtube_channels")
          .insert(channelData);
      }
      
      const { error } = response;
      
      if (error) {
        console.error("Database operation failed:", error);
        toast.error(`Failed to ${isEditMode ? 'update' : 'add'} channel: ${error.message}`);
        return;
      }
      
      console.log(`Channel ${isEditMode ? 'updated' : 'added'} successfully`);
      toast.success(`Channel ${isEditMode ? 'updated' : 'added'} successfully!`);
      
      // Redirect to the dashboard after successful submission
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1500);
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { handleSubmit };
};
