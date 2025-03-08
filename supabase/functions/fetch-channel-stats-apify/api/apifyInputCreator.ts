
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
  
  // Create a more robust input that will work with the scraper
  return {
    startUrls: [{ url: finalUrl }],
    maxResults: 1, // We only need one video to get channel info
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"]  // Use residential proxies for better results
    },
    includeChannelInfo: true,  // Make sure we're requesting channel info
    includeAbout: true,  // Explicitly request about page data
    debugLog: true,     // Enable debug logging in Apify
    maxConcurrency: 1,  // Limit concurrency to prevent rate limiting
    maxRequestRetries: 3, // Add retries for resilience
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
        
        // Additional logging to help debug
        const content = await page.content();
        console.log('Page content length:', content.length);
        
        // Check for subscriber count
        const subscriberText = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          for (const el of elements) {
            const text = el.textContent || '';
            if (text.includes('subscriber') || text.includes('subscribers')) {
              return text;
            }
          }
          return null;
        });
        console.log('Found subscriber text:', subscriberText);
      } catch (e) {
        console.log('Error in extend function:', e);
      }
      
      return data;
    }`
  };
}
