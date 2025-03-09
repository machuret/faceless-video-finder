
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ensureStorageBuckets } from "./createStorageBuckets.ts";

export function supabaseClient(req: Request) {
  // Get Supabase URL and service role key from env
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Ensure all required storage buckets exist (this runs async but doesn't await)
  ensureStorageBuckets(supabase);
  
  return supabase;
}
