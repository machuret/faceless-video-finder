
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

    // Parse the request to get filters
    const requestBody = await req.json();
    const { user_ids } = requestBody;
    
    // If user_ids are provided, fetch only those specific users
    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
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
                created_at: data.user.created_at,
                banned_until: data.user.banned_until
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
    } 
    // If no user_ids provided, fetch all users
    else {
      console.log("Fetching all users");
      
      // Use the listUsers API to get all users
      // This is a paginated API, so we need to fetch all pages
      const allUsers = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;
      
      while (hasMore) {
        try {
          const { data, error } = await supabase.auth.admin.listUsers({
            page: page,
            perPage: perPage
          });
          
          if (error) {
            console.error("Error fetching users:", error);
            break;
          }
          
          if (data.users && data.users.length > 0) {
            // Map the user data to a simpler format
            const mappedUsers = data.users.map(user => ({
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              banned_until: user.banned_until
            }));
            
            allUsers.push(...mappedUsers);
            
            // Check if we need to fetch more pages
            hasMore = data.users.length === perPage;
            page++;
          } else {
            hasMore = false;
          }
        } catch (err) {
          console.error("Error in pagination:", err);
          hasMore = false;
        }
      }
      
      console.log(`Fetched ${allUsers.length} users total`);
      
      return new Response(
        JSON.stringify(allUsers),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
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
