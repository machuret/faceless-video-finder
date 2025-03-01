
import { supabase } from "@/integrations/supabase/client";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description: string;
  production: string;
  example: string;
}

/**
 * Handles errors from Supabase operations on channel types
 */
const handleChannelTypeError = (error: any, operation: string): never => {
  const errorMsg = `Error ${operation} channel type: ${error.message || 'Unknown error'}`;
  console.error(errorMsg, error);
  throw new Error(errorMsg);
};

/**
 * Fetches all channel types from the database
 */
export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  try {
    console.log("Fetching channel types from database");
    const { data, error } = await supabase
      .from('channel_types')
      .select('*')
      .order('label', { ascending: true });
    
    if (error) {
      return handleChannelTypeError(error, 'fetching');
    }
    
    console.log(`Successfully fetched ${data.length} channel types`);
    return data as ChannelTypeInfo[];
  } catch (error) {
    return handleChannelTypeError(error, 'fetching');
  }
};

/**
 * Creates a new channel type in the database
 */
export const createChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  try {
    console.log("Creating new channel type:", channelType.id);
    
    if (!channelType.id || !channelType.label) {
      throw new Error("Channel type must have an ID and label");
    }
    
    const { data, error } = await supabase
      .from('channel_types')
      .insert({
        id: channelType.id,
        label: channelType.label,
        description: channelType.description || null,
        production: channelType.production || null,
        example: channelType.example || null
      })
      .select()
      .single();
    
    if (error) {
      return handleChannelTypeError(error, 'creating');
    }
    
    console.log("Channel type created successfully:", data.id);
    return data as ChannelTypeInfo;
  } catch (error) {
    return handleChannelTypeError(error, 'creating');
  }
};

/**
 * Updates an existing channel type in the database
 */
export const updateChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  try {
    console.log("Updating channel type with ID:", channelType.id);
    
    if (!channelType.id) {
      throw new Error("Cannot update channel type without an ID");
    }
    
    // Create a clean update object with explicit values
    const updateData = {
      label: channelType.label,
      description: channelType.description || null,
      production: channelType.production || null,
      example: channelType.example || null
    };
    
    console.log("Update payload:", JSON.stringify(updateData, null, 2));
    
    const { data, error } = await supabase
      .from('channel_types')
      .update(updateData)
      .eq('id', channelType.id)
      .select()
      .single();
    
    if (error) {
      console.error("Update operation failed with error:", error);
      return handleChannelTypeError(error, 'updating');
    }
    
    if (!data) {
      throw new Error(`No data returned after update for channel type ID: ${channelType.id}`);
    }
    
    console.log("Channel type updated successfully:", data);
    return data as ChannelTypeInfo;
  } catch (error) {
    console.error("Error in updateChannelType function:", error);
    return handleChannelTypeError(error, 'updating');
  }
};

/**
 * Deletes a channel type from the database
 */
export const deleteChannelType = async (id: string): Promise<void> => {
  try {
    console.log("Deleting channel type:", id);
    
    if (!id) {
      throw new Error("Cannot delete channel type: Missing ID");
    }
    
    const { error } = await supabase
      .from('channel_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleChannelTypeError(error, 'deleting');
    }
    
    console.log("Channel type deleted successfully:", id);
  } catch (error) {
    handleChannelTypeError(error, 'deleting');
  }
};

/**
 * Fetches a single channel type by ID
 */
export const getChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  try {
    console.log("Fetching channel type by ID:", id);
    
    if (!id) {
      throw new Error("Cannot fetch channel type: Missing ID");
    }
    
    const { data, error } = await supabase
      .from('channel_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No channel type found with ID: ${id}`);
        return null;
      }
      return handleChannelTypeError(error, 'fetching');
    }
    
    console.log("Channel type fetched successfully:", data);
    return data as ChannelTypeInfo;
  } catch (error) {
    return handleChannelTypeError(error, 'fetching');
  }
};
