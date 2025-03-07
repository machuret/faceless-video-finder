
import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "@/types/forms";

interface AboutSectionFetcherProps {
  channelUrl: string;
  onAboutReceived: (about: string) => void;
}

const fetchAboutSection = async (channelUrl: string, onAboutReceived: (about: string) => void) => {
  if (!channelUrl) {
    toast.error("Channel URL or name is required to fetch about section");
    return;
  }

  try {
    toast.info("Fetching channel's about section...");
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📄 Requesting about section for: ${channelUrl}`);
    
    // Call the stats endpoint with fetchDescriptionOnly flag
    const { data, error } = await supabase.functions.invoke('fetch-channel-stats', {
      body: {
        url: channelUrl.trim(),
        timestamp,
        includeDescription: true,
        fetchDescriptionOnly: true
      }
    });
    
    if (error) {
      console.error(`[${timestamp}] ❌ Error fetching about section:`, error);
      toast.error(`Failed to fetch about section: ${error.message}`);
      return;
    }
    
    if (!data) {
      console.error(`[${timestamp}] ❌ No data received`);
      toast.error("No about section data received");
      return;
    }
    
    if (data.error) {
      console.error(`[${timestamp}] ❌ API error:`, data.error);
      toast.error(`Error: ${data.error}`);
      return;
    }
    
    if (!data.channelInfo || !data.channelInfo.description) {
      console.error(`[${timestamp}] ❌ No about section found`);
      toast.error("Could not retrieve about section");
      return;
    }
    
    console.log(`[${timestamp}] ✅ About section received:`, data.channelInfo.description);
    
    toast.success("Channel about section fetched successfully!");
    
    // Pass the about section up to the parent component
    onAboutReceived(data.channelInfo.description);
    
  } catch (err) {
    console.error("Unexpected error fetching about section:", err);
    toast.error(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

export { fetchAboutSection };
