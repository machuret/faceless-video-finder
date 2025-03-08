/**
 * Formats and normalizes a YouTube channel URL
 */
export const formatChannelUrl = (channelUrl: string): string => {
  let formattedUrl = channelUrl.trim();
  
  // Handle case sensitivity issue - YouTube channel IDs are case-sensitive
  // The URL entered is lowercase, but YouTube channel IDs should preserve case
  if (formattedUrl.includes('youtube.com/channel/')) {
    const parts = formattedUrl.split('youtube.com/channel/');
    if (parts.length > 1) {
      // Keep the original case for the channel ID portion
      formattedUrl = `${parts[0]}youtube.com/channel/${parts[1]}`;
    }
  }
  
  // Handle YouTube handles without full URL
  if (formattedUrl.startsWith('@') && !formattedUrl.includes('youtube.com')) {
    formattedUrl = `https://www.youtube.com/${formattedUrl}`;
  }
  
  // Fix URLs without protocol
  if (!formattedUrl.includes('http') && 
      !formattedUrl.startsWith('@') && 
      !formattedUrl.match(/^UC[\w-]{21,24}$/)) {
    if (formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be')) {
      formattedUrl = `https://${formattedUrl}`;
    }
  }
  
  return formattedUrl;
};
