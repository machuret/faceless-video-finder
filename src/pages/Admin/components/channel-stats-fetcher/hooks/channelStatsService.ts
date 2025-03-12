import { supabase } from "@/integrations/supabase/client";
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";
import { formatChannelUrl } from "./urlUtils";
import { ProcessedChannelData } from "./types";
import { mapResponseToFormData, mapPartialResponseToFormData } from "./dataMapper";
import { toast } from "sonner";

/**
 * Fetches channel stats from the Supabase Edge Function with timeout protection
 */
export const fetchChannelStats = async (channelUrl: string): Promise<{ 
  data: ChannelStatsResponse | null;
  error: string | null;
}> => {
  if (!channelUrl) {
    return { data: null, error: "No channel URL provided" };
  }

  const formattedUrl = formatChannelUrl(channelUrl);
  console.log("Fetching stats for URL:", formattedUrl);
  
  try {
    // Add a timeout guard to prevent long-running requests
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const { data, error } = await supabase.functions.invoke<ChannelStatsResponse>('fetch-channel-stats-apify', {
        body: { channelUrl: formattedUrl }
      });
      
      clearTimeout(id);

      if (error) {
        console.error("Error fetching channel stats:", error);
        return { data: null, error: error.message };
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || "Failed to fetch channel stats";
        console.error(errorMessage);
        return { data: null, error: errorMessage };
      }

      console.log("Stats received from Apify:", data);
      return { data, error: null };
    } catch (err) {
      clearTimeout(id);
      
      if (err.name === 'AbortError') {
        return { data: null, error: "Request timed out. Please try again." };
      }
      
      throw err; // Re-throw for outer catch
    }
  } catch (err) {
    console.error("Error in fetch stats:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: errorMessage };
  }
};

/**
 * Processes channel data from the API response
 */
export const processChannelData = (
  data: ChannelStatsResponse
): ProcessedChannelData => {
  return mapResponseToFormData(data);
};

/**
 * Fetches missing fields for a channel with optimized requests and timeout protection
 */
export const fetchMissingFieldsData = async (
  channelUrl: string,
  missingFields: string[]
): Promise<{
  partialStats: Partial<any>;
  successfulFields: string[];
  failedFields: string[];
  error: string | null;
}> => {
  if (!channelUrl) {
    return { 
      partialStats: {}, 
      successfulFields: [], 
      failedFields: missingFields,
      error: "No channel URL provided" 
    };
  }

  const formattedUrl = formatChannelUrl(channelUrl);
  console.log("Fetching missing fields for URL:", formattedUrl);
  
  try {
    // Add a timeout guard to prevent long-running requests
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const { data, error } = await supabase.functions.invoke<ChannelStatsResponse>('fetch-channel-stats-apify', {
        body: { 
          channelUrl: formattedUrl,
          fetchMissingOnly: true,
          fields: missingFields // Pass specific fields to optimize the request
        }
      });
      
      clearTimeout(id);

      if (error) {
        console.error("Error fetching missing fields:", error);
        return { 
          partialStats: {}, 
          successfulFields: [], 
          failedFields: missingFields,
          error: `Failed to fetch missing fields: ${error.message}`
        };
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || "Failed to fetch missing fields";
        console.error(errorMessage);
        return { 
          partialStats: {}, 
          successfulFields: [], 
          failedFields: missingFields,
          error: errorMessage
        };
      }

      console.log("Missing fields data received:", data);
      
      const { partialStats, successfulFields, failedFields } = 
        mapPartialResponseToFormData(data, missingFields);
      
      return { 
        partialStats, 
        successfulFields, 
        failedFields,
        error: null
      };
    } catch (err) {
      clearTimeout(id);
      
      if (err.name === 'AbortError') {
        return { 
          partialStats: {}, 
          successfulFields: [], 
          failedFields: missingFields,
          error: "Request timed out. Please try again."
        };
      }
      
      throw err; // Re-throw for outer catch
    }
  } catch (err) {
    console.error("Error fetching missing fields:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { 
      partialStats: {}, 
      successfulFields: [], 
      failedFields: missingFields,
      error: errorMessage
    };
  }
};

/**
 * Determines the data source from the API response
 */
export const determineDataSource = (data: ChannelStatsResponse): "apify" | "youtube" => {
  if (data.source === "youtube") {
    return "youtube";
  }
  return "apify";
};
