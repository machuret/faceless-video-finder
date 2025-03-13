
// Error types for better error handling
export class FacelessIdeasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FacelessIdeasError";
  }
}

export class NetworkError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ServerError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "ServerError";
  }
}

export class ValidationError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Explicitly define the options interface without recursive types
export interface FetchIdeasOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
  useCache?: boolean;
  cacheTTL?: number; // in milliseconds
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime?: number; // Added for performance tracking
}

// Define error filter type independently to avoid recursive definitions
export type RetryErrorFilter = (error: any) => boolean;

// Define the retry options without recursive type references
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  errorFilter?: RetryErrorFilter;
}
