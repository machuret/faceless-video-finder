
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Channel } from './types';

export const useChannels = (options = {}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching channels with options:', options);
      
      // Start with the base query
      let query = supabase
        .from('youtube_channels')
        .select('*');
      
      // Add options like filtering, sorting, etc. if provided
      // Apply them here...
      
      console.log('Executing Supabase query for channels');
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching channels:', error);
        throw new Error(error.message);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} channels`);
      setChannels(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in useChannels hook:', errorMessage);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Failed to load channels: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [options]);
  
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);
  
  return { channels, loading, error, refetch: fetchChannels };
};
