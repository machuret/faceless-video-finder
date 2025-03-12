
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
        
        // First try getting the count to know how many channels exist
        const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            countOnly: true
          }
        });
        
        if (countError) {
          console.error("Error getting count from edge function:", countError);
          throw new Error(countError.message || "Failed to get channel count");
        }
        
        const totalCount = countData?.totalCount || 0;
        console.log("Total channel count from edge function:", totalCount);
        
        if (totalCount === 0) {
          return { 
            channels: [],
            totalCount: 0
          };
        }
        
        // Now fetch the actual channels for this page
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
          body: { 
            limit: channelsPerPage,
            offset: offset
          }
        });
        
        if (edgeError) {
          console.error("Edge function error:", edgeError);
          throw new Error(edgeError.message || "Failed to fetch channels");
        }
        
        if (!edgeData?.channels || !Array.isArray(edgeData.channels)) {
          console.error("Edge function returned invalid data:", edgeData);
          throw new Error("Invalid data received from server");
        }
        
        console.log(`Successfully fetched ${edgeData.channels.length} channels using edge function`);
        
        return { 
          channels: edgeData.channels as Channel[],
          totalCount: edgeData.totalCount || totalCount
        };
      } catch (err: any) {
        console.error('Error fetching homepage channels:', err);
        throw new Error(err.message || 'Failed to load channels. Please try again later.');
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
    retryDelay: 1000
  });
}
