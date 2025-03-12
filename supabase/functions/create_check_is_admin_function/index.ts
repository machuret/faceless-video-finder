
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create the check_is_admin_safe function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.check_is_admin_safe(user_id uuid)
      RETURNS boolean
      LANGUAGE sql
      STABLE SECURITY DEFINER
      AS $function$
        SELECT EXISTS (
          SELECT 1
          FROM public.admin_roles
          WHERE user_id = $1
          AND role = 'admin'
        );
      $function$;
    `;
    
    const { error: functionError } = await supabase.rpc('create_check_is_admin_function', {
      sql: createFunctionSQL
    });
    
    if (functionError) {
      console.error("Error creating admin check function:", functionError);
      
      // Try running direct SQL as fallback
      const { error: sqlError } = await supabase.sql(createFunctionSQL);
      
      if (sqlError) {
        return new Response(
          JSON.stringify({ error: "Failed to create admin check function", details: sqlError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Admin check function created/updated successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in create_check_is_admin_function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
