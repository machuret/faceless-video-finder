
/**
 * Creates the input configuration for Apify YouTube Channel Scraper
 */
export function createApifyInput(url: string) {
  console.log(`Creating Apify input for URL: ${url}`);
  
  // Create a more robust input that will work with the scraper
  return {
    startUrls: [{ url }],
    maxResults: 1, // We only need one video to get channel info
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"]  // Use residential proxies for better results
    },
    includeChannelInfo: true,  // Make sure we're requesting channel info
    includeAbout: true,  // Explicitly request about page data
    debugLog: true,     // Enable debug logging in Apify
    maxConcurrency: 1,  // Limit concurrency to prevent rate limiting
    // Force full page load to get all channel info
    extendOutputFunction: `async ({ page, data, customData, request }) => {
      // Wait longer for content to fully load
      await page.waitForTimeout(3000);
      
      // Click on "About" tab if it exists to ensure we get channel info
      try {
        const aboutTab = await page.$('a[href*="about"]');
        if (aboutTab) {
          await aboutTab.click();
          await page.waitForTimeout(2000); // Wait for about page to load
        }
      } catch (e) {
        console.log('Error clicking about tab:', e);
      }
      
      return data;
    }`
  };
}
