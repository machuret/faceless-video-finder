
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';
import { Json } from '@/integrations/supabase/types';
import { transformChannelData } from '@/pages/Admin/components/dashboard/utils/channelMetadataUtils';
import { getCache, setCache } from '@/utils/cacheUtils';

// Cache settings
const CACHE_KEY = 'featured_channels';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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
      
      // Try to get from cache first
      const cachedData = getCache<Channel[]>(CACHE_KEY, { version: CACHE_VERSION });
      if (cachedData) {
        console.log("Using cached featured channels data");
        return cachedData;
      }
      
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
            'Cache-Control': 'max-age=900' // 15 minute cache
          }
        });
        
        if (!edgeError && edgeData?.channels && Array.isArray(edgeData.channels)) {
          // Check if the data is valid (has the expected structure)
          const isValidData = edgeData.channels.length === 0 || 
            (edgeData.channels[0] && 'id' in edgeData.channels[0]);
            
          if (isValidData) {
            console.log(`Successfully fetched ${edgeData.channels.length} featured channels using edge function`);
            // Type assertion with validation
            const channels = transformChannelData(edgeData.channels as { metadata?: Json }[]);
            
            // Cache the results
            setCache(CACHE_KEY, channels, { 
              expiry: CACHE_DURATION,
              version: CACHE_VERSION
            });
            
            return channels;
          } else {
            console.warn("Edge function returned invalid channel data format");
          }
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
      
      if (!data || !Array.isArray(data)) {
        return [] as Channel[];
      }
      
      const channels = transformChannelData(data as { metadata?: Json }[]);
      
      // Cache the results
      setCache(CACHE_KEY, channels, { 
        expiry: CACHE_DURATION,
        version: CACHE_VERSION
      });
      
      return channels;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - featured content updates infrequently
    gcTime: 30 * 60 * 1000,    // 30 minutes - keep in cache longer
    retry: 2
  });
}
