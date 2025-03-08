
import { ApifyChannelData } from "../types.ts";
import { extractChannelId } from "./channelIdExtractor.ts";
import { 
  extractDescription, 
  extractLocation, 
  extractSubscriberCount, 
  extractVideoCount, 
  extractViewCount, 
  extractJoinedDate 
} from "./fieldExtractors.ts";

/**
 * Processes the channel data from Apify YouTube Channel Scraper
 */
export function processChannelData(items: any[]): ApifyChannelData {
  console.log(`Processing ${items.length} items from Apify dataset`);
  
  // YouTube Channel Scraper returns an array of videos, with channel info in each item
  if (!items || items.length === 0) {
    throw new Error('Invalid data format returned from Apify - no items found');
  }
  
  // Log the first item structure to help with debugging
  console.log("First item structure:", Object.keys(items[0]));
  
  // Extract channel information from the first item
  const firstItem = items[0];
  
  // Channel info could be in different locations based on the scraper version
  const channelInfo = firstItem.channelInfo || firstItem.channel || {};
  const statistics = channelInfo.statistics || firstItem.statistics || {};
  const snippet = channelInfo.snippet || firstItem.snippet || {};
  
  // Extract channel details from "about" page if available
  const aboutPage = firstItem.aboutPage || firstItem.about || {};
  
  // Extract all the important fields
  const description = extractDescription(firstItem, aboutPage, snippet, channelInfo);
  const location = extractLocation(firstItem, aboutPage, snippet, channelInfo);
  const subscriberCount = extractSubscriberCount(firstItem, statistics, channelInfo, aboutPage);
  const videoCount = extractVideoCount(firstItem, statistics, channelInfo, aboutPage);
  const viewCount = extractViewCount(firstItem, statistics, channelInfo, aboutPage);
  const joinedDate = extractJoinedDate(firstItem, channelInfo, snippet, aboutPage);
  
  // Determine the channel URL and name from various sources
  const channelUrl = firstItem.channelUrl || channelInfo.url || firstItem.url || "";
  const channelName = firstItem.channelName || channelInfo.title || snippet.title || firstItem.title || "";
  
  // Format to our expected data structure
  const channelData: ApifyChannelData = {
    channelName: channelName,
    channelDescription: description,
    numberOfSubscribers: subscriberCount !== null ? String(subscriberCount) : "",
    channelTotalViews: viewCount,
    channelTotalVideos: videoCount,
    channelJoinedDate: joinedDate,
    channelLocation: location,
    channelUrl: channelUrl,
    channelId: extractChannelId(channelUrl)
  };
  
  // Verify what data we were able to extract
  console.log("Extracted channel data:", {
    name: channelData.channelName,
    subscribers: channelData.numberOfSubscribers,
    videos: channelData.channelTotalVideos,
    views: channelData.channelTotalViews,
    joined: channelData.channelJoinedDate,
    description: channelData.channelDescription ? "FOUND" : "MISSING",
    location: channelData.channelLocation || "MISSING"
  });
  
  return channelData;
}
