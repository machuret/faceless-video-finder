
// Import types from Supabase
import { PostgrestError } from "@supabase/supabase-js";
import { FacelessIdeaInfo } from '../types';

// Define sort order type separately
export type SortOrder = 'asc' | 'desc';

// Define filter object type explicitly
export interface FilterObject {
  [key: string]: any;
}

// Define options for fetching ideas without recursion
export interface FetchIdeasOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filter?: FilterObject;
  useCache?: boolean;
  cacheTTL?: number;
}

// Define paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime?: number;
}

// Define error classes
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

// Retry types for error handling
export type RetryTypeCategory = 'network' | 'server' | 'validation' | 'unknown' | null;

// Options for pagination component
export interface IdeasPaginationOptions {
  pageSize?: number;
  retryLimit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filter?: FilterObject;
  useCache?: boolean;
  cacheTTL?: number;
  retryDelay?: number;
}
