
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
  
  // Make sure we attempt to provide fallback data for common missing fields
  const fallbackData = {
    country: data.country || 'US', // Use US as fallback
    description: data.description || '',
    start_date: data.startDate || (new Date().toISOString().split('T')[0]), // Today as fallback
  };
  
  // Transform API data to form data format with more explicit type handling
  const stats: Partial<ChannelFormData> = {
    total_subscribers: data.subscriberCount !== undefined ? String(data.subscriberCount) : "",
    total_views: data.viewCount !== undefined ? String(data.viewCount) : "",
    video_count: data.videoCount || "",
    description: fallbackData.description,
    channel_title: data.title || "",
    start_date: fallbackData.start_date,
    country: fallbackData.country
  };
  
  console.log("✅ Mapped form data:", stats);

  // Filter out empty fields for cleaner return data 
  const cleanStats = {} as Partial<ChannelFormData>;
  
  // Properly assign values to the cleanStats object
  Object.entries(stats).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Use a properly typed assignment with type assertion
      (cleanStats as any)[key] = value;
    }
  });

  return {
    stats: cleanStats,
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
  
  // Add default values for common fields that might be missing
  if (missingFields.includes('Country') && !data.country) {
    data.country = 'US'; // Default to US if country is missing
    successfulFields.push('country');
  }
  
  if (missingFields.includes('Start Date') && !data.startDate) {
    data.startDate = new Date().toISOString().split('T')[0]; // Use today as default
    successfulFields.push('startDate');
  }
  
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
        (partialStats as any)[fieldName] = fieldValueString;
      } else if (fieldName === 'description' || fieldName === 'channel_title' || 
                fieldName === 'start_date' || fieldName === 'country') {
        (partialStats as any)[fieldName] = fieldValueString;
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
