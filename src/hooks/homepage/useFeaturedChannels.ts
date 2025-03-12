
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
        
        // Simplified query with minimal fields needed
        const { data, error } = await supabase
          .from('youtube_channels')
          .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche, is_featured')
          .eq('is_featured', true)
          .limit(3);
          
        if (error) {
          console.error("Error fetching featured channels:", error);
          
          // Try a fallback using our edge function
          try {
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
              body: { 
                limit: 3,
                offset: 0,
                featured: true
              }
            });
              
            if (edgeError) throw edgeError;
            
            console.log(`Successfully fetched ${edgeData?.channels?.length || 0} featured channels using edge function`);
            return edgeData?.channels as Channel[] || [];
          } catch (fallbackErr) {
            console.error("Fallback featured channels error:", fallbackErr);
            return [];
          }
        }
        
        console.log(`Successfully fetched ${data?.length || 0} featured channels`);
        return data as Channel[] || [];
      } catch (err) {
        console.error('Error fetching featured channels:', err);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000
  });
}
