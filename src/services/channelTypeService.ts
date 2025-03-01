
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
  console.log("Starting update for channel type:", channelType);
  
  // Explicitly construct the update payload to ensure proper data format
  const updatePayload = {
    label: channelType.label,
    description: channelType.description || null,
    production: channelType.production || null,
    example: channelType.example || null
  };
  
  console.log("Update payload:", updatePayload);
  
  try {
    // First check if the record exists
    const { data: existingData, error: checkError } = await supabase
      .from('channel_types')
      .select('*')
      .eq('id', channelType.id)
      .single();
    
    if (checkError) {
      console.error("Error checking existing channel type:", checkError);
      throw checkError;
    }
    
    if (!existingData) {
      console.error("Channel type not found:", channelType.id);
      throw new Error(`Channel type with ID ${channelType.id} not found`);
    }
    
    console.log("Existing data found:", existingData);
    
    // Perform the update
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
      console.error("No data returned after update");
      throw new Error("Update succeeded but no data was returned");
    }
    
    console.log("Update successful, returned data:", data);
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
