
import { supabase } from "@/integrations/supabase/client";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description: string;
  production: string;
  example: string;
}

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  const { data, error } = await supabase.from('channel_types').select('*');
  
  if (error) {
    console.error("Error fetching channel types:", error);
    throw error;
  }
  
  return data as ChannelTypeInfo[];
};

export const createChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  const { data, error } = await supabase
    .from('channel_types')
    .insert(channelType)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating channel type:", error);
    throw error;
  }
  
  return data as ChannelTypeInfo;
};

export const updateChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  console.log("Updating channel type with data:", JSON.stringify(channelType, null, 2));
  
  if (!channelType.id) {
    const error = new Error("Cannot update channel type: Missing ID");
    console.error(error);
    throw error;
  }
  
  // Create a clean update payload with null handling
  const updatePayload = {
    label: channelType.label || null,
    description: channelType.description || null,
    production: channelType.production || null,
    example: channelType.example || null
  };
  
  console.log("Sending update payload to Supabase:", JSON.stringify(updatePayload, null, 2));
  
  try {
    const { data, error } = await supabase
      .from('channel_types')
      .update(updatePayload)
      .eq('id', channelType.id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error updating channel type:", error);
      throw error;
    }
    
    if (!data) {
      const noDataError = new Error("No data returned after update. The record may not exist.");
      console.error(noDataError);
      throw noDataError;
    }
    
    console.log("Update successful, returned data:", JSON.stringify(data, null, 2));
    return data as ChannelTypeInfo;
  } catch (error) {
    console.error("Exception during channel type update:", error);
    throw error;
  }
};

export const deleteChannelType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('channel_types')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting channel type:", error);
    throw error;
  }
};
