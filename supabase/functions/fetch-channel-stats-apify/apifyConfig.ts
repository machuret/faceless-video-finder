
/**
 * Creates the input configuration for Apify Fast YouTube Channel Scraper actor
 * Note: This is now only kept for backwards compatibility
 * The actual configuration is now in apifyApiClient.ts
 */
export function createApifyInput(url: string) {
  return {
    startUrls: [{ url }],
    maxResults: 1, // We only need channel info, not all videos
    maxResultsShorts: 0,
    maxResultStreams: 0
  };
}
