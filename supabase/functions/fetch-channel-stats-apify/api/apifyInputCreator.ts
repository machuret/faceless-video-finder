
/**
 * Creates the input configuration for Apify YouTube Channel Scraper
 */
export function createApifyInput(url: string) {
  console.log(`Creating Apify input for URL: ${url}`);
  
  // Create a more robust input that will work with the scraper
  return {
    startUrls: [{ url }],
    maxResults: 1, // We only need basic channel info, not all videos
    maxResultsShorts: 0,
    maxResultStreams: 0,
    includeComments: false,
    includeShortsComments: false,
    includeChannelInfo: true,  // Make sure we're requesting channel info
    includeAbout: true,  // Explicitly request about page data
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"]  // Use residential proxies to avoid blocks
    }
  };
}
