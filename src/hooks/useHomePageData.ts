
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel, VideoStats } from '@/types/youtube';
import { useMemo, useEffect } from 'react';

export function useHomePageData(page: number, channelsPerPage: number) {
  const queryClient = useQueryClient();
  
  // Prefetch next page when user is on current page
  useEffect(() => {
    const nextPage = page + 1;
    const prefetchNextPage = async () => {
      const offset = nextPage * channelsPerPage;
      await queryClient.prefetchQuery({
        queryKey: ['channels', 'homepage', nextPage, channelsPerPage],
        queryFn: async () => {
          try {
            const { data, count, error } = await supabase
              .from('youtube_channels')
              .select('*, videoStats:youtube_video_stats(*)', { count: 'exact' })
              .order('created_at', { ascending: false })
              .range(offset, offset + channelsPerPage - 1);
            
            if (error) throw error;
            
            return { 
              channels: data as Channel[] || [], 
              totalCount: count || 0 
            };
          } catch (err) {
            console.error('Error prefetching next page:', err);
            return { channels: [], totalCount: 0 };
          }
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    };
    
    prefetchNextPage();
  }, [page, channelsPerPage, queryClient]);

  // Main query for current page
  const channelsQuery = useQuery({
    queryKey: ['channels', 'homepage', page, channelsPerPage],
    queryFn: async () => {
      try {
        const offset = (page - 1) * channelsPerPage;
        
        console.log(`Fetching channels for homepage, page ${page}, offset ${offset}, limit ${channelsPerPage}`);
        
        // Only select necessary fields to reduce payload size
        const { data: channelsData, error: channelsError, count } = await supabase
          .from("youtube_channels")
          .select(`
            id, 
            channel_title, 
            description, 
            total_subscribers, 
            total_views, 
            screenshot_url, 
            channel_category, 
            niche, 
            is_featured,
            videoStats:youtube_video_stats(id, title, thumbnail_url, views, likes, channel_id, video_id)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + channelsPerPage - 1);
          
        if (channelsError) {
          console.error("Error fetching channels:", channelsError);
          throw channelsError;
        }
        
        console.log(`Successfully fetched ${channelsData?.length || 0} channels, total count: ${count || 0}`);
        
        return { 
          channels: channelsData as Channel[] || [],
          totalCount: count || 0
        };
      } catch (err: any) {
        console.error('Error fetching channels:', err);
        throw new Error(err.message || 'Failed to load channels. Please try again later.');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
  
  // Separate optimized query for featured channels
  const featuredQuery = useQuery({
    queryKey: ['channels', 'featured'],
    queryFn: async () => {
      try {
        console.log("Fetching featured channels");
        
        // Only select fields we need to display for featured channels
        const { data: featuredData, error: featuredError } = await supabase
          .from('youtube_channels')
          .select(`
            id, 
            channel_title, 
            description, 
            total_subscribers, 
            total_views, 
            screenshot_url, 
            channel_category, 
            niche, 
            is_featured,
            videoStats:youtube_video_stats(id, title, thumbnail_url, views, likes, channel_id, video_id)
          `)
          .eq('is_featured', true)
          .limit(3);
          
        if (featuredError) {
          console.error("Error fetching featured channels:", featuredError);
          throw featuredError;
        }
        
        console.log(`Successfully fetched ${featuredData?.length || 0} featured channels`);
        
        return featuredData as Channel[] || [];
      } catch (err: any) {
        console.error('Error fetching featured channels:', err);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for featured content
    retry: 2,
  });
  
  // Extract all videos for the FeaturedVideos component using memoization
  const allVideos = useMemo(() => {
    const channels = [
      ...(channelsQuery.data?.channels || []), 
      ...(featuredQuery.data || [])
    ];
    
    return channels
      .flatMap(channel => channel.videoStats || [])
      .filter((video): video is VideoStats => !!video)
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 10);
  }, [channelsQuery.data?.channels, featuredQuery.data]);
  
  return {
    channels: channelsQuery.data?.channels || [],
    featuredChannels: featuredQuery.data || [],
    totalChannels: channelsQuery.data?.totalCount || 0,
    allVideos,
    isLoading: channelsQuery.isLoading || featuredQuery.isLoading,
    isError: channelsQuery.isError || featuredQuery.isError,
    error: channelsQuery.error || featuredQuery.error
  };
}
