
/**
 * Type definitions for the screenshot API
 */

export interface ScreenshotResult {
  buffer: ArrayBuffer | null;
  directUrl: string | null;
  error?: string;
}

export interface ApifyRunResponse {
  data?: {
    id?: string;
    defaultKeyValueStoreId?: string;
    defaultDatasetId?: string;
    status?: string;
  };
  error?: any;
}

export interface ApifyStatusResponse {
  data?: {
    status?: string;
  };
}

export interface ApifyKeyValueStoreItem {
  key: string;
}

export interface ApifyKeyValueStoreResponse {
  data: {
    items: ApifyKeyValueStoreItem[];
  };
}
