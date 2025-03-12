
import { Dispatch, SetStateAction, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { ChannelMetadata } from "@/types/youtube";

export const useChannelDataFetcher = (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  // Add a reference to track if we've already shown the success toast
  const successToastShown = useRef(false);

  const fetchChannelData = async (channelId: string) => {
    console.log("Fetching channel data for ID:", channelId);
    
    if (!channelId) {
      console.error("No channel ID provided");
      return;
    }
    
    setLoading(true);
    // Reset the toast tracking ref when starting a new fetch
    successToastShown.current = false;
    
    try {
      // Try edge function first as it's more reliable
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-by-id', {
        body: { channelId }
      });
      
      if (edgeError) {
        console.error("Edge function error:", edgeError);
        // Fall through to regular query
      } else if (edgeData?.channel) {
        console.log("Successfully fetched channel using edge function");
        
        // Map data from edge function to form data
        const channelData = edgeData.channel;
        
        // Extract channel type from metadata if available
        let channelType = channelData.channel_type || "";
        if (channelData.metadata) {
          // Safely access metadata properties by checking type
          const metadata = typeof channelData.metadata === 'object' ? channelData.metadata : {};
          if (metadata && 'ui_channel_type' in metadata) {
            channelType = (metadata as ChannelMetadata).ui_channel_type || channelData.channel_type || "";
          }
        }
        
        // Map database data to form data with safe defaults for all fields
        const formattedData: ChannelFormData = {
          id: channelData.id || "",
          video_id: channelData.video_id || "",
          channel_title: channelData.channel_title || "",
          channel_url: channelData.channel_url || "",
          description: channelData.description || "",
          screenshot_url: channelData.screenshot_url || "",
          total_subscribers: channelData.total_subscribers ? String(channelData.total_subscribers) : "",
          total_views: channelData.total_views ? String(channelData.total_views) : "",
          start_date: channelData.start_date || "",
          video_count: channelData.video_count ? String(channelData.video_count) : "",
          cpm: channelData.cpm ? String(channelData.cpm) : "4",
          channel_type: channelType,
          country: channelData.country || "US",
          channel_category: channelData.channel_category || "entertainment",
          notes: channelData.notes || "",
          keywords: Array.isArray(channelData.keywords) ? channelData.keywords : [],
          niche: channelData.niche || "",
          is_editor_verified: Boolean(channelData.is_editor_verified),
          ai_description: channelData.ai_description || ""
        };
        
        setFormData(formattedData);
        console.log("Form data updated from edge function:", formattedData);
        
        // Only show the toast if we haven't shown it yet for this fetch
        if (!successToastShown.current) {
          toast.success("Channel data loaded successfully");
          successToastShown.current = true;
        }
        
        setLoading(false);
        return;
      }
      
      // Fall back to direct Supabase query if edge function didn't work
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", channelId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error("Channel not found");
      }
      
      console.log("Channel data fetched via direct query:", data);
      
      // Extract channel type from metadata if available
      let channelType = data.channel_type || "";
      if (data.metadata) {
        // Safely access metadata properties by checking type
        const metadata = typeof data.metadata === 'object' ? data.metadata : {};
        if (metadata && 'ui_channel_type' in metadata) {
          channelType = (metadata as ChannelMetadata).ui_channel_type || data.channel_type || "";
        }
      }
      
      // Map database data to form data with safe defaults for all fields
      const formattedData: ChannelFormData = {
        id: data.id || "",
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers ? String(data.total_subscribers) : "",
        total_views: data.total_views ? String(data.total_views) : "",
        start_date: data.start_date || "",
        video_count: data.video_count ? String(data.video_count) : "",
        cpm: data.cpm ? String(data.cpm) : "4",
        channel_type: channelType,
        country: data.country || "US",
        channel_category: data.channel_category || "entertainment",
        notes: data.notes || "",
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        niche: data.niche || "",
        is_editor_verified: Boolean(data.is_editor_verified),
        ai_description: data.ai_description || ""
      };
      
      setFormData(formattedData);
      console.log("Form data updated from direct query:", formattedData);
      
      // Only show the toast if we haven't shown it yet for this fetch
      if (!successToastShown.current) {
        toast.success("Channel data loaded successfully");
        successToastShown.current = true;
      }
      
    } catch (error) {
      console.error("Error fetching channel data:", error);
      toast.error(`Failed to fetch channel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchChannelData };
};
