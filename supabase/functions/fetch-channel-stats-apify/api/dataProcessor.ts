
import { ApifyChannelData } from "../types.ts";

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
  
  // Try to find description from various possible locations
  let description = "";
  const possibleDescriptionSources = [
    aboutPage.description,
    aboutPage.channelDescription,
    snippet.description,
    channelInfo.description,
    firstItem.description,
    firstItem.channelDescription,
    // Add more potential sources
    aboutPage.detailedText,
    firstItem.detailedDescription,
    firstItem.about?.description
  ];
  
  // Use the first non-empty description we find
  for (const source of possibleDescriptionSources) {
    if (source && typeof source === 'string' && source.trim() !== "") {
      description = source;
      console.log("Found description source:", source.substring(0, 50) + "...");
      break;
    }
  }
  
  // Try to find country/location information
  let location = "";
  const possibleLocationSources = [
    aboutPage.country,
    aboutPage.location,
    aboutPage.channelLocation,
    channelInfo.country,
    firstItem.country,
    snippet.country,
    // Add more potential sources
    aboutPage.details?.country,
    aboutPage.locationDetails,
    firstItem.location
  ];
  
  for (const source of possibleLocationSources) {
    if (source && typeof source === 'string' && source.trim() !== "") {
      location = source;
      console.log("Found location source:", location);
      break;
    }
  }
  
  // Try directly accessing the subscriber count string if available
  let subscriberCount = null;
  const subscriberInfoSources = [
    // Direct properties
    firstItem.subscriberCount,
    statistics.subscriberCount,
    channelInfo.subscriberCount,
    aboutPage.subscriberCount,
    // New fallbacks
    firstItem.stats?.subscriberCount,
    firstItem.channelStats?.subscriberCount,
    aboutPage.stats?.subscriberCount
  ];
  
  for (const source of subscriberInfoSources) {
    if (source !== undefined && source !== null) {
      subscriberCount = source;
      console.log("Found subscriber count:", subscriberCount);
      break;
    }
  }
  
  // Extract video count from multiple possible sources
  const videoCountSources = [
    firstItem.amountOfVideos,
    statistics.videoCount,
    channelInfo.videoCount,
    firstItem.videoCount,
    // New fallbacks
    firstItem.stats?.videoCount,
    firstItem.channelStats?.videoCount,
    aboutPage.stats?.videoCount
  ];
  
  let videoCount = "0";
  for (const source of videoCountSources) {
    if (source !== undefined && source !== null) {
      videoCount = String(source);
      console.log("Found video count:", videoCount);
      break;
    }
  }
  
  // Extract channel total views from multiple sources
  const viewCountSources = [
    statistics.viewCount,
    firstItem.viewCount,
    channelInfo.viewCount,
    aboutPage.viewCount,
    // New fallbacks
    firstItem.stats?.viewCount,
    firstItem.totalViews,
    aboutPage.stats?.totalViews
  ];
  
  let viewCount = "0";
  for (const source of viewCountSources) {
    if (source !== undefined && source !== null) {
      viewCount = String(source);
      console.log("Found view count:", viewCount);
      break;
    }
  }
  
  // Try to find the channel joined date
  const joinedDateSources = [
    channelInfo.publishedAt,
    firstItem.publishedAt,
    snippet.publishedAt,
    firstItem.creationDate,
    aboutPage.joinedDate,
    channelInfo.joinedDate
  ];
  
  let joinedDate = "";
  for (const source of joinedDateSources) {
    if (source !== undefined && source !== null) {
      joinedDate = String(source);
      console.log("Found joined date:", joinedDate);
      break;
    }
  }
  
  // Format to our expected data structure with fallbacks for different API responses
  const channelData: ApifyChannelData = {
    channelName: firstItem.channelName || channelInfo.title || snippet.title || firstItem.title || "",
    channelDescription: description,
    numberOfSubscribers: subscriberCount !== null ? String(subscriberCount) : "",
    channelTotalViews: viewCount,
    channelTotalVideos: videoCount,
    channelJoinedDate: joinedDate,
    channelLocation: location,
    channelUrl: firstItem.channelUrl || channelInfo.url || firstItem.url || "",
    channelId: extractChannelId(firstItem.channelUrl || channelInfo.url || firstItem.url || "")
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
      // For custom URLs, just return the handle part
      return url;
    }
    return "";
  } catch (e) {
    console.error("Error extracting channel ID:", e);
    return "";
  }
}
