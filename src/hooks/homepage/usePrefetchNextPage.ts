
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';

/**
 * Hook to prefetch the next page of channels
 */
export function usePrefetchNextPage(page: number, channelsPerPage: number) {
  const queryClient = useQueryClient();
  
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
              
              // Use the properly fixed edge function
              const { data, error } = await supabase.functions.invoke('get-public-channels', {
                body: { 
                  limit: channelsPerPage,
                  offset: offset
                }
              });
              
              if (error) {
                console.error("Error prefetching next page channels:", error);
                return { channels: [], totalCount: 0 };
              }
              
              console.log(`Successfully prefetched ${data?.channels?.length || 0} channels for next page`);
              
              return { 
                channels: data?.channels as Channel[] || [], 
                totalCount: data?.totalCount || 0 
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
}
