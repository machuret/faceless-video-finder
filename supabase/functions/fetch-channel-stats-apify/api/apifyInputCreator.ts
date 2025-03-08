
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
      apifyProxyGroups: ["RESIDENTIAL", "DATACENTER"],  // Use both residential and datacenter proxies
      useChrome: true // Use Chrome browser for better data extraction
    },
    maxConcurrency: 1,  // Limit concurrency to prevent rate limiting
    debugLog: true,     // Enable debug logging in Apify
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
      
      // Extract subscriber count directly from the page
      try {
        const subscriberElement = await page.$('[id="subscriber-count"]');
        if (subscriberElement) {
          const subscriberText = await page.evaluate(el => el.textContent, subscriberElement);
          if (subscriberText) {
            data.subscriberCountText = subscriberText.trim();
          }
        }
      } catch (e) {
        console.log('Error extracting subscriber count:', e);
      }
      
      return data;
    }`
  };
}
