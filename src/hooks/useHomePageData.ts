
import { useQueries, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel, VideoStats } from '@/types/youtube';
import { toast } from "sonner";

export function useHomePageData(page: number, channelsPerPage: number) {
  // Fetch regular channels with pagination
  const channelsQuery = useQuery({
    queryKey: ['channels', 'homepage', page, channelsPerPage],
    queryFn: async () => {
      try {
        // Calculate offset based on current page
        const offset = (page - 1) * channelsPerPage;
        
        // Fetch channels with pagination
        const { data: channelsData, error: channelsError, count } = await supabase
          .from('youtube_channels')
          .select('*, videoStats:youtube_video_stats(*)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + channelsPerPage - 1);
          
        if (channelsError) throw channelsError;
        
        return { 
          channels: channelsData as Channel[] || [],
          totalCount: count || 0
        };
      } catch (err: any) {
        console.error('Error fetching channels:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch featured channels (separate query for better caching)
  const featuredQuery = useQuery({
    queryKey: ['channels', 'featured'],
    queryFn: async () => {
      try {
        const { data: featuredData, error: featuredError } = await supabase
          .from('youtube_channels')
          .select('*, videoStats:youtube_video_stats(*)')
          .eq('is_featured', true)
          .limit(3);
          
        if (featuredError) throw featuredError;
        
        return featuredData as Channel[] || [];
      } catch (err: any) {
        console.error('Error fetching featured channels:', err);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for featured content
  });
  
  // Extract all videos for the FeaturedVideos component
  const allVideos = useMemo(() => {
    const channels = [
      ...(channelsQuery.data?.channels || []), 
      ...(featuredQuery.data || [])
    ];
    
    return channels
      .flatMap(channel => channel.videoStats || [])
      .filter((video): video is VideoStats => !!video)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
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
