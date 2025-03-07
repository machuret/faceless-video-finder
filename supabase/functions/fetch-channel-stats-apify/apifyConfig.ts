
/**
 * Creates the input configuration for Apify YouTube Scraper actor
 */
export function createApifyInput(url: string) {
  return {
    "startUrls": [
      { "url": url },
      { "url": `${url}/about` } // Also scrape the About page to get more data
    ],
    "maxVideos": 1,
    "proxy": {
      "useApifyProxy": true,
      "apifyProxyGroups": ["RESIDENTIAL"]
    },
    "maxResults": 1,
    "scrapeChannelInfo": true,
    "includeChannelAboutInfo": true,
    "extendOutputFunction": `async ({ data, customData, Apify }) => {
      // Ensure full channel details are captured, especially the About tab
      if (data && data.type === 'channel') {
        // Log that we're in the extendOutputFunction for debugging
        console.log('Processing channel data in extendOutputFunction');
        
        // Make sure we capture the About section for channel description
        if (!data.channelDescription || data.channelDescription.trim() === '') {
          console.log('Channel description missing, attempting to fetch from About page');
          const aboutPageUrl = data.url + '/about';
          try {
            const request = await Apify.utils.requestAsBrowser({ 
              url: aboutPageUrl,
              proxyUrl: Apify.getApifyProxyUrl({ groups: ['RESIDENTIAL'] }),
              timeoutSecs: 60
            });
            const html = request.body;
            
            // Extract description from About page using appropriate selectors
            const descriptionMatch = html.match(/<meta\\s+property="og:description"\\s+content="([^"]+)"/);
            if (descriptionMatch && descriptionMatch[1]) {
              data.channelDescription = descriptionMatch[1];
              console.log('Successfully extracted description from About page');
            }
            
            // Extract join date
            const joinDateMatch = html.match(/(?:Channel created on|Joined) (.+?)<\\/span>/);
            if (joinDateMatch && joinDateMatch[1]) {
              data.channelJoinedDate = joinDateMatch[1];
              console.log('Successfully extracted join date: ' + joinDateMatch[1]);
            }
            
            // Extract country
            const countryMatch = html.match(/(?:Location|Country):<\\/span>.*?>([^<]+)</);
            if (countryMatch && countryMatch[1]) {
              data.channelLocation = countryMatch[1].trim();
              console.log('Successfully extracted country: ' + countryMatch[1].trim());
            }
            
            // Extract more metadata directly from the DOM
            // Try to get total views
            const viewsMatch = html.match(/([\\d,]+)\\s+views<\\/div>/);
            if (viewsMatch && viewsMatch[1]) {
              data.channelTotalViews = viewsMatch[1].replace(/,/g, '');
              console.log('Successfully extracted total views: ' + data.channelTotalViews);
            }
            
            // Try to get video count
            const videosMatch = html.match(/([\\d,]+)\\s+videos<\\/div>/);
            if (videosMatch && videosMatch[1]) {
              data.channelTotalVideos = videosMatch[1].replace(/,/g, '');
              console.log('Successfully extracted video count: ' + data.channelTotalVideos);
            }
          } catch (e) {
            console.log('Error fetching about page:', e);
          }
        }
      }
      return data;
    }`
  };
}
