
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';
import { Json } from '@/integrations/supabase/types';
import { transformChannelData } from '@/pages/Admin/components/dashboard/utils/channelMetadataUtils';
import { getCache, setCache } from '@/utils/cacheUtils';

// Cache settings
const CACHE_KEY_PREFIX = 'homepage_channels_page_';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Hook to fetch the main channels for the homepage with optimized field selection and caching
 */
export function useHomePageChannels(page: number, channelsPerPage: number) {
  const cacheKey = `${CACHE_KEY_PREFIX}${page}_${channelsPerPage}`;
  
  return useQuery({
    queryKey: ['channels', 'homepage', page, channelsPerPage],
    queryFn: async () => {
      try {
        const offset = (page - 1) * channelsPerPage;
        
        console.log(`Fetching channels for homepage, page ${page}, offset ${offset}, limit ${channelsPerPage}`);
        
        // Try to get from cache first
        const cachedData = getCache<{channels: Channel[], totalCount: number}>(cacheKey, { version: CACHE_VERSION });
        if (cachedData) {
          console.log(`Using cached homepage channels data for page ${page}`);
          return cachedData;
        }
        
        // Only select the fields we need for homepage display
        const requiredFields = [
          'id', 
          'channel_title', 
          'description', 
          'total_subscribers', 
          'total_views', 
          'screenshot_url', 
          'niche',
          'video_count'
        ];
        
        // First try getting the count to know how many channels exist
        const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            countOnly: true
          }
        });
        
        if (countError) {
          console.error("Error getting count from edge function:", countError);
          // Don't throw - continue and try direct query as fallback
        }
        
        const totalCount = countData?.totalCount || 0;
        console.log("Total channel count from edge function:", totalCount);
        
        // Now fetch the actual channels for this page with optimized field selection
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            limit: channelsPerPage,
            offset: offset,
            fields: requiredFields
          },
          // Add cache control headers for the client
          headers: {
            'Cache-Control': 'max-age=300' // 5 minute cache
          }
        });
        
        if (edgeError) {
          console.error("Edge function error:", edgeError);
          // Try fallback to direct query with field selection
          const { data: directData, error: directError, count } = await supabase
            .from("youtube_channels")
            .select(requiredFields.join(','), { count: 'exact' })
            .order("created_at", { ascending: false })
            .range(offset, offset + channelsPerPage - 1);

          if (directError) {
            console.error("Direct query also failed:", directError);
            // Return empty data instead of throwing
            return { 
              channels: [] as Channel[],
              totalCount: 0
            };
          }
          
          console.log(`Successfully fetched ${directData?.length || 0} channels directly from Supabase`);
          
          if (!directData || !Array.isArray(directData)) {
            return {
              channels: [] as Channel[],
              totalCount: count || 0 
            };
          }
          
          const result = { 
            channels: transformChannelData(directData as { metadata?: Json }[]),
            totalCount: count || 0
          };
          
          // Cache the results
          setCache(cacheKey, result, { 
            expiry: CACHE_DURATION,
            version: CACHE_VERSION
          });
          
          return result;
        }
        
        if (!edgeData?.channels || !Array.isArray(edgeData.channels)) {
          console.error("Edge function returned invalid data:", edgeData);
          return { 
            channels: [] as Channel[],
            totalCount: totalCount || 0
          };
        }
        
        // Validate the returned data has the expected structure
        const isValidData = edgeData.channels.length === 0 || 
          (edgeData.channels[0] && 'id' in edgeData.channels[0]);
          
        if (!isValidData) {
          console.warn("Edge function returned invalid channel data format");
          return { 
            channels: [] as Channel[],
            totalCount: totalCount || 0
          };
        }
        
        console.log(`Successfully fetched ${edgeData.channels.length} channels using edge function`);
        
        const result = { 
          channels: transformChannelData(edgeData.channels as { metadata?: Json }[]),
          totalCount: edgeData.totalCount || totalCount
        };
        
        // Cache the results
        setCache(cacheKey, result, { 
          expiry: CACHE_DURATION,
          version: CACHE_VERSION
        });
        
        return result;
      } catch (err: any) {
        console.error('Error fetching homepage channels:', err);
        // Return empty data instead of throwing
        return { 
          channels: [] as Channel[],
          totalCount: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff up to 5 seconds
    retry: 2 // Retry failed requests up to 2 times
  });
}
