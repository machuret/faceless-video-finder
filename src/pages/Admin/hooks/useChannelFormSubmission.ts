
import { FormEvent, Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";

export const useChannelFormSubmission = (
  formData: ChannelFormData,
  setLoading: Dispatch<SetStateAction<boolean>>,
  redirectToList: boolean = true
) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submission initiated");
    console.log("Form data:", formData);
    
    if (!formData.video_id || !formData.channel_title || !formData.channel_url) {
      toast.error("Video ID, Channel Title, and Channel URL are required");
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate channel type for database storage (must be a valid DatabaseChannelType)
      let dbChannelType: DatabaseChannelType = "other";
      if (formData.channel_type && ["creator", "brand", "media", "other"].includes(formData.channel_type as string)) {
        dbChannelType = formData.channel_type as DatabaseChannelType;
      }
      
      // Validate channel category (must be a valid ChannelCategory)
      let channelCategory: ChannelCategory = "other";
      if (formData.channel_category && ["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"].includes(formData.channel_category as string)) {
        channelCategory = formData.channel_category as ChannelCategory;
      }
      
      // Prepare metadata with UI channel type
      const metadata = {
        ui_channel_type: formData.channel_type || "other"
      };
      
      // Format data for database
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
        cpm: formData.cpm ? parseFloat(formData.cpm) : null,
        channel_type: dbChannelType,
        country: formData.country || null,
        channel_category: channelCategory,
        notes: formData.notes || null,
        keywords: formData.keywords || [],
        metadata: metadata,
        is_featured: formData.is_featured || false
      };
      
      console.log("Formatted data for submission:", channelData);
      
      // Check if channel already exists by video_id
      const { data: existingChannel, error: queryError } = await supabase
        .from("youtube_channels")
        .select("id")
        .eq("video_id", formData.video_id)
        .maybeSingle();
      
      if (queryError) {
        throw new Error(`Error checking existing channel: ${queryError.message}`);
      }
      
      let result;
      
      if (existingChannel) {
        // Update existing channel
        console.log("Updating channel with ID:", existingChannel.id);
        result = await supabase
          .from("youtube_channels")
          .update(channelData)
          .eq("id", existingChannel.id)
          .select()
          .single();
        
        if (result.error) {
          throw new Error(`Error updating channel: ${result.error.message}`);
        }
        
        console.log("Channel updated successfully");
        toast.success("Channel updated successfully");
      } else {
        // Insert new channel
        console.log("Creating new channel");
        result = await supabase
          .from("youtube_channels")
          .insert(channelData)
          .select()
          .single();
        
        if (result.error) {
          throw new Error(`Error creating channel: ${result.error.message}`);
        }
        
        console.log("Channel created successfully");
        toast.success("Channel added successfully");
      }
      
      // Redirect to dashboard if requested
      if (redirectToList) {
        window.location.href = "/admin/dashboard";
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error saving channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { handleSubmit };
};
