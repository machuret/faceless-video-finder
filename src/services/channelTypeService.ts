
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description: string | null;
  production: string | null;
  example: string | null;
  image_url: string | null;
}

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  const { data, error } = await supabase
    .from('channel_types')
    .select('*')
    .order('label');
  
  if (error) {
    console.error('Error fetching channel types:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

export const fetchChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  const { data, error } = await supabase
    .from('channel_types')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching channel type with id ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const createChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  const { data, error } = await supabase
    .from('channel_types')
    .insert(channelType)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating channel type:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const updateChannelType = async (channelType: ChannelTypeInfo): Promise<ChannelTypeInfo> => {
  const { data, error } = await supabase
    .from('channel_types')
    .update(channelType)
    .eq('id', channelType.id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating channel type with id ${channelType.id}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteChannelType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('channel_types')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting channel type with id ${id}:`, error);
    throw new Error(error.message);
  }
};

export const validateChannelTypeId = (id: string): boolean => {
  const regex = /^[a-z0-9_]+$/;
  return regex.test(id);
};
