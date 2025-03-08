
import { useState } from "react";
import { toast } from "sonner";
import { ChannelFormData } from "@/types/forms";
import { UseChannelStatsFetcherProps, UseChannelStatsFetcherResult, DataSource } from "./types";
import { fetchChannelStats, processChannelData, fetchMissingFieldsData, determineDataSource } from "./channelStatsService";
import { supabase } from "@/integrations/supabase/client";
import { formatChannelUrl } from "./urlUtils";

export function useChannelStatsFetcher({ 
  channelUrl, 
  onStatsReceived 
}: UseChannelStatsFetcherProps): UseChannelStatsFetcherResult {
  const [loading, setLoading] = useState(false);
  const [fetchingMissing, setFetchingMissing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [partialData, setPartialData] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [consecutiveAttempts, setConsecutiveAttempts] = useState(0);

  const fetchStats = async () => {
    if (!channelUrl || channelUrl.trim() === "") {
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
        if (Object.keys(stats).length > 0) {
          setConsecutiveAttempts(0);
          console.log("Got some data, resetting consecutive attempts");
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
      
      // Ensure we call onStatsReceived even if some fields are empty
      if (Object.keys(stats).length > 0) {
        onStatsReceived(stats);
      } else {
        toast.error("No usable data was retrieved from the API");
      }
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
    if (!channelUrl || channelUrl.trim() === "") {
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
      
      // Log what we received to help with debugging
      console.log("📦 Received partial stats:", partialStats);
      console.log("✅ Successfully fetched fields:", successfulFields);
      console.log("❌ Failed to fetch fields:", failedFields);
      
      // Only call onStatsReceived if we have at least one field
      if (Object.keys(partialStats).length > 0) {
        console.log("Sending partial stats with retrieved fields:", partialStats);
        
        // Ensure the callback gets called with the updated data
        onStatsReceived(partialStats);
        
        if (successfulFields.length > 0) {
          toast.success(`Successfully fetched: ${successfulFields.join(', ')}`);
        } else {
          toast.warning("Fields were fetched but may be empty or invalid");
        }
        
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

  const testApifyConnection = async () => {
    if (!channelUrl || channelUrl.trim() === "") {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    setTestingConnection(true);
    setApiError(null);
    
    toast.info("Testing connection to Apify...");

    try {
      // Call the dedicated test connection function with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Fix: Remove abortSignal property as it's not supported in FunctionInvokeOptions
      const { data, error } = await supabase.functions.invoke('test-apify-connection', {
        body: { timestamp: Date.now() } // Add timestamp to prevent caching
      });

      clearTimeout(timeoutId);

      // Handle controller abort manually if needed
      if (controller.signal.aborted) {
        console.error("Connection test timed out");
        setApiError("Connection test timed out after 10 seconds");
        toast.error("Connection test timed out after 10 seconds");
        setTestingConnection(false);
        return;
      }

      if (error) {
        console.error("Error testing Apify connection:", error);
        setApiError(`Connection test error: ${error.message}`);
        toast.error(`Connection test failed: ${error.message}`);
        setTestingConnection(false);
        return;
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || "Unknown error occurred";
        console.error("Failed connection test:", errorMsg);
        setApiError(`Connection test failed: ${errorMsg}`);
        toast.error(`Connection test failed: ${errorMsg}`);
        setTestingConnection(false);
        return;
      }

      // Successfully connected
      toast.success(`Connection to Apify successful!`);
      console.log("Connection test result:", data);
      
      // If we have user info, that's good news!
      if (data.user) {
        toast.success(`Connected as: ${data.user.username} (${data.user.plan} plan)`);
      }
      
      // Test fetching just the title to make sure we can get data
      await testFetchChannelTitle();
      
    } catch (err) {
      console.error("Error in connection test:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`Connection test error: ${errorMessage}`);
      toast.error(`Connection test failed: ${errorMessage}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const testFetchChannelTitle = async () => {
    const formattedUrl = formatChannelUrl(channelUrl);
    
    try {
      toast.info("Testing channel data fetch...");
      
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats-apify', {
        body: { 
          channelUrl: formattedUrl,
          testMode: true,  // Special flag to just test connection
          timestamp: Date.now() // Add timestamp to prevent caching
        }
      });

      if (error) {
        console.error("Error testing channel fetch:", error);
        toast.error(`Channel fetch test failed: ${error.message}`);
        return;
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || "Unknown error occurred";
        console.error("Failed channel fetch test:", errorMsg);
        toast.error(`Channel fetch test failed: ${errorMsg}`);
        return;
      }

      // If we got a title, that's good news!
      if (data.title) {
        toast.success(`Successfully retrieved channel title: ${data.title}`);
        
        // Update the form with just the title
        onStatsReceived({ 
          channel_title: data.title 
        });
      } else {
        toast.warning("Connection successful, but couldn't retrieve channel title");
      }
    } catch (err) {
      console.error("Error in channel title test:", err);
      toast.error(`Channel title test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return {
    loading,
    fetchingMissing,
    testingConnection,
    apiError,
    dataSource,
    partialData,
    missingFields,
    consecutiveAttempts,
    fetchStats,
    fetchMissingFields,
    testApifyConnection
  };
}
