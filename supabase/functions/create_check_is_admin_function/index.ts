
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
    
    // Add package compatibility notes for Vercel deployment
    const packageCompatibilityNotes = {
      title: "Package Compatibility Issue Detected",
      issue: "Your project has a compatibility issue between date-fns v4.1.0 and react-day-picker v8.10.1",
      solution: "To fix this issue for Vercel deployment, you need to downgrade date-fns to v3.x",
      steps: [
        "In your package.json, change: \"date-fns\": \"^4.1.0\" to \"date-fns\": \"^3.6.0\"",
        "Run npm install or yarn install",
        "Commit and push the changes to your repository",
        "Redeploy your Vercel project"
      ],
      alternative: "If you need to keep date-fns v4.1.0, you would need to find an alternative to react-day-picker or a newer version that supports date-fns v4.x"
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin check function created/updated successfully",
        packageCompatibilityNotes
      }),
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
