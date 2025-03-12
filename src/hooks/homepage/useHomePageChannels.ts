
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
        
        // Use direct query first as attempt
        const { data, error, count } = await supabase
          .from("youtube_channels")
          .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + channelsPerPage - 1);
          
        if (error) {
          console.error("Error fetching channels:", error);
          
          // Use our fixed edge function
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
            body: { 
              limit: channelsPerPage,
              offset: offset
            }
          });
          
          if (edgeError) {
            throw new Error(`Edge function error: ${edgeError.message}`);
          }
          
          if (edgeData?.channels && Array.isArray(edgeData.channels)) {
            console.log(`Successfully fetched ${edgeData.channels.length} channels using edge function`);
            return { 
              channels: edgeData.channels as Channel[],
              totalCount: edgeData.totalCount || 0
            };
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
}
