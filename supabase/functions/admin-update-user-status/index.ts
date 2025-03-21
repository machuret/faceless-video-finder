
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

    // Parse the request body to get the user ID and banned status
    const { userId, suspend } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Set the banned_until date - null to unsuspend, future date to suspend
    let banned_until = null;
    if (suspend) {
      // Ban for 100 years (effectively permanent)
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 100);
      banned_until = futureDate.toISOString();
    }
    
    // Update the user's banned status
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { banned_until }
    );
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: suspend ? "User suspended successfully" : "User unsuspended successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in admin-update-user-status function:", error);
    
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
