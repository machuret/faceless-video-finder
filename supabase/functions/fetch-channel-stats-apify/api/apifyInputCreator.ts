
/**
 * Creates the input configuration for Apify YouTube Channel Scraper
 */
export function createApifyInput(url: string) {
  return {
    startUrls: [{ url }],
    maxResults: 1, // We only need basic channel info, not all videos
    maxResultsShorts: 0,
    maxResultStreams: 0
  };
}
