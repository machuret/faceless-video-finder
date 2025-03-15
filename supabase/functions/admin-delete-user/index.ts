
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

    // Parse the request body to get the userId or userIds for bulk delete
    const requestData = await req.json();
    
    // Check if this is a bulk delete operation
    if (requestData.userIds && Array.isArray(requestData.userIds)) {
      if (requestData.userIds.length === 0) {
        return new Response(
          JSON.stringify({ error: "No user IDs provided for deletion" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Process bulk deletion
      const results = [];
      const errors = [];
      
      // Process user deletions sequentially to avoid rate limiting
      for (const userId of requestData.userIds) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);
          if (error) {
            errors.push({ userId, error: error.message });
          } else {
            results.push(userId);
          }
        } catch (error) {
          errors.push({ userId, error: error.message || "Unknown error" });
        }
      }
      
      // If all deletions failed, return an error
      if (results.length === 0 && errors.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to delete any users", 
            details: errors 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Return partial success if some deletions succeeded
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully deleted ${results.length} of ${requestData.userIds.length} users`,
          deleted: results,
          errors: errors.length > 0 ? errors : undefined
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } 
    // Single user deletion
    else if (requestData.userId) {
      const userId = requestData.userId;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Delete the user from auth.users (this will cascade to profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid request: Either userId or userIds array is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error("Error in admin-delete-user function:", error);
    
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
