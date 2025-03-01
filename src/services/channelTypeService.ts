
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
  console.log("Attempting to update channel type:", JSON.stringify(channelType, null, 2));
  
  if (!channelType.id) {
    throw new Error("Cannot update channel type: Missing ID");
  }
  
  // Direct approach: explicitly define all fields to update
  const { data, error } = await supabase
    .from('channel_types')
    .update({
      label: channelType.label || null,
      description: channelType.description || null,
      production: channelType.production || null,
      example: channelType.example || null
    })
    .eq('id', channelType.id)
    .select('*');  // Use select('*') to ensure we get all fields back
  
  if (error) {
    console.error("Failed to update channel type:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.error("No data returned after update. The record may not exist.");
    throw new Error(`No data returned for channel type with ID: ${channelType.id}`);
  }
  
  console.log("Channel type successfully updated:", JSON.stringify(data[0], null, 2));
  return data[0] as ChannelTypeInfo;
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
