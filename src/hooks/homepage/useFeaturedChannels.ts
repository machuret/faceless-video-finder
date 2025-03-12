
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';

export function useFeaturedChannels() {
  // Minimum fields needed for featured channels display
  const requiredFields = [
    'id', 
    'channel_title', 
    'description', 
    'total_subscribers', 
    'total_views', 
    'screenshot_url', 
    'niche'
  ];
  
  return useQuery({
    queryKey: ['channels', 'featured'],
    queryFn: async () => {
      console.log("Fetching featured channels");
      
      // Try edge function with optimized field selection and cache-control headers
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            limit: 3,
            offset: 0,
            featured: true,
            fields: requiredFields
          },
          headers: {
            'Cache-Control': 'max-age=300' // 5 minute cache
          }
        });
        
        if (!edgeError && edgeData?.channels && Array.isArray(edgeData.channels)) {
          console.log(`Successfully fetched ${edgeData.channels.length} featured channels using edge function`);
          return edgeData.channels as Channel[];
        }
      } catch (edgeErr) {
        console.error("Edge function error for featured channels:", edgeErr);
      }
      
      // Fallback to direct query with optimized field selection
      const { data, error } = await supabase
        .from('youtube_channels')
        .select(requiredFields.join(','))
        .eq('is_featured', true)
        .limit(3);
        
      if (error) throw error;
      
      return data as Channel[] || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
    retry: 2
  });
}
