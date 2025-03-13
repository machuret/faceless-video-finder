
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { UseChannelStatsFetcherProps, UseChannelStatsFetcherResult, DataSource } from "./types";
import { fetchChannelStats, processChannelData, fetchMissingFieldsData, determineDataSource } from "./channelStatsService";

// Finite state machine states for channel stats fetching
type FetchState = 
  | 'idle' 
  | 'loading' 
  | 'fetchingMissing'
  | 'success'
  | 'partialSuccess'
  | 'error';

export function useChannelStatsFetcher({ 
  channelUrl, 
  onStatsReceived 
}: UseChannelStatsFetcherProps): UseChannelStatsFetcherResult {
  // State machine for fetch operations
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  
  // Result states
  const [apiError, setApiError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [partialData, setPartialData] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [consecutiveAttempts, setConsecutiveAttempts] = useState(0);
  
  // Performance tracking
  const fetchTimerRef = useRef<number | null>(null);
  const fetchStartTimeRef = useRef<number | null>(null);
  
  // Reset error state when URL changes
  useEffect(() => {
    setApiError(null);
  }, [channelUrl]);
  
  // Derived states for UI consumption
  const loading = fetchState === 'loading';
  const fetchingMissing = fetchState === 'fetchingMissing';

  // Timer cleanup
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        window.clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  const fetchStats = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    // Reset states
    setFetchState('loading');
    setApiError(null);
    setDataSource(null);
    setPartialData(false);
    setMissingFields([]);
    
    // Start performance timer
    fetchStartTimeRef.current = performance.now();
    
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
      
      // Log performance metrics
      const fetchTime = fetchStartTimeRef.current ? 
        performance.now() - fetchStartTimeRef.current : 0;
      console.log(`Channel stats fetched in ${fetchTime.toFixed(2)}ms`);
      
      if (error || !data) {
        setApiError(error || "Unknown error occurred");
        toast.error(`Failed to fetch stats: ${error || "Unknown error occurred"}`);
        setFetchState('error');
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
        setFetchState('partialSuccess');
        
        // Reset consecutive attempts if we got any data
        if (Object.keys(data).length > 2) { // success + source = 2 keys
          setConsecutiveAttempts(0);
        }
      } else {
        toast.success(`Channel stats fetched successfully via ${data.source || "Apify"}`);
        setFetchState('success');
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
      setFetchState('error');
    }
  };

  const fetchMissingFields = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    setFetchState('fetchingMissing');
    setApiError(null);
    
    // Start performance timer
    fetchStartTimeRef.current = performance.now();
    
    toast.info(`Attempting to fetch missing fields: ${missingFields.join(', ')}...`);

    try {
      const { partialStats, successfulFields, failedFields, error } = 
        await fetchMissingFieldsData(channelUrl, missingFields);
      
      // Log performance metrics
      const fetchTime = fetchStartTimeRef.current ? 
        performance.now() - fetchStartTimeRef.current : 0;
      console.log(`Missing fields fetched in ${fetchTime.toFixed(2)}ms`);
      
      if (error) {
        setApiError(error);
        toast.error(error);
        setFetchState('error');
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
        
        // Update fetch state based on whether we still have missing fields
        setFetchState(updatedMissingFields.length > 0 ? 'partialSuccess' : 'success');
      } else {
        toast.warning("Could not fetch any of the missing fields");
        setFetchState('partialSuccess'); // Still in partial success state
      }
    } catch (err) {
      console.error("Error fetching missing fields:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(errorMessage);
      toast.error(`Failed to fetch missing fields: ${errorMessage}`);
      setFetchState('error');
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
