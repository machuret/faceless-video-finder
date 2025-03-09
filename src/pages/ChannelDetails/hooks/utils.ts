
/**
 * Extract ID from a channel slug in the format "title-UC12345"
 */
export const extractIdFromSlug = (slug: string) => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  if (parts.length === 0) return null;
  
  // The ID is the last part
  const id = parts[parts.length - 1];
  return id;
};

/**
 * Extract YouTube channel ID from a channel URL
 * - Handles multiple URL formats (youtube.com/channel/UC..., youtube.com/c/name, youtube.com/@handle)
 */
export const extractYouTubeChannelId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // For standard channel URLs (youtube.com/channel/UC...)
    if (url.includes('/channel/')) {
      const matches = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      return matches?.[1] || null;
    }
    
    // For custom URLs (youtube.com/c/name or youtube.com/@handle)
    // We'll just return the entire URL as we can't reliably extract the ID
    // The edge function will handle the conversion
    if (url.includes('/c/') || url.includes('/@')) {
      console.log("Returning entire URL for custom handle:", url);
      return url;
    }
    
    // For direct IDs that might be stored in the database
    if (url.startsWith('UC') && url.length >= 24) {
      return url;
    }
    
    console.warn("Could not extract YouTube channel ID from URL:", url);
    return null;
  } catch (e) {
    console.error("Error extracting YouTube channel ID:", e);
    return null;
  }
};
