
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      throw new Error("Missing environment variables");
    }
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create RPC function for admin users
    const { error: rpcError } = await supabase.sql(`
      CREATE OR REPLACE FUNCTION admin_get_users(user_ids UUID[])
      RETURNS JSON
      LANGUAGE PLPGSQL SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        result JSON;
      BEGIN
        -- Check if the user is an admin
        IF NOT (
          SELECT EXISTS (
            SELECT 1 FROM public.admin_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
          )
        ) THEN
          RAISE EXCEPTION 'Access denied: Admin privileges required';
        END IF;
        
        -- Get user emails from auth.users
        SELECT 
          json_agg(
            json_build_object(
              'id', au.id,
              'email', au.email
            )
          ) INTO result
        FROM auth.users au
        WHERE au.id = ANY(user_ids);
        
        RETURN result;
      END;
      $$;
    `);
    
    if (rpcError) {
      throw rpcError;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Admin functions initialized successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error("Error in initialize-admin-functions:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
