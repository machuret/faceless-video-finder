
import { ChannelFormData } from "@/types/forms";
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";
import { FieldMapping, ProcessedChannelData } from "./types";
import { verifyRequiredFields } from "./dataValidator";

/**
 * Maps API fields to form field names
 */
export const FIELD_MAPPINGS: FieldMapping = {
  description: 'description',
  country: 'country',
  subscriberCount: 'total_subscribers',
  viewCount: 'total_views',
  videoCount: 'video_count',
  startDate: 'start_date',
  title: 'channel_title'
};

/**
 * Maps API response data to form data format
 */
export const mapResponseToFormData = (
  data: ChannelStatsResponse
): ProcessedChannelData => {
  const missing = verifyRequiredFields(data);
  const hasPartialData = missing.length > 0;
  
  // Transform API data to form data format with proper type handling
  const stats: Partial<ChannelFormData> = {
    total_subscribers: data.subscriberCount?.toString() || "",
    total_views: data.viewCount?.toString() || "",
    video_count: data.videoCount?.toString() || "",
    description: data.description || "",
    channel_title: data.title || "",
    start_date: data.startDate || "",
    country: data.country || ""
  };

  // Log what we're returning to help with debugging
  console.log("Mapped stats:", stats);
  console.log("Missing fields:", missing);

  return {
    stats,
    missing,
    hasPartialData
  };
};

/**
 * Maps partial API response data to form data
 * Specifically for missing fields fetch operation
 */
export const mapPartialResponseToFormData = (
  data: ChannelStatsResponse,
  missingFields: string[]
): { partialStats: Partial<ChannelFormData>; successfulFields: string[]; failedFields: string[] } => {
  const partialStats: Partial<ChannelFormData> = {};
  const successfulFields: string[] = [];
  const failedFields: string[] = [];
  
  // Log the received data to help with debugging
  console.log("Processing partial response data:", data);
  
  // Check each field in the response and add to our stats object if present
  Object.entries(FIELD_MAPPINGS).forEach(([apiField, formField]) => {
    const responseField = apiField as keyof ChannelStatsResponse;
    
    // Log each field we're checking
    console.log(`Checking field ${apiField} => ${formField}:`, data[responseField]);
    
    if (data[responseField] !== undefined && 
        data[responseField] !== null && 
        String(data[responseField]).trim() !== "") {
      // Use explicit typing to ensure proper assignment
      const fieldName = formField as keyof ChannelFormData;
      const fieldValue = String(data[responseField]);
      
      console.log(`Found valid value for ${fieldName}:`, fieldValue);
      
      // Now assign with proper type casting for different field types
      if (fieldName === 'total_subscribers' || fieldName === 'total_views' || fieldName === 'video_count') {
        partialStats[fieldName] = fieldValue;
      } else if (fieldName === 'description' || fieldName === 'channel_title' || 
                fieldName === 'start_date' || fieldName === 'country') {
        partialStats[fieldName] = fieldValue;
      }
      
      successfulFields.push(apiField);
    } else if (missingFields.some(field => field.toLowerCase().includes(apiField.toLowerCase()))) {
      failedFields.push(apiField);
    }
  });
  
  console.log("Partial stats result:", partialStats);
  console.log("Successful fields:", successfulFields);
  console.log("Failed fields:", failedFields);
  
  return { partialStats, successfulFields, failedFields };
};
