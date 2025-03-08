
/**
 * Formats a YouTube channel URL for API requests
 */
export const formatChannelUrl = (url: string): string => {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  
  // Check if already a well-formed URL
  if (trimmedUrl.startsWith('http')) {
    return trimmedUrl;
  }
  
  // Check if it's a channel ID (starts with UC)
  if (/^UC[\w-]{21,24}$/.test(trimmedUrl)) {
    return `https://www.youtube.com/channel/${trimmedUrl}`;
  }
  
  // Check if it's a username with @ symbol
  if (trimmedUrl.startsWith('@')) {
    return `https://www.youtube.com/${trimmedUrl}`;
  }
  
  // Check if it's just a username without @ symbol
  if (/^[a-zA-Z0-9_-]+$/.test(trimmedUrl)) {
    return `https://www.youtube.com/@${trimmedUrl}`;
  }
  
  // Return as is if we can't determine the format
  return trimmedUrl;
};

/**
 * Extracts channel ID from different URL formats
 */
export const extractChannelId = (url: string): string | null => {
  if (!url) return null;
  
  // Extract from channel URL
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{21,24})/i);
  if (channelMatch) {
    return channelMatch[1];
  }
  
  // Extract from custom URL
  const customMatch = url.match(/youtube\.com\/@([\w-]+)/i);
  if (customMatch) {
    return `@${customMatch[1]}`;
  }
  
  return null;
};
