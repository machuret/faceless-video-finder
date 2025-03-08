
/**
 * Utility functions for parsing and validating YouTube channel URLs
 */

/**
 * Parse a string containing multiple URLs (one per line) into an array of URLs
 */
export const parseChannelUrls = (urls: string): string[] => {
  return urls
    .split("\n")
    .map(url => url.trim())
    .filter(url => url.length > 0);
};

/**
 * Validate and limit the number of URLs to be processed
 * Returns the validated array of URLs, limited to the maximum allowed
 */
export const validateUrlsCount = (channelUrls: string[], maxUrls = 10): string[] => {
  if (channelUrls.length === 0) {
    return [];
  }
  
  if (channelUrls.length > maxUrls) {
    return channelUrls.slice(0, maxUrls);
  }
  
  return channelUrls;
};
