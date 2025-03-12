
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';

/**
 * Hook to fetch the main channels for the homepage
 */
export function useHomePageChannels(page: number, channelsPerPage: number) {
  return useQuery({
    queryKey: ['channels', 'homepage', page, channelsPerPage],
    queryFn: async () => {
      try {
        const offset = (page - 1) * channelsPerPage;
        
        console.log(`Fetching channels for homepage, page ${page}, offset ${offset}, limit ${channelsPerPage}`);
        
        // Use edge function first for reliability with RLS issues
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            limit: channelsPerPage,
            offset: offset
          }
        });
        
        if (edgeError) {
          console.error("Edge function error:", edgeError);
          // Fall through to try direct query
        } else if (edgeData?.channels && Array.isArray(edgeData.channels)) {
          console.log(`Successfully fetched ${edgeData.channels.length} channels using edge function`);
          return { 
            channels: edgeData.channels as Channel[],
            totalCount: edgeData.totalCount || 0
          };
        }
        
        // Fall back to direct query if edge function failed
        const { data, error, count } = await supabase
          .from("youtube_channels")
          .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + channelsPerPage - 1);
          
        if (error) {
          console.error("Error fetching channels via direct query:", error);
          throw new Error(error.message || "Failed to load channels. Please try again later.");
        }
        
        if (!data || data.length === 0) {
          console.log("No channels found");
        } else {
          console.log(`Successfully fetched ${data.length} channels via direct query`);
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
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: 1000
  });
}
