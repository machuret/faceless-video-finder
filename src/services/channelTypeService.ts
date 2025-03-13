
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description?: string;
  image_url?: string;
  example_channels?: string[];
}

// Default channel types for fallback
const DEFAULT_CHANNEL_TYPES: ChannelTypeInfo[] = [
  {
    id: "compilation",
    label: "Compilation Channel",
    description: "Channels that compile content from various sources into themed videos",
    image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000"
  },
  {
    id: "educational",
    label: "Educational Content",
    description: "Channels focused on teaching skills, concepts, or providing knowledge",
    image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000"
  },
  {
    id: "automation",
    label: "Automation Videos",
    description: "Videos showing automated processes, machines, or AI-generated content",
    image_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000"
  },
  {
    id: "shorts",
    label: "Shorts Channel",
    description: "Channels focused on short-form vertical video content",
    image_url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000"
  }
];

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  console.log("fetchChannelTypes service called");
  
  try {
    console.log("Fetching channel types from database");
    // Set up a timeout for the database request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Database request timed out after 8 seconds"));
      }, 8000);
    });

    // Database query promise
    const dbQueryPromise = supabase
      .from("channel_types")
      .select("id, label, description, image_url, example_channels")
      .order("label");

    // Race the database query against the timeout
    const result = await Promise.race([dbQueryPromise, timeoutPromise]);
    
    if ('data' in result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`Successfully fetched ${result.data.length} channel types`);
      return result.data as ChannelTypeInfo[];
    }
    
    // If no data returned, try edge function
    console.log("No data from direct query, attempting to fetch channel types via edge function");
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-channel-types');
    
    if (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      throw new Error(edgeFunctionError.message);
    }
    
    if (edgeFunctionData && Array.isArray(edgeFunctionData) && edgeFunctionData.length > 0) {
      console.log(`Successfully fetched ${edgeFunctionData.length} channel types via edge function`);
      return edgeFunctionData as ChannelTypeInfo[];
    }
    
    // If all else fails, return default types
    console.warn("Falling back to local channel types due to empty results");
    return DEFAULT_CHANNEL_TYPES;
  } catch (error) {
    console.error("Database error fetching channel types:", error);
    console.warn("Falling back to local channel types due to database error:", error);
    
    // Return default types if database query fails
    return DEFAULT_CHANNEL_TYPES;
  }
};
