
/**
 * Extracts a UUID from a slug string
 * @param slug The slug to extract UUID from
 * @returns The extracted UUID or null if not found
 */
export const extractIdFromSlug = (slug: string): string | null => {
  // UUID pattern: 8-4-4-4-12 hex digits with hyphens
  // Example: ac004f01-4aad-439d-b1ab-59988473f7fc
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = slug.match(uuidPattern);
  
  if (match && match[0]) {
    console.log("Extracted UUID from slug:", match[0]);
    return match[0];
  }
  
  return null;
};

/**
 * Extracts YouTube channel ID from channel URL
 * @param url The YouTube channel URL
 * @returns The YouTube channel ID or null if not found
 */
export const extractYouTubeChannelId = (url: string): string | null => {
  if (!url) return null;
  
  // Pattern for channel URLs like: https://www.youtube.com/channel/UC...
  const channelPattern = /youtube\.com\/channel\/(UC[\w-]{21}[AQgw])/i;
  const channelMatch = url.match(channelPattern);
  
  if (channelMatch && channelMatch[1]) {
    console.log("Extracted YouTube channel ID from URL:", channelMatch[1]);
    return channelMatch[1];
  }
  
  // Pattern for user URLs like: https://www.youtube.com/user/username
  // or handle URLs like: https://www.youtube.com/@username
  // These require an additional API call to get the channel ID, which we'll skip for now
  
  return null;
};
