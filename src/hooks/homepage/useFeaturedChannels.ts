
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';

/**
 * Hook to fetch featured channels
 */
export function useFeaturedChannels() {
  return useQuery({
    queryKey: ['channels', 'featured'],
    queryFn: async () => {
      try {
        console.log("Fetching featured channels");
        
        // Try edge function first as it's more reliable with RLS
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
            body: { 
              limit: 3,
              offset: 0,
              featured: true
            }
          });
          
          if (!edgeError && edgeData?.channels && Array.isArray(edgeData.channels)) {
            console.log(`Successfully fetched ${edgeData.channels.length} featured channels using edge function`);
            return edgeData.channels as Channel[];
          }
        } catch (edgeErr) {
          console.error("Edge function error for featured channels:", edgeErr);
          // Fall through to direct query
        }
        
        // Fall back to direct query
        const { data, error } = await supabase
          .from('youtube_channels')
          .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche, is_featured')
          .eq('is_featured', true)
          .limit(3);
          
        if (error) {
          console.error("Error fetching featured channels via direct query:", error);
          return []; // Return empty array on error
        }
        
        console.log(`Successfully fetched ${data?.length || 0} featured channels via direct query`);
        return data as Channel[] || [];
      } catch (err) {
        console.error('Error fetching featured channels:', err);
        return []; // Return empty array on error for resilience
      }
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    retryDelay: 1000
  });
}
