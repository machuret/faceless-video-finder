
import { useQuery } from '@tanstack/react-query';
import { Channel } from '@/types/youtube';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useQueryChannels(options: {
  page: number;
  limit: number;
  featured?: boolean;
}) {
  const { page, limit, featured } = options;
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['channels', { page, limit, featured }],
    queryFn: async () => {
      try {
        // Calculate offset based on current page
        console.log(`Fetching channels: page ${page}, limit ${limit}, offset ${offset}`);
        
        // Base query
        let query = supabase
          .from('youtube_channels')
          .select('*, videoStats:youtube_video_stats(*)', { count: 'exact' });
          
        // Apply featured filter if needed
        if (featured === true) {
          query = query.eq('is_featured', true);
        }
          
        // Apply pagination
        query = query.range(offset, offset + limit - 1)
          .order('created_at', { ascending: false });
          
        const { data, error, count } = await query;
          
        if (error) throw error;
        
        return { 
          channels: data as Channel[] || [], 
          totalCount: count || 0 
        };
      } catch (err: any) {
        console.error('Error fetching channels:', err);
        toast.error('Failed to load channels');
        throw err;
      }
    },
    placeholderData: (previousData) => previousData,
  });
}
