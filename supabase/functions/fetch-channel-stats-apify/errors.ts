
/**
 * Error class for Apify API failures
 */
export class ApifyError extends Error {
  status?: number;
  details?: any;
  
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "ApifyError";
    this.status = status;
    this.details = details;
  }
}
