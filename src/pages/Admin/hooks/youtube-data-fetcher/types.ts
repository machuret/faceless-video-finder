
export interface YouTubeTestResult {
  url: string;
  success: boolean;
  data: any;
}

export interface DebugInfo {
  lastError: string | null;
  lastResponse: any;
  attempts: number;
  testEdgeFunction: () => Promise<void>;
  runTestSuite: () => Promise<YouTubeTestResult[]>;
  testResults: YouTubeTestResult[];
}

export interface YouTubeDataFetcherResult {
  fetchYoutubeData: (useMockData?: boolean) => Promise<void>;
  debugInfo: DebugInfo;
}
