
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel, VideoStats } from '@/types/youtube';
import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';

export function useHomePageData(page: number, channelsPerPage: number) {
  const queryClient = useQueryClient();
  
  // Prefetch next page when user is on current page
  useEffect(() => {
    const nextPage = page + 1;
    const prefetchNextPage = async () => {
      try {
        const offset = nextPage * channelsPerPage;
        
        await queryClient.prefetchQuery({
          queryKey: ['channels', 'homepage', nextPage, channelsPerPage],
          queryFn: async () => {
            try {
              console.log(`Prefetching page ${nextPage} with offset ${offset}`);
              
              // Use a more direct query approach with error handling
              let query = supabase
                .from('youtube_channels')
                .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + channelsPerPage - 1);
              
              const { data, count, error } = await query;
              
              if (error) {
                console.error("Error prefetching next page channels:", error);
                return { channels: [], totalCount: 0 };
              }
              
              console.log(`Successfully prefetched ${data?.length || 0} channels for next page`);
              
              return { 
                channels: data as Channel[] || [], 
                totalCount: count || 0 
              };
            } catch (err) {
              console.error('Error prefetching next page:', err);
              return { channels: [], totalCount: 0 };
            }
          },
          staleTime: 10 * 1000, // 10 seconds - shorter for testing
        });
      } catch (err) {
        console.error('Failed to prefetch next page:', err);
      }
    };
    
    // Only prefetch if we're not on the last known page
    prefetchNextPage();
  }, [page, channelsPerPage, queryClient]);

  // Simplified query for featured channels - reduce permissions needed and handle errors
  const featuredQuery = useQuery({
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
          
          // Try a fallback direct query with fewer fields if we get an error
          try {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('youtube_channels')
              .select('id, channel_title, screenshot_url')
              .limit(3);
              
            if (fallbackError) throw fallbackError;
            
            console.log(`Successfully fetched ${fallbackData?.length || 0} featured channels using fallback`);
            return fallbackData as Channel[] || [];
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
  
  // Main query for current page - simplified and with error handling
  const channelsQuery = useQuery({
    queryKey: ['channels', 'homepage', page, channelsPerPage],
    queryFn: async () => {
      try {
        const offset = (page - 1) * channelsPerPage;
        
        console.log(`Fetching channels for homepage, page ${page}, offset ${offset}, limit ${channelsPerPage}`);
        
        // Use a simpler query approach to avoid complex permissions issues
        const { data, error, count } = await supabase
          .from("youtube_channels")
          .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + channelsPerPage - 1);
          
        if (error) {
          console.error("Error fetching channels:", error);
          
          // Try a fallback approach using edge function
          try {
            // Use supabase.functions.invoke instead of direct URL access
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
              body: {
                limit: channelsPerPage,
                offset: offset
              }
            });
            
            if (edgeError) {
              throw new Error(`Edge function error: ${edgeError.message}`);
            }
            
            if (edgeData.channels && Array.isArray(edgeData.channels)) {
              console.log(`Successfully fetched ${edgeData.channels.length} channels using edge function`);
              return { 
                channels: edgeData.channels as Channel[],
                totalCount: edgeData.totalCount || 0
              };
            }
          } catch (edgeFnError) {
            console.error("Edge function error:", edgeFnError);
            // Continue to throw the original error
          }
          
          throw new Error("Failed to load channels. Please try again later.");
        }
        
        if (!data || data.length === 0) {
          console.log("No channels found");
        } else {
          console.log(`Successfully fetched ${data.length} channels`);
        }
        
        return { 
          channels: data as Channel[] || [],
          totalCount: count || 0
        };
      } catch (err: any) {
        console.error('Error fetching channels:', err);
        throw new Error(err.message || 'Failed to load channels. Please try again later.');
      }
    },
    staleTime: 10 * 1000, // 10 seconds - shorter for testing
    retry: 2,
    retryDelay: 1000
  });
  
  // Extract all videos using memoization
  const allVideos = useMemo(() => {
    const channels = channelsQuery.data?.channels || [];
    
    // Get videos from channels that have videoStats
    return channels
      .flatMap(channel => channel.videoStats || [])
      .filter((video): video is VideoStats => !!video)
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 10);
  }, [channelsQuery.data?.channels]);
  
  return {
    channels: channelsQuery.data?.channels || [],
    featuredChannels: featuredQuery.data || [],
    totalChannels: channelsQuery.data?.totalCount || 0,
    allVideos,
    isLoading: channelsQuery.isLoading || featuredQuery.isLoading,
    isError: channelsQuery.isError || featuredQuery.isError,
    error: channelsQuery.error ? 
      (channelsQuery.error instanceof Error ? channelsQuery.error.message : 'Failed to load channels') 
      : featuredQuery.error ? 'Failed to load featured channels' : null
  };
}
