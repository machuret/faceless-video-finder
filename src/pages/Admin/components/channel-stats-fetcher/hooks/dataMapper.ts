
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";
import { ProcessedChannelData } from "./types";

/**
 * Maps API response to form data structure
 */
export const mapResponseToFormData = (response: ChannelStatsResponse): ProcessedChannelData => {
  console.log("Mapping response to form data:", response);
  
  // Track which fields are missing
  const missing: string[] = [];
  
  // Check each field that should be present
  if (!response.title) missing.push('channel_title');
  if (!response.subscriberCount) missing.push('total_subscribers');
  if (!response.viewCount) missing.push('total_views');
  if (!response.videoCount) missing.push('video_count');
  if (!response.startDate) missing.push('start_date');
  if (!response.description) missing.push('description');
  if (!response.country) missing.push('country');
  
  // Determine if we have partial data
  const hasPartialData = missing.length > 0;
  
  // Map to our form data structure
  const stats = {
    channel_title: response.title || "",
    total_subscribers: response.subscriberCount ? String(response.subscriberCount) : "",
    total_views: response.viewCount ? String(response.viewCount) : "",
    video_count: response.videoCount ? String(response.videoCount) : "",
    start_date: response.startDate || "",
    description: response.description || "",
    country: response.country || ""
  };
  
  // Log what we're returning
  console.log("Mapped form data:", stats);
  console.log("Missing fields:", missing);
  console.log("Has partial data:", hasPartialData);
  
  return { stats, missing, hasPartialData };
};

/**
 * Maps partial response to form data for specific fields
 */
export const mapPartialResponseToFormData = (
  response: ChannelStatsResponse, 
  requestedFields: string[]
): { 
  partialStats: Partial<any>; 
  successfulFields: string[];
  failedFields: string[];
} => {
  console.log("Mapping partial response for fields:", requestedFields, response);
  
  const partialStats: Partial<any> = {};
  const successfulFields: string[] = [];
  const failedFields: string[] = [];
  
  // Helper to check if a field was requested and is present in the response
  const processField = (
    fieldName: string, 
    responseField: string, 
    value: any
  ) => {
    // Check if this field was requested
    const wasRequested = requestedFields.some(f => 
      f.toLowerCase() === fieldName.toLowerCase() ||
      f.toLowerCase().includes(fieldName.toLowerCase())
    );
    
    if (!wasRequested) return;
    
    if (value !== undefined && value !== null && value !== '') {
      partialStats[fieldName] = value;
      successfulFields.push(responseField);
    } else {
      failedFields.push(responseField);
    }
  };
  
  // Process each field that might be in the response
  processField('channel_title', 'title', response.title);
  processField('total_subscribers', 'subscriberCount', response.subscriberCount);
  processField('total_views', 'viewCount', response.viewCount);
  processField('video_count', 'videoCount', response.videoCount);
  processField('start_date', 'startDate', response.startDate);
  processField('description', 'description', response.description);
  processField('country', 'country', response.country);
  
  console.log("Mapped partial stats:", partialStats);
  console.log("Successfully retrieved fields:", successfulFields);
  console.log("Failed to retrieve fields:", failedFields);
  
  return { partialStats, successfulFields, failedFields };
};
