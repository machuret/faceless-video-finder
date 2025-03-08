
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
  
  console.log("✅ Mapping API response to form data:", data);
  console.log("🔍 Missing fields:", missing);
  
  // Transform API data to form data format with more explicit type handling
  const stats: Partial<ChannelFormData> = {
    total_subscribers: data.subscriberCount !== undefined ? String(data.subscriberCount) : "",
    total_views: data.viewCount !== undefined ? String(data.viewCount) : "",
    video_count: data.videoCount || "",
    description: data.description || "",
    channel_title: data.title || "",
    start_date: data.startDate || "",
    country: data.country || ""
  };
  
  console.log("✅ Mapped form data:", stats);

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
  
  console.log("🔄 Mapping partial API response to form data. Fields needed:", missingFields);
  console.log("📝 API response data:", data);
  
  // Check each field in the response and add to our stats object if present
  Object.entries(FIELD_MAPPINGS).forEach(([apiField, formField]) => {
    const responseField = apiField as keyof ChannelStatsResponse;
    const fieldValue = data[responseField];
    
    if (fieldValue !== undefined && 
        fieldValue !== null && 
        String(fieldValue).trim() !== "") {
      
      console.log(`✅ Field ${apiField} has value:`, fieldValue);
      
      // Use explicit typing to ensure proper assignment
      const fieldName = formField as keyof ChannelFormData;
      const fieldValueString = String(fieldValue);
      
      // Now assign with proper type casting for different field types
      if (fieldName === 'total_subscribers' || fieldName === 'total_views' || fieldName === 'video_count') {
        partialStats[fieldName] = fieldValueString;
      } else if (fieldName === 'description' || fieldName === 'channel_title' || 
                fieldName === 'start_date' || fieldName === 'country') {
        partialStats[fieldName] = fieldValueString;
      }
      
      successfulFields.push(apiField);
    } else {
      console.log(`❌ Field ${apiField} is missing or empty`);
      if (missingFields.some(field => field.toLowerCase().includes(apiField.toLowerCase()))) {
        failedFields.push(apiField);
      }
    }
  });
  
  console.log("📊 Mapped partial stats:", partialStats);
  console.log("✅ Successfully fetched fields:", successfulFields);
  console.log("❌ Failed to fetch fields:", failedFields);
  
  return { partialStats, successfulFields, failedFields };
};
