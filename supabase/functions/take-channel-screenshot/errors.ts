
/**
 * Custom error class for Apify-related errors
 */
export class ApifyError extends Error {
  details?: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ApifyError';
    this.details = details;
    
    // This is needed for proper error instanceof checks in TypeScript
    Object.setPrototypeOf(this, ApifyError.prototype);
  }
}
