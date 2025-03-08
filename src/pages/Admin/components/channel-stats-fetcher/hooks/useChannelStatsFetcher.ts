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

    setLoading(true);
    setApiError(null);
    setDataSource(null);
    setPartialData(false);
    setMissingFields([]);
    
    setConsecutiveAttempts(prev => prev + 1);
    
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

      const { stats, missing, hasPartialData } = processChannelData(data);
      
      setMissingFields(missing);
      setPartialData(hasPartialData);
      
      if (hasPartialData) {
        console.warn("Partial data received. Missing fields:", missing);
        toast.warning(`Some channel data is missing: ${missing.join(', ')}`);
        
        if (Object.keys(stats).length > 0) {
          setConsecutiveAttempts(0);
          console.log("Got some data, resetting consecutive attempts");
        }
      } else {
        toast.success(`Channel stats fetched successfully via ${data.source || "Apify"}`);
        setConsecutiveAttempts(0);
      }

      const source = determineDataSource(data);
      setDataSource(source);

      console.log("Processed stats with all fields:", stats);
      
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
      
      console.log("📦 Received partial stats:", partialStats);
      console.log("✅ Successfully fetched fields:", successfulFields);
      console.log("❌ Failed to fetch fields:", failedFields);
      
      if (Object.keys(partialStats).length > 0) {
        console.log("Sending partial stats with retrieved fields:", partialStats);
        
        onStatsReceived(partialStats);
        
        if (successfulFields.length > 0) {
          toast.success(`Successfully fetched: ${successfulFields.join(', ')}`);
        } else {
          toast.warning("Fields were fetched but may be empty or invalid");
        }
        
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const { data, error } = await supabase.functions.invoke('test-apify-connection', {
        body: { timestamp: Date.now() }
      });

      clearTimeout(timeoutId);

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

      console.log("Connection test result:", data);
      toast.success(`Connection to Apify successful!`);
      
      if (data.user) {
        toast.success(`Connected as: ${data.user.username} (${data.user.plan} plan)`);
      }
      
      if (testingConnection) {
        try {
          await testFetchChannelTitle();
        } finally {
          setTestingConnection(false);
        }
      }
    } catch (err) {
      console.error("Error in connection test:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`Connection test error: ${errorMessage}`);
      toast.error(`Connection test failed: ${errorMessage}`);
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
          testMode: true,
          timestamp: Date.now()
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

      if (data.title) {
        toast.success(`Successfully retrieved channel title: ${data.title}`);
        
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
