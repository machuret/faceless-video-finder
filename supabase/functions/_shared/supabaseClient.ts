import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ensureStorageBucketsExist } from "./createStorageBuckets.ts";
import { corsHeaders } from "./cors.ts";

// Create a Supabase client with the Auth context of the function
export const supabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  // Get Auth token from the request headers
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader) {
    // If Auth token is provided, create a client with that token
    const token = authHeader.replace('Bearer ', '');
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }
  
  // Otherwise create an anonymous client
  return createClient(supabaseUrl, supabaseKey);
};
