
import { FetchIdeasOptions, ValidationError } from './types';

/**
 * Validates and sanitizes query parameters
 */
export const validateQueryParams = (options: FetchIdeasOptions): FetchIdeasOptions => {
  const validated: FetchIdeasOptions = { ...options };
  
  // Validate page
  if (validated.page !== undefined) {
    if (typeof validated.page !== 'number' || validated.page < 1) {
      throw new ValidationError('Page must be a positive number');
    }
  }
  
  // Validate pageSize
  if (validated.pageSize !== undefined) {
    if (typeof validated.pageSize !== 'number' || validated.pageSize < 1 || validated.pageSize > 100) {
      throw new ValidationError('Page size must be between 1 and 100');
    }
  }
  
  // Validate sortBy
  if (validated.sortBy !== undefined) {
    const allowedSortFields = ['label', 'created_at', 'updated_at']; 
    if (!allowedSortFields.includes(validated.sortBy)) {
      throw new ValidationError(`Sort field must be one of: ${allowedSortFields.join(', ')}`);
    }
  }
  
  // Validate sortOrder
  if (validated.sortOrder !== undefined && !['asc', 'desc'].includes(validated.sortOrder)) {
    throw new ValidationError('Sort order must be either "asc" or "desc"');
  }
  
  // Sanitize search term (basic sanitization, can be expanded)
  if (validated.search) {
    validated.search = validated.search.trim();
  }
  
  return validated;
};
