
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a promise that rejects after a specified timeout
 * @param ms Timeout in milliseconds
 * @param message Error message
 */
export const createTimeoutPromise = (ms: number, message: string = "Request timed out") => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
};

/**
 * Executes a Supabase query with timeout protection
 * @param queryFn Function that returns a Supabase query
 * @param timeoutMs Timeout in milliseconds
 */
export const executeWithTimeout = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  timeoutMs: number = 8000
): Promise<T> => {
  try {
    const result = await Promise.race([
      queryFn(),
      createTimeoutPromise(timeoutMs)
    ]);
    
    if (result.error) {
      throw result.error;
    }
    
    if (!result.data) {
      throw new Error("No data returned");
    }
    
    return result.data;
  } catch (error) {
    console.error("Query execution error:", error);
    throw error;
  }
};

/**
 * Invokes a Supabase Edge Function with timeout protection
 * @param functionName Edge function name
 * @param payload Request payload
 * @param timeoutMs Timeout in milliseconds
 */
export const invokeEdgeFunctionWithTimeout = async <T>(
  functionName: string,
  payload?: any,
  timeoutMs: number = 8000
): Promise<T> => {
  try {
    const result = await Promise.race([
      supabase.functions.invoke(functionName, { body: payload }),
      createTimeoutPromise(timeoutMs, `Edge function ${functionName} timed out after ${timeoutMs}ms`)
    ]);
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data as T;
  } catch (error) {
    console.error(`Edge function ${functionName} error:`, error);
    throw error;
  }
};

/**
 * Execute a fetch operation with automatic retries
 * @param fetchFn The fetch function to execute
 * @param retries Number of retry attempts
 * @param retryDelay Base delay between retries in ms
 * @param exponential Whether to use exponential backoff
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  retries: number = 3,
  retryDelay: number = 1000,
  exponential: boolean = true
): Promise<T> => {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.log(`Retrying operation, ${retries} attempts remaining`);
    
    // Calculate delay with optional exponential backoff
    const delay = exponential ? retryDelay * Math.pow(2, 3 - retries) : retryDelay;
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Recursive retry with one less attempt
    return fetchWithRetry(fetchFn, retries - 1, retryDelay, exponential);
  }
};
