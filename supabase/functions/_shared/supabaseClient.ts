
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ensureStorageBucketsExist } from "./createStorageBuckets.ts";

// Connection pool management
const clientInstances = new Map();
let connectionMetrics = {
  created: 0,
  reused: 0,
  errors: 0,
  lastError: null,
};

// Cache configuration
const CACHE_TTL = 60 * 1000; // 1 minute default TTL
const queryCache = new Map();

interface ClientOptions {
  schema?: string;
  cacheResults?: boolean;
  cacheTTL?: number;
  auditLog?: boolean;
}

/**
 * Create or reuse a Supabase client with advanced configuration
 * @param req - The HTTP request object
 * @param options - Configuration options for the client
 * @returns Configured Supabase client
 */
export function supabaseClient(req: Request, options: ClientOptions = {}) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  try {
    // Get Supabase URL and service role key from env
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("[supabaseClient] Missing required environment variables");
      throw new Error("Supabase configuration missing");
    }
    
    // Generate cache key for client reuse
    const cacheKey = `${supabaseUrl}-${options.schema || 'public'}`;
    
    // Check if we already have a client instance for this configuration
    if (clientInstances.has(cacheKey)) {
      connectionMetrics.reused++;
      console.log(`[supabaseClient] Reusing existing client instance (${connectionMetrics.reused} reuses)`);
      return clientInstances.get(cacheKey);
    }
    
    // Connection parameters with extended options
    const clientOptions: any = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: options.schema || 'public',
      },
      global: {
        headers: { 
          'x-request-id': requestId,
          'x-client-info': 'edge-function'
        },
      },
    };
    
    // Create Supabase client
    console.log(`[supabaseClient] Creating new client instance (${connectionMetrics.created + 1} total)`);
    const supabase = createClient(supabaseUrl, supabaseKey, clientOptions);
    
    // Store in connection pool
    clientInstances.set(cacheKey, supabase);
    connectionMetrics.created++;
    
    // Attach query result caching if enabled
    if (options.cacheResults) {
      attachCachingInterceptor(supabase, options.cacheTTL || CACHE_TTL);
    }
    
    // Attach audit logging if enabled
    if (options.auditLog) {
      attachAuditLogging(supabase, requestId, req);
    }
    
    // Ensure all required storage buckets exist (this runs async but doesn't await)
    ensureStorageBucketsExist(supabase);
    
    // Log execution time
    const executionTime = performance.now() - startTime;
    console.log(`[supabaseClient] Client initialization took ${executionTime.toFixed(2)}ms`);
    
    return supabase;
  } catch (error) {
    connectionMetrics.errors++;
    connectionMetrics.lastError = error;
    console.error(`[supabaseClient] Error creating client: ${error.message}`);
    throw error;
  }
}

/**
 * Attach caching interceptor to the Supabase client
 */
function attachCachingInterceptor(supabase: any, ttl: number) {
  // Store original from method
  const originalFrom = supabase.from;
  
  // Override the from method to add caching
  supabase.from = function(table: string) {
    const queryBuilder = originalFrom.call(this, table);
    
    // Store original select method
    const originalSelect = queryBuilder.select;
    
    // Override select to add caching
    queryBuilder.select = function(...args: any[]) {
      const selectBuilder = originalSelect.apply(this, args);
      
      // Store original then method
      const originalThen = selectBuilder.then;
      
      // Override then method to add caching
      selectBuilder.then = function(resolve: any, reject: any) {
        // Generate cache key based on the query
        const cacheKey = `${table}:${JSON.stringify(args)}:${JSON.stringify(this)}`;
        
        // Check if we have a cached result
        if (queryCache.has(cacheKey)) {
          const cachedResult = queryCache.get(cacheKey);
          
          // Check if cache is still valid
          if (cachedResult.timestamp + ttl > Date.now()) {
            console.log(`[queryCache] Cache hit for ${cacheKey}`);
            return Promise.resolve(cachedResult.data).then(resolve, reject);
          } else {
            console.log(`[queryCache] Cache expired for ${cacheKey}`);
            queryCache.delete(cacheKey);
          }
        }
        
        // Execute the original query
        return originalThen.call(this, (result: any) => {
          // Cache the result
          queryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          // Return the result
          resolve(result);
        }, reject);
      };
      
      return selectBuilder;
    };
    
    return queryBuilder;
  };
}

/**
 * Attach audit logging for sensitive operations
 */
function attachAuditLogging(supabase: any, requestId: string, req: Request) {
  // List of sensitive tables that should be audited
  const sensitiveTables = ['admin_roles', 'youtube_channels', 'user_data'];
  
  // Extract user information if available
  let userId = 'anonymous';
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Basic JWT structure extraction without verification
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || 'unknown';
    }
  } catch (e) {
    console.warn(`[auditLog] Could not extract user ID: ${e.message}`);
  }
  
  // Store original from method
  const originalFrom = supabase.from;
  
  // Override the from method to add audit logging
  supabase.from = function(table: string) {
    const queryBuilder = originalFrom.call(this, table);
    
    // Only add audit logging for sensitive tables
    if (sensitiveTables.includes(table)) {
      // Override insert method
      const originalInsert = queryBuilder.insert;
      queryBuilder.insert = function(...args: any[]) {
        console.log(`[auditLog] INSERT on ${table} by ${userId} (${requestId})`);
        return originalInsert.apply(this, args);
      };
      
      // Override update method
      const originalUpdate = queryBuilder.update;
      queryBuilder.update = function(...args: any[]) {
        console.log(`[auditLog] UPDATE on ${table} by ${userId} (${requestId})`);
        return originalUpdate.apply(this, args);
      };
      
      // Override delete method
      const originalDelete = queryBuilder.delete;
      queryBuilder.delete = function(...args: any[]) {
        console.log(`[auditLog] DELETE on ${table} by ${userId} (${requestId})`);
        return originalDelete.apply(this, args);
      };
    }
    
    return queryBuilder;
  };
}

/**
 * Get current connection metrics
 */
export function getConnectionMetrics() {
  return {
    ...connectionMetrics,
    cacheSize: queryCache.size,
    activeConnections: clientInstances.size
  };
}

/**
 * Clear query cache
 */
export function clearQueryCache() {
  const cacheSize = queryCache.size;
  queryCache.clear();
  console.log(`[queryCache] Cleared ${cacheSize} cached queries`);
  return cacheSize;
}

/**
 * Sanitize input to prevent SQL injection
 * @param input - Input string to sanitize
 * @returns Sanitized string safe for database operations
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  // Replace potentially dangerous characters
  return input
    .replace(/'/g, "''")              // Escape single quotes
    .replace(/\\/g, "\\\\")           // Escape backslashes
    .replace(/;/g, "")                // Remove semicolons
    .replace(/--/g, "")               // Remove SQL comment markers
    .replace(/\/\*/g, "")             // Remove block comment start
    .replace(/\*\//g, "")             // Remove block comment end
    .replace(/drop\s+table/gi, "")    // Remove DROP TABLE statements
    .replace(/drop\s+database/gi, "")  // Remove DROP DATABASE statements
    .replace(/alter\s+table/gi, "")   // Remove ALTER TABLE statements
    .replace(/delete\s+from/gi, "")   // Remove DELETE FROM statements
    .trim();
}
