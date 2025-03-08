
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SelectedChannel, StatsResult, ChannelStatsResult } from "./types";

export async function fetchStatsForSingleChannel(
  channel: SelectedChannel,
  onSuccess: () => void,
  onError: (errorMessage: string) => void
): Promise<ChannelStatsResult | null> {
  try {
    console.log(`Fetching stats for channel: ${channel.title} (${channel.url})`);
    
    // Show an initial progress message for the current channel
    toast.info(`Processing stats for ${channel.title}. This may take up to 3 minutes.`);
    
    const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
      body: { 
        channelUrl: channel.url,
        forceRefresh: true,  // Force a fresh fetch to avoid cached results
        timestamp: Date.now() // Add timestamp to prevent caching
      }
    });

    if (error) {
      console.error(`Error fetching stats for ${channel.title}:`, error);
      const errorMessage = `API error: ${error.message}`;
      onError(errorMessage);
      toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
      return {
        channel,
        results: [],
        error: errorMessage
      };
    }

    if (!data || !data.success) {
      console.error(`Failed to fetch stats for ${channel.title}:`, data?.error || "Unknown error");
      const errorMessage = data?.error || "Unknown error occurred";
      onError(errorMessage);
      toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
      return {
        channel,
        results: [],
        error: errorMessage
      };
    }

    // Track which fields were successfully retrieved
    const results: StatsResult[] = [];
    const updateData: Record<string, any> = {};
    
    // Helper to add a field to both results and updateData
    const addField = (field: string, value: any, fieldSuccess: boolean = true) => {
      results.push({ field, value, success: fieldSuccess });
      if (fieldSuccess && value !== undefined && value !== null) {
        updateData[field] = value;
      }
    };
    
    // Check each field and record its status
    addField('channel_title', data.title, !!data.title);
    addField('total_subscribers', data.subscriberCount, !!data.subscriberCount);
    addField('total_views', data.viewCount, !!data.viewCount);
    addField('video_count', data.videoCount, !!data.videoCount);
    addField('start_date', data.startDate, !!data.startDate);
    addField('description', data.description, !!data.description);
    addField('country', data.country, !!data.country);
    
    // Log what fields we actually got back
    console.log(`Got fields for ${channel.title}:`, Object.keys(updateData).join(', '));
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update(updateData)
        .eq('id', channel.id);

      if (updateError) {
        console.error(`Error updating stats for ${channel.title}:`, updateError);
        onError(`Database update error: ${updateError.message}`);
        toast.error(`Failed to update stats in database for ${channel.title}: ${updateError.message}`);
        return {
          channel,
          results,
          error: `Database update error: ${updateError.message}`
        };
      }
      
      console.log(`Successfully updated stats for ${channel.title}`);
      toast.success(`Updated ${Object.keys(updateData).length} fields for ${channel.title}`);
      onSuccess();
      return { channel, results };
    }
    
    // If we didn't have any fields to update, consider it a failure
    const noFieldsError = `No valid data received for the channel`;
    onError(noFieldsError);
    toast.warning(`No data fields could be retrieved for ${channel.title}`);
    return {
      channel,
      results,
      error: noFieldsError
    };
  } catch (error) {
    console.error(`Exception when fetching stats for ${channel.title}:`, error);
    const errorMessage = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    onError(errorMessage);
    toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
    return {
      channel,
      results: [],
      error: errorMessage
    };
  }
}
