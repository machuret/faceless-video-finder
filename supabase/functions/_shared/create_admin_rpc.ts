
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export async function createAdminUserFunctions() {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables for Supabase");
      return { success: false, error: "Missing environment variables" };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create RPC function for admin users
    const { error: rpcError } = await supabase.rpc('create_admin_get_users_function', {
      sql: `
        CREATE OR REPLACE FUNCTION admin_get_users(user_ids UUID[])
        RETURNS JSON
        LANGUAGE PLPGSQL SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
          result JSON;
        BEGIN
          -- Check if the user is an admin
          IF NOT (SELECT is_admin()) THEN
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
      `
    });
    
    if (rpcError) {
      console.error("Error creating admin_get_users function:", rpcError);
      return { success: false, error: rpcError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error creating admin RPC functions:", error);
    return { success: false, error };
  }
}
