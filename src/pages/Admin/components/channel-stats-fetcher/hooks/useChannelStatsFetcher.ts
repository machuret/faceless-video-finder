
import { useState } from "react";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { UseChannelStatsFetcherProps, UseChannelStatsFetcherResult, DataSource } from "./types";
import { fetchChannelStats, processChannelData, fetchMissingFieldsData, determineDataSource } from "./channelStatsService";

export function useChannelStatsFetcher({ 
  channelUrl, 
  onStatsReceived 
}: UseChannelStatsFetcherProps): UseChannelStatsFetcherResult {
  const [loading, setLoading] = useState(false);
  const [fetchingMissing, setFetchingMissing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [partialData, setPartialData] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [consecutiveAttempts, setConsecutiveAttempts] = useState(0);

  const fetchStats = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    // Reset states
    setLoading(true);
    setApiError(null);
    setDataSource(null);
    setPartialData(false);
    setMissingFields([]);
    
    // Increment consecutive attempts
    setConsecutiveAttempts(prev => prev + 1);
    
    // If too many consecutive attempts with failures
    if (consecutiveAttempts >= 2) {
      toast.warning("Multiple fetch attempts detected. Please try filling in data manually if fetching continues to fail.");
    } else {
      toast.info("Fetching channel stats via Apify...");
    }

    try {
      const { data, error } = await fetchChannelStats(channelUrl);
      
      if (error || !data) {
        setApiError(error || "Unknown error occurred");
        toast.error(`Failed to fetch stats: ${error || "Unknown error occurred"}`);
        setLoading(false);
        return;
      }

      // Process the data
      const { stats, missing, hasPartialData } = processChannelData(data);
      
      // Update state with results
      setMissingFields(missing);
      setPartialData(hasPartialData);
      
      if (hasPartialData) {
        console.warn("Partial data received. Missing fields:", missing);
        toast.warning(`Some channel data is missing: ${missing.join(', ')}`);
        
        // Reset consecutive attempts if we got any data
        if (Object.keys(data).length > 2) { // success + source = 2 keys
          setConsecutiveAttempts(0);
        }
      } else {
        toast.success(`Channel stats fetched successfully via ${data.source || "Apify"}`);
        setConsecutiveAttempts(0); // Reset consecutive attempts on success
      }

      // Set data source
      const source = determineDataSource(data);
      setDataSource(source);

      // Send data to parent component
      console.log("Processed stats with all fields:", stats);
      onStatsReceived(stats);
    } catch (err) {
      console.error("Error in fetch stats flow:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(errorMessage);
      toast.error(`Failed to fetch stats: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissingFields = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    setFetchingMissing(true);
    setApiError(null);
    
    toast.info(`Attempting to fetch missing fields: ${missingFields.join(', ')}...`);

    try {
      const { partialStats, successfulFields, failedFields, error } = 
        await fetchMissingFieldsData(channelUrl, missingFields);
      
      if (error) {
        setApiError(error);
        toast.error(error);
        setFetchingMissing(false);
        return;
      }
      
      // Only call onStatsReceived if we have at least one field
      if (Object.keys(partialStats).length > 0) {
        console.log("Sending partial stats with retrieved fields:", partialStats);
        onStatsReceived(partialStats);
        toast.success(`Successfully fetched: ${successfulFields.join(', ')}`);
        
        // Update missing fields list
        const updatedMissingFields = missingFields.filter(field => 
          !successfulFields.some(success => field.toLowerCase().includes(success.toLowerCase()))
        );
        setMissingFields(updatedMissingFields);
        setPartialData(updatedMissingFields.length > 0);
      } else {
        toast.warning("Could not fetch any of the missing fields");
      }
    } catch (err) {
      console.error("Error fetching missing fields:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(errorMessage);
      toast.error(`Failed to fetch missing fields: ${errorMessage}`);
    } finally {
      setFetchingMissing(false);
    }
  };

  return {
    loading,
    fetchingMissing,
    apiError,
    dataSource,
    partialData,
    missingFields,
    consecutiveAttempts,
    fetchStats,
    fetchMissingFields
  };
}
