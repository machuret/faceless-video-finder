
/**
 * Creates mock channel data for testing purposes
 */
export function createMockChannelData(url: string) {
  const timestamp = new Date().toISOString();
  console.log(`⚠️ [${timestamp}] Creating mock data for URL: ${url}`);
  
  return {
    title: "Test Channel",
    description: "This is a test channel description from error fallback",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    subscriberCount: 1000,
    viewCount: 50000,
    videoCount: 100,
    publishedAt: "2021-01-01T00:00:00Z",
    country: "US",
    channelId: "UC123456789",
    url: url,
    channelType: "creator",
    keywords: ["test", "channel"]
  };
}
