
import { useState, Dispatch, SetStateAction } from "react";
import { ChannelFormData } from "@/types/forms";
import { EdgeFunctionTester } from "./EdgeFunctionTester";
import { TestSuiteRunner } from "./TestSuiteRunner";
import { DataFetcher } from "./DataFetcher";
import { YouTubeDataFetcherResult } from "./types";

/**
 * Hook for fetching YouTube channel data from various URL formats
 */
export const useYouTubeDataFetcher = (
  youtubeUrl: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
): YouTubeDataFetcherResult => {
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [testResults, setTestResults] = useState<Array<{url: string, success: boolean, data: any}>>([]);

  const edgeFunctionTester = new EdgeFunctionTester(
    setLastError,
    setLastResponse,
    setLoading
  );

  const testSuiteRunner = new TestSuiteRunner(
    setTestResults,
    setLoading,
    setAttempts
  );

  const dataFetcher = new DataFetcher(
    youtubeUrl,
    setLoading,
    setFormData,
    setLastError,
    setLastResponse,
    setAttempts
  );

  const fetchYoutubeData = async (useMockData = false): Promise<void> => {
    await dataFetcher.fetchYoutubeData(useMockData);
  };

  // Expose debug information and test functions
  const debugInfo = {
    lastError,
    lastResponse,
    attempts,
    testEdgeFunction: () => edgeFunctionTester.testEdgeFunction(),
    runTestSuite: () => testSuiteRunner.runTestSuite(),
    testResults
  };
  
  return { fetchYoutubeData, debugInfo };
};
