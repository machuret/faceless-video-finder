
import { FacelessIdeaInfo } from '../types';

export interface FetchIdeasOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  useCache?: boolean;
  cacheTTL?: number;
  forceCountRefresh?: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface QueryMetadata {
  executionTimeMs?: number;
  cacheHit?: boolean;
  optimizationApplied?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime?: number;
  fromCache?: boolean;
  queryInfo?: QueryMetadata;
}

// Error types for better error handling
export class FacelessIdeasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacelessIdeasError';
  }
}

export class ValidationError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends FacelessIdeasError {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export type RetryTypeCategory = 'network' | 'server' | 'validation' | 'unknown';

// Add retry types
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  errorFilter?: RetryErrorFilter;
}

export type RetryErrorFilter = (error: any) => boolean;
