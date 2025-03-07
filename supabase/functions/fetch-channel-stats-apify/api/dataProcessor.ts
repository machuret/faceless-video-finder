
import { ApifyChannelData } from "../types.ts";

/**
 * Processes the channel data from Apify Fast YouTube Channel Scraper
 */
export function processChannelData(items: any[]): ApifyChannelData {
  // The Fast YouTube Channel Scraper returns an array of videos
  // We need to extract the channel information which is present in each video item
  const firstItem = items[0]; // Get the first item which contains channel data
  
  if (!firstItem) {
    throw new Error('Invalid data format returned from Apify - no items found');
  }
  
  console.log("Processing channel data from first item:", 
    JSON.stringify({
      channelName: firstItem.channelName,
      numberOfSubscribers: firstItem.numberOfSubscribers,
      channelTotalViews: firstItem.channelTotalViews,
      channelLocation: firstItem.channelLocation,
      channelJoinedDate: firstItem.channelJoinedDate
    }, null, 2)
  );
  
  // The format is different from the old scraper, so we need to map fields
  const channelData: ApifyChannelData = {
    channelName: firstItem.channelName,
    channelDescription: firstItem.channelDescription,
    numberOfSubscribers: firstItem.numberOfSubscribers || "0",
    channelTotalViews: firstItem.channelTotalViews || "0",
    channelTotalVideos: firstItem.channelTotalVideos || "0",
    channelJoinedDate: firstItem.channelJoinedDate,
    channelLocation: firstItem.channelLocation,
    channelUrl: firstItem.channelUrl,
    channelId: extractChannelId(firstItem.channelUrl)
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
