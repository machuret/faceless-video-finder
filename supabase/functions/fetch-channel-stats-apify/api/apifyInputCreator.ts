
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
    maxRequestRetries: 3,
    // Force full page load to get all channel info
    extendOutputFunction: `async ({ page, data, customData, request }) => {
      console.log('In extendOutputFunction, making sure we get all data');
      
      // Wait longer for content to fully load
      await page.waitForTimeout(5000);
      
      // Click on "About" tab if it exists to ensure we get channel info
      try {
        const aboutTab = await page.$('a[href*="about"]');
        if (aboutTab) {
          console.log('Found about tab, clicking it');
          await aboutTab.click();
          await page.waitForTimeout(3000); // Wait for about page to load
        } else {
          console.log('About tab not found, may already be on the about page');
        }
        
        // Extract subscriber count from multiple possible elements
        const subscriberText = await page.evaluate(() => {
          // Look for subscriber count in various elements
          const elements = Array.from(document.querySelectorAll('*'));
          for (const el of elements) {
            const text = el.textContent || '';
            if (text.includes('subscriber') || text.includes('subscribers')) {
              return text;
            }
          }
          return null;
        });
        
        if (subscriberText) {
          console.log('Found subscriber text:', subscriberText);
        } else {
          console.log('Could not find subscriber count text on page');
        }
      } catch (e) {
        console.log('Error in extend function:', e);
      }
      
      return data;
    }`
  };
}
