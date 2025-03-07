
import { ApifyChannelData } from "../types.ts";

/**
 * Processes the channel data from Apify Fast YouTube Channel Scraper
 */
export function processChannelData(items: any[]): ApifyChannelData {
  console.log(`Processing ${items.length} items from Apify dataset`);
  
  // The Fast YouTube Channel Scraper returns data in a specific format
  // We need to extract the channel information which is present
  if (!items || items.length === 0) {
    throw new Error('Invalid data format returned from Apify - no items found');
  }
  
  // Log the first item to debug what's in the response
  console.log("First item from Apify dataset:", JSON.stringify(items[0], null, 2));
  
  // Try to extract channel information from the first item
  const firstItem = items[0];
  
  // Determine if we have the channel information in the about page data
  // Try multiple possible locations for the channel data
  const aboutPage = firstItem.aboutPage || {};
  const snippet = firstItem.snippet || {};
  
  // Try to find description from various possible locations in the response
  const description = aboutPage.channelDescription || 
                      aboutPage.description || 
                      snippet.description || 
                      firstItem.channelDescription || 
                      firstItem.description || 
                      "";
                      
  // Try to find country/location from various possible locations
  const location = aboutPage.channelLocation || 
                   aboutPage.country || 
                   snippet.country || 
                   firstItem.channelLocation || 
                   firstItem.country || 
                   "";
  
  // Log extracted fields for debugging
  console.log("Extracted channel data fields:", {
    name: firstItem.channelName || firstItem.name || snippet.title,
    description: description,
    subscribers: firstItem.numberOfSubscribers || firstItem.subscriberCount,
    views: firstItem.channelTotalViews || firstItem.viewCount,
    videoCount: firstItem.channelTotalVideos || firstItem.videoCount,
    joinDate: firstItem.channelJoinedDate || firstItem.joinedDate,
    location: location
  });
  
  // The format is different from the old scraper, so we need to map fields
  // with fallbacks for different possible formats
  const channelData: ApifyChannelData = {
    channelName: firstItem.channelName || firstItem.name || snippet.title || "",
    channelDescription: description,
    numberOfSubscribers: firstItem.numberOfSubscribers || firstItem.subscriberCount || "0",
    channelTotalViews: firstItem.channelTotalViews || firstItem.viewCount || "0",
    channelTotalVideos: firstItem.channelTotalVideos || firstItem.videoCount || "0",
    channelJoinedDate: firstItem.channelJoinedDate || firstItem.joinedDate || "",
    channelLocation: location,
    channelUrl: firstItem.channelUrl || firstItem.url || "",
    channelId: extractChannelId(firstItem.channelUrl || firstItem.url || "")
  };
  
  // Verify essential fields and provide detailed diagnostic info
  console.log("Channel data verification from Apify:");
  console.log(`- Channel Name: ${channelData.channelName || 'MISSING'}`);
  console.log(`- Subscribers: ${channelData.numberOfSubscribers || 'MISSING'}`);
  console.log(`- Total Views: ${channelData.channelTotalViews || 'MISSING'}`);
  console.log(`- Total Videos: ${channelData.channelTotalVideos || 'MISSING'}`);
  console.log(`- Join Date: ${channelData.channelJoinedDate || 'MISSING'}`);
  console.log(`- Description: ${channelData.channelDescription ? 'PRESENT' : 'MISSING'}`);
  console.log(`- Location: ${channelData.channelLocation || 'MISSING'}`);
  console.log(`- Channel URL: ${channelData.channelUrl || 'MISSING'}`);
  
  return channelData;
}

/**
 * Helper function to extract channel ID from YouTube channel URL
 */
export function extractChannelId(url: string): string {
  if (!url) return "";
  
  try {
    // Handle different URL formats
    if (url.includes('/channel/')) {
      const matches = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      return matches?.[1] || "";
    } else if (url.includes('/c/') || url.includes('/@')) {
      // For custom URLs, just return the handle part or full URL as ID
      return url;
    }
    return "";
  } catch (e) {
    console.error("Error extracting channel ID:", e);
    return "";
  }
}
