
import { Channel, ChannelMetadata } from "@/types/youtube";
import { Json } from "@/integrations/supabase/types";

/**
 * Safely converts a JSON value from Supabase to the expected ChannelMetadata type
 */
export const convertToChannelMetadata = (metadata: Json | null): ChannelMetadata => {
  if (!metadata) return {};
  
  // If it's already an object, ensure it's treated as ChannelMetadata
  if (typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)) {
    return metadata as unknown as ChannelMetadata;
  }
  
  // Handle string case (could be JSON string)
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return parsed as ChannelMetadata;
    } catch (e) {
      console.error("Failed to parse metadata string:", e);
      return {};
    }
  }
  
  // Default case: return empty object for any unexpected format
  console.warn("Unexpected metadata format:", metadata);
  return {};
};

/**
 * Transforms channel data from Supabase to ensure metadata is properly typed
 * while preserving all other Channel properties
 */
export const transformChannelData = <T extends { metadata?: Json | null }>(channels: T[]): Channel[] => {
  return channels.map(channel => {
    // First ensure all required Channel properties are present
    const hasRequiredProps = 'id' in channel && 
                           'video_id' in channel && 
                           'channel_title' in channel && 
                           'channel_url' in channel;
    
    if (!hasRequiredProps) {
      console.error("Missing required Channel properties:", channel);
      // Add default values for required properties if missing
      const defaultChannel = {
        id: (channel as any).id || '',
        video_id: (channel as any).video_id || '',
        channel_title: (channel as any).channel_title || 'Unnamed Channel',
        channel_url: (channel as any).channel_url || '',
        ...channel
      };
      
      return {
        ...defaultChannel as any,
        metadata: convertToChannelMetadata(channel.metadata)
      } as Channel;
    }
    
    // Convert to Channel type with properly typed metadata
    return {
      ...channel as any, // Use any here to satisfy TypeScript when spreading unknown properties
      metadata: convertToChannelMetadata(channel.metadata)
    } as Channel; // Assert the final result is a Channel
  });
};
