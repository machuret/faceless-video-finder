
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description?: string;
  image_url?: string | null;
  production?: string;
  example?: string;
  example_channels?: string[];
}

// Validate channel type ID format
export const validateChannelTypeId = (id: string): boolean => {
  // Only allow lowercase letters, numbers, and underscores
  const regex = /^[a-z0-9_]+$/;
  return regex.test(id);
};

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

    // Database query promise - update to select only fields that exist in the table
    const dbQueryPromise = supabase
      .from("channel_types")
      .select("id, label, description, image_url");

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

// Add the missing functions that are being imported in other components

// Fetch a single channel type by ID
export const fetchChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  try {
    console.log(`Fetching channel type with ID: ${id}`);
    
    // First try the database
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching channel type:", error);
      
      // If not found in the database, check if it's in the default types
      const defaultType = DEFAULT_CHANNEL_TYPES.find(type => type.id === id);
      if (defaultType) {
        return defaultType;
      }
      
      return null;
    }
    
    return data as ChannelTypeInfo;
  } catch (error) {
    console.error(`Error fetching channel type with ID ${id}:`, error);
    
    // Check if it's in the default types as fallback
    const defaultType = DEFAULT_CHANNEL_TYPES.find(type => type.id === id);
    if (defaultType) {
      return defaultType;
    }
    
    return null;
  }
};

// Create a new channel type
export const createChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  try {
    const { data, error } = await supabase
      .from("channel_types")
      .insert([{
        id: channelType.id,
        label: channelType.label,
        description: channelType.description || null,
        image_url: channelType.image_url || null
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as ChannelTypeInfo;
  } catch (error) {
    console.error("Error creating channel type:", error);
    throw new Error(`Failed to create channel type: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Update an existing channel type
export const updateChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  try {
    const { data, error } = await supabase
      .from("channel_types")
      .update({
        label: channelType.label,
        description: channelType.description || null,
        image_url: channelType.image_url || null
      })
      .eq("id", channelType.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as ChannelTypeInfo;
  } catch (error) {
    console.error("Error updating channel type:", error);
    throw new Error(`Failed to update channel type: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Delete a channel type
export const deleteChannelType = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("channel_types")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting channel type:", error);
    throw new Error(`Failed to delete channel type: ${error instanceof Error ? error.message : String(error)}`);
  }
};
