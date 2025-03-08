
/**
 * Utility functions to extract different fields from various possible sources
 */

/**
 * Attempts to extract a description from multiple potential sources
 */
export function extractDescription(item: any, aboutPage: any, snippet: any, channelInfo: any): string {
  const possibleDescriptionSources = [
    aboutPage.description,
    aboutPage.channelDescription,
    snippet.description,
    channelInfo.description,
    item.description,
    item.channelDescription,
    aboutPage.detailedText,
    item.detailedDescription,
    item.about?.description
  ];
  
  // Use the first non-empty description we find
  for (const source of possibleDescriptionSources) {
    if (source && typeof source === 'string' && source.trim() !== "") {
      console.log("Found description source:", source.substring(0, 50) + "...");
      return source;
    }
  }
  
  return "";
}

/**
 * Attempts to extract location/country from multiple potential sources
 */
export function extractLocation(item: any, aboutPage: any, snippet: any, channelInfo: any): string {
  const possibleLocationSources = [
    aboutPage.country,
    aboutPage.location,
    aboutPage.channelLocation,
    channelInfo.country,
    item.country,
    snippet.country,
    aboutPage.details?.country,
    aboutPage.locationDetails,
    item.location
  ];
  
  for (const source of possibleLocationSources) {
    if (source && typeof source === 'string' && source.trim() !== "") {
      console.log("Found location source:", source);
      return source;
    }
  }
  
  return "";
}

/**
 * Attempts to extract subscriber count from multiple potential sources
 */
export function extractSubscriberCount(item: any, statistics: any, channelInfo: any, aboutPage: any): string | null {
  const subscriberInfoSources = [
    item.subscriberCount,
    statistics.subscriberCount,
    channelInfo.subscriberCount,
    aboutPage.subscriberCount,
    item.stats?.subscriberCount,
    item.channelStats?.subscriberCount,
    aboutPage.stats?.subscriberCount
  ];
  
  for (const source of subscriberInfoSources) {
    if (source !== undefined && source !== null) {
      console.log("Found subscriber count:", source);
      return source;
    }
  }
  
  return null;
}

/**
 * Attempts to extract video count from multiple potential sources
 */
export function extractVideoCount(item: any, statistics: any, channelInfo: any, aboutPage: any): string {
  const videoCountSources = [
    item.amountOfVideos,
    statistics.videoCount,
    channelInfo.videoCount,
    item.videoCount,
    item.stats?.videoCount,
    item.channelStats?.videoCount,
    aboutPage.stats?.videoCount
  ];
  
  for (const source of videoCountSources) {
    if (source !== undefined && source !== null) {
      console.log("Found video count:", source);
      return String(source);
    }
  }
  
  return "0";
}

/**
 * Attempts to extract view count from multiple potential sources
 */
export function extractViewCount(item: any, statistics: any, channelInfo: any, aboutPage: any): string {
  const viewCountSources = [
    statistics.viewCount,
    item.viewCount,
    channelInfo.viewCount,
    aboutPage.viewCount,
    item.stats?.viewCount,
    item.totalViews,
    aboutPage.stats?.totalViews
  ];
  
  for (const source of viewCountSources) {
    if (source !== undefined && source !== null) {
      console.log("Found view count:", source);
      return String(source);
    }
  }
  
  return "0";
}

/**
 * Attempts to extract joined date from multiple potential sources
 */
export function extractJoinedDate(item: any, channelInfo: any, snippet: any, aboutPage: any): string {
  const joinedDateSources = [
    channelInfo.publishedAt,
    item.publishedAt,
    snippet.publishedAt,
    item.creationDate,
    aboutPage.joinedDate,
    channelInfo.joinedDate
  ];
  
  for (const source of joinedDateSources) {
    if (source !== undefined && source !== null) {
      console.log("Found joined date:", source);
      return String(source);
    }
  }
  
  return "";
}
