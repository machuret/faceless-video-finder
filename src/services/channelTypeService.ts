
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
    image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000",
    production: "Production is typically simplified by collecting existing content and editing it together.",
    example: "Example: MrBeast Compilations"
  },
  {
    id: "educational",
    label: "Educational Content",
    description: "Channels focused on teaching skills, concepts, or providing knowledge",
    image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000",
    production: "Requires research and clear presentation of information.",
    example: "Example: Khan Academy"
  },
  {
    id: "automation",
    label: "Automation Videos",
    description: "Videos showing automated processes, machines, or AI-generated content",
    image_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1000",
    production: "Involves setting up systems that can generate content with minimal human intervention.",
    example: "Example: Daily Dose of Internet"
  },
  {
    id: "shorts",
    label: "Shorts Channel",
    description: "Channels focused on short-form vertical video content",
    image_url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000",
    production: "Quick, engaging content under 60 seconds.",
    example: "Example: Mr Beast Shorts"
  }
];

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  console.log("fetchChannelTypes service called");
  
  try {
    console.log("Fetching channel types from database");
    
    // Direct database query first
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url, production, example");
      
    if (error) {
      console.error("Database query error:", error);
      throw error;
    }
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched ${data.length} channel types from direct query`);
      return data as ChannelTypeInfo[];
    }
    
    // If direct query returns no results, try the edge function
    console.log("No data from direct query, attempting edge function");
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('get-channel-types');
    
    if (edgeFunctionError) {
      console.error("Edge function error:", edgeFunctionError);
      throw new Error(edgeFunctionError.message);
    }
    
    // Check if the edge function returned properly structured channel types
    if (edgeFunctionData && 
        edgeFunctionData.channelTypes && 
        Array.isArray(edgeFunctionData.channelTypes) && 
        edgeFunctionData.channelTypes.length > 0) {
      console.log(`Successfully fetched ${edgeFunctionData.channelTypes.length} channel types via edge function`);
      return edgeFunctionData.channelTypes as ChannelTypeInfo[];
    }
    
    // If we reach here, neither approach worked
    console.warn("Falling back to default channel types due to empty results");
    return DEFAULT_CHANNEL_TYPES;
  } catch (error) {
    console.error("Error fetching channel types:", error);
    console.warn("Falling back to default channel types due to error");
    
    // Return default types if all else fails
    return DEFAULT_CHANNEL_TYPES;
  }
};

// Fetch a single channel type by ID
export const fetchChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  try {
    console.log(`Fetching channel type with ID: ${id}`);
    
    // First try direct database query
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url, production, example")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching channel type:", error);
      
      // Check if it's in the default types
      const defaultType = DEFAULT_CHANNEL_TYPES.find(type => type.id === id);
      if (defaultType) {
        return defaultType;
      }
      
      return null;
    }
    
    if (data) {
      return data as ChannelTypeInfo;
    }
    
    // Check if it's in the default types as fallback
    const defaultType = DEFAULT_CHANNEL_TYPES.find(type => type.id === id);
    if (defaultType) {
      return defaultType;
    }
    
    return null;
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
        image_url: channelType.image_url || null,
        production: channelType.production || null,
        example: channelType.example || null
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
        image_url: channelType.image_url || null,
        production: channelType.production || null,
        example: channelType.example || null
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
