
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { channelTypes as localChannelTypes } from "@/components/youtube/channel-list/constants";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description: string | null;
  production: string | null;
  example: string | null;
  image_url: string | null;
}

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  try {
    // First try to get from database with error handling
    try {
      const { data, error } = await supabase
        .from('channel_types')
        .select('*')
        .order('label');
      
      if (error) {
        console.error('Database error fetching channel types:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        return data;
      }
    } catch (dbError) {
      console.warn('Falling back to local channel types due to database error:', dbError);
    }
    
    // Return local types as fallback
    console.info('Using local channel types fallback');
    return localChannelTypes.map(type => ({
      id: type.id,
      label: type.label,
      description: type.description,
      production: type.production,
      example: type.example,
      image_url: null
    }));
  } catch (err) {
    console.error('Exception fetching channel types:', err);
    // Return local types as fallback
    return localChannelTypes.map(type => ({
      id: type.id,
      label: type.label,
      description: type.description,
      production: type.production,
      example: type.example,
      image_url: null
    }));
  }
};

export const fetchChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  try {
    // First try to get from database
    try {
      const { data, error } = await supabase
        .from('channel_types')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching channel type with id ${id}:`, error);
        throw error;
      }
      
      if (data) return data;
    } catch (dbError) {
      console.warn("Database error, falling back to local channel types:", dbError);
    }
    
    // If not found in database or if there was an error, check local constants
    const localType = localChannelTypes.find(type => type.id === id);
    if (localType) {
      // Convert to match ChannelTypeInfo interface
      return {
        id: localType.id,
        label: localType.label,
        description: localType.description,
        production: localType.production,
        example: localType.example,
        image_url: null
      };
    }
    
    // If not found in either place, return null
    return null;
  } catch (error) {
    console.error(`Error in fetchChannelTypeById for id ${id}:`, error);
    
    // Final fallback to local types
    const localType = localChannelTypes.find(type => type.id === id);
    if (localType) {
      return {
        id: localType.id,
        label: localType.label,
        description: localType.description,
        production: localType.production,
        example: localType.example,
        image_url: null
      };
    }
    
    return null;
  }
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
