
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { cors } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return cors(req);
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        cors(req, {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create function for checking admin status
    const { error: functionError } = await supabase.rpc('create_check_is_admin_function');
    
    if (functionError) {
      console.error("Error creating admin check function:", functionError);
      return new Response(
        JSON.stringify({ error: "Failed to create admin check function", details: functionError }),
        cors(req, {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Admin check function created/updated successfully" }),
      cors(req, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
  } catch (error) {
    console.error("Error in fix-infinite-recursion function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      cors(req, {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
});
