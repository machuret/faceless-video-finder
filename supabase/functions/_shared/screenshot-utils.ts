
import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Check if a bucket exists, create it if it doesn't
export async function ensureStorageBucket(
  supabase: any,
  bucketName: string
): Promise<{ success: boolean; error?: string }> {
  console.log("Checking if storage bucket exists");
  
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking buckets:", listError);
      return { success: false, error: `Error checking buckets: ${listError.message}` };
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return { success: false, error: `Error creating bucket: ${createError.message}` };
      }
      console.log("Bucket created successfully");
    } else {
      console.log("Bucket already exists");
    }
    
    return { success: true };
  } catch (err) {
    console.error("Error in ensureStorageBucket:", err);
    return { success: false, error: `Unexpected error: ${err.message}` };
  }
}

// Generate a filename for the screenshot
export function generateScreenshotFilename(channelId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `channel_${channelId}_${timestamp}.png`;
}

// Initialize Supabase client
export function initSupabaseClient(): { 
  client: any; 
  error?: string;
} {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseKey) {
      return { client: null, error: "Missing Supabase credentials" };
    }
    
    return { client: createClient(supabaseUrl, supabaseKey) };
  } catch (err) {
    return { client: null, error: `Error initializing Supabase client: ${err.message}` };
  }
}

// Create error response
export function createErrorResponse(message: string, statusCode: number = 400): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: statusCode }
  );
}

// Create success response
export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
