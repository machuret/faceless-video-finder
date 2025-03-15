
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
    
    // Get the requesting user to check if they are an admin
    const authHeader = req.headers.get('Authorization');
    const adminCheck = await checkIsAdmin(supabase, authHeader);
    
    if (!adminCheck.isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the request body to get the userIds
    const { user_ids } = await req.json();
    
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "User IDs are required as an array" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Fetch users from auth.users using the admin API
    const userData = [];
    
    // Process in batches to avoid potential limitations
    const batchSize = 50;
    for (let i = 0; i < user_ids.length; i += batchSize) {
      const batch = user_ids.slice(i, i + batchSize);
      
      for (const userId of batch) {
        try {
          const { data, error } = await supabase.auth.admin.getUserById(userId);
          
          if (!error && data.user) {
            userData.push({
              id: data.user.id,
              email: data.user.email,
            });
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          // Continue with other users even if one fails
        }
      }
    }
    
    return new Response(
      JSON.stringify(userData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error("Error in admin-get-users function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to check if the requesting user is an admin
async function checkIsAdmin(supabase: any, authHeader: string | null) {
  try {
    if (!authHeader) {
      return { isAdmin: false };
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return { isAdmin: false };
    }
    
    const { data: isAdmin, error: adminError } = await supabase.rpc('check_is_admin', {
      user_id: user.id
    });
    
    if (adminError) {
      console.error("Error checking admin status:", adminError);
      return { isAdmin: false };
    }
    
    return { isAdmin: !!isAdmin, userId: user.id };
  } catch (error) {
    console.error("Error in admin check:", error);
    return { isAdmin: false };
  }
}
