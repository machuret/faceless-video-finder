
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
 */
export const transformChannelData = <T extends { metadata?: Json | null }>(channels: T[]): (Omit<T, 'metadata'> & { metadata: ChannelMetadata })[] => {
  return channels.map(channel => ({
    ...channel,
    metadata: convertToChannelMetadata(channel.metadata)
  })) as (Omit<T, 'metadata'> & { metadata: ChannelMetadata })[];
};
