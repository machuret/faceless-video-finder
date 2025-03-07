
/**
 * Formats and normalizes a YouTube channel URL
 */
export const formatChannelUrl = (channelUrl: string): string => {
  let formattedUrl = channelUrl.trim();
  
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
