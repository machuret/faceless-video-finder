
/**
 * Creates the input configuration for Apify YouTube Channel Scraper
 */
export function createApifyInput(url: string) {
  console.log(`Creating Apify input for URL: ${url}`);
  
  // Ensure URL is correctly formatted for the scraper
  // Explicitly append /about to get channel statistics
  let finalUrl = url;
  if (!finalUrl.includes('/about')) {
    // Remove trailing slash if present before adding /about
    finalUrl = finalUrl.replace(/\/$/, '') + '/about';
  }
  
  console.log(`Using final URL for Apify: ${finalUrl}`);
  
  // Use the recommended input structure for YouTube Channel Scraper
  return {
    startUrls: [{ url: finalUrl }],
    maxResults: 1, // Only need 1 result to get channel info
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"]  // Use residential proxies for better results
    },
    includeChannelInfo: true,
    includeAbout: true,
    scrapeChannelInfo: true, // Explicitly request channel info
    debugLog: true,
    maxConcurrency: 1,  // Lower concurrency to prevent rate limiting
    maxRequestRetries: 3
    // Removed the problematic extendOutputFunction
  };
}
