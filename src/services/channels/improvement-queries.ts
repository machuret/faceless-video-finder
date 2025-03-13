
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";
import { transformChannelData } from "@/pages/Admin/components/dashboard/utils/channelMetadataUtils";
import { retryWithBackoff } from "@/services/facelessIdeas/pagination/retryUtils";

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const channelCache = new Map<string, { data: Channel[], timestamp: number }>();

/**
 * Clear the channels cache
 */
export const clearChannelsCache = () => {
  channelCache.clear();
};

/**
 * Generic function to fetch channels with specific improvements needed
 */
export const fetchChannelsToImprove = async (
  options: {
    missingScreenshot?: boolean;
    missingType?: boolean;
    missingStats?: boolean;
    missingKeywords?: boolean;
    hasStats?: boolean;
    limit?: number;
  }
): Promise<{ channels: Channel[]; error: string | null }> => {
  const cacheKey = JSON.stringify(options);
  const cachedResult = channelCache.get(cacheKey);
  
  // Return cached result if it's still valid
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
    console.log(`Using cached channels data for: ${cacheKey}`);
    return { channels: cachedResult.data, error: null };
  }

  const startTime = performance.now();
  console.log(`Fetching channels to improve with options:`, options);
  
  // Try edge function first for better performance
  try {
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            ...options,
            limit: options.limit || 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          const typedChannels: Channel[] = transformChannelData(data.channels);
          
          // Cache the result
          channelCache.set(cacheKey, {
            data: typedChannels,
            timestamp: Date.now()
          });
          
          console.log(`Fetched ${typedChannels.length} channels from edge function in ${(performance.now() - startTime).toFixed(2)}ms`);
          return { channels: typedChannels, error: null };
        }
        
        throw new Error('Invalid response format from edge function');
      },
      {
        maxRetries: 1,
        initialDelay: 500,
        maxDelay: 2000,
        factor: 2,
        errorFilter: (err) => {
          // Only retry on network-related errors
          return err instanceof Error && 
            (err.message.includes('network') || 
             err.message.includes('timeout') || 
             err.message.includes('failed'));
        }
      }
    );
    
    return result;
  } catch (edgeFunctionError) {
    console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
  }
  
  // Fallback to direct query
  try {
    let query = supabase.from('youtube_channels').select('*');
    
    // Apply appropriate filters based on options
    if (options.missingScreenshot) {
      query = query.is('screenshot_url', null);
    }
    
    if (options.missingType) {
      query = query.or('channel_type.is.null,channel_type.eq.other');
    }
    
    if (options.missingStats) {
      query = query.or('total_subscribers.is.null,total_views.is.null,video_count.is.null');
    }
    
    if (options.missingKeywords) {
      query = query.or('keywords.is.null,keywords.eq.{}');
    }
    
    if (options.hasStats) {
      query = query.not('video_count', 'is', null);
    }
    
    // Add order and limit
    query = query.order('created_at', { ascending: false })
      .limit(options.limit || 20);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const typedChannels: Channel[] = transformChannelData(data || []);
    
    // Cache the result
    channelCache.set(cacheKey, {
      data: typedChannels,
      timestamp: Date.now()
    });
    
    console.log(`Fetched ${typedChannels.length} channels from direct query in ${(performance.now() - startTime).toFixed(2)}ms`);
    return { channels: typedChannels, error: null };
  } catch (error) {
    console.error("Error fetching channels to improve:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { channels: [], error: `Failed to fetch channels. ${errorMessage}` };
  }
};

/**
 * Extract YouTube channel ID from various URL formats
 */
export const extractYoutubeChannelId = (url: string): string | null => {
  if (!url) return null;
  
  // Try to extract channel ID from URL patterns
  const patterns = [
    /youtube\.com\/channel\/(UC[\w-]{22})/i,         // youtube.com/channel/UC...
    /youtube\.com\/c\/(UC[\w-]{22})/i,               // youtube.com/c/UC...
    /youtube\.com\/@[\w-]+\/(UC[\w-]{22})/i,         // youtube.com/@username/UC...
    /youtube\.com\/(UC[\w-]{22})/i,                  // youtube.com/UC...
    /(UC[\w-]{22})/i                                 // Any UC... pattern
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      // Ensure proper capitalization (UC at the start)
      return id.startsWith('uc') ? 'UC' + id.substring(2) : id;
    }
  }
  
  return null;
};
