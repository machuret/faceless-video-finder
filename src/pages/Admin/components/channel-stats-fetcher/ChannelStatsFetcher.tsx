
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, PlusCircle, TestTube2 } from "lucide-react";
import { ChannelFormData } from "@/types/forms";
import { useChannelStatsFetcher } from "./hooks";
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
  } = useChannelStatsFetcher({ channelUrl, onStatsReceived });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={fetchStats}
          disabled={loading || fetchingMissing || testingConnection || !channelUrl}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Fetch Stats via Apify
        </Button>

        {partialData && missingFields.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={fetchMissingFields}
            disabled={loading || fetchingMissing || testingConnection || !channelUrl}
          >
            {fetchingMissing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            Fetch Missing Fields
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${testingConnection ? 'bg-amber-100' : 'bg-amber-50'} hover:bg-amber-100 text-amber-800 hover:text-amber-900 border-amber-300`}
          onClick={testingConnection ? undefined : testApifyConnection}
          disabled={loading || fetchingMissing || testingConnection || !channelUrl}
        >
          {testingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
          {testingConnection ? "Testing..." : "Test Connection"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.open(channelUrl, '_blank')}
          disabled={!channelUrl}
        >
          View Channel
        </Button>
      </div>

      {apiError && <ErrorAlert error={apiError} />}

      {!apiError && partialData && <PartialDataAlert missingFields={missingFields} />}

      {!apiError && dataSource === "apify" && !partialData && <SuccessAlert />}
      
      {consecutiveAttempts > 1 && <MultipleAttemptsAlert attemptsCount={consecutiveAttempts} />}
    </div>
  );
};

export default ChannelStatsFetcher;
