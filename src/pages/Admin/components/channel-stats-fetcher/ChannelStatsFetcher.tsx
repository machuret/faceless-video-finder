
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { ChannelFormData } from "@/types/forms";
import { useChannelStatsFetcher } from "./hooks/useChannelStatsFetcher";
import { 
  ErrorAlert, 
  PartialDataAlert, 
  SuccessAlert, 
  MultipleAttemptsAlert 
} from "./components/StatsFetcherAlerts";

interface ChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

const ChannelStatsFetcher = ({ channelUrl, onStatsReceived }: ChannelStatsFetcherProps) => {
  const {
    loading,
    apiError,
    dataSource,
    partialData,
    missingFields,
    consecutiveAttempts,
    fetchStats
  } = useChannelStatsFetcher({ channelUrl, onStatsReceived });

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={fetchStats}
        disabled={loading || !channelUrl}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Fetch Stats via Apify
      </Button>

      {apiError && <ErrorAlert error={apiError} />}

      {!apiError && partialData && <PartialDataAlert missingFields={missingFields} />}

      {!apiError && dataSource === "apify" && !partialData && <SuccessAlert />}
      
      <MultipleAttemptsAlert attemptsCount={consecutiveAttempts} />
    </div>
  );
};

export default ChannelStatsFetcher;
