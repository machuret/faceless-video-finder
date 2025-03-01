
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
  console.log("Updating channel type:", channelType);
  
  // Make sure we're handling null values properly
  const updateData = {
    label: channelType.label,
    description: channelType.description || null,
    production: channelType.production || null,
    example: channelType.example || null
  };

  const { data, error } = await supabase
    .from('channel_types')
    .update(updateData)
    .eq('id', channelType.id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating channel type:", error, "Channel type:", channelType);
    throw error;
  }
  
  if (!data) {
    console.error("No data returned after update");
    throw new Error("No data returned after update");
  }
  
  console.log("Update successful, returned data:", data);
  return data as ChannelTypeInfo;
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
