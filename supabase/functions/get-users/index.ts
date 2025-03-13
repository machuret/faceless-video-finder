
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface GetUsersRequest {
  page?: number;
  pageSize?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { page = 1, pageSize = 10 }: GetUsersRequest = await req.json();
    
    // Initialize Supabase client with request for logging
    const supabase = supabaseClient(req, { auditLog: true });
    
    // Verify the user is an admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }
    
    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('check_is_admin', {
      user_id: user.id
    });
    
    if (adminError || !isAdmin) {
      throw new Error('Not authorized - admin rights required');
    }
    
    console.log(`Admin user ${user.email} requesting users list, page ${page}, pageSize ${pageSize}`);
    
    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;
    
    // Get users list with pagination
    const { data: authUsers, error: listError, count } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: pageSize,
    });
    
    if (listError) {
      throw listError;
    }
    
    // Process users to get admin status
    const usersWithAdminStatus = await Promise.all(
      authUsers.users.map(async (user) => {
        const { data: isAdmin } = await supabase.rpc('check_is_admin', {
          user_id: user.id
        });
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed: user.email_confirmed_at !== null,
          is_admin: isAdmin || false,
          role: isAdmin ? 'admin' : 'user'
        };
      })
    );
    
    return new Response(
      JSON.stringify({
        users: usersWithAdminStatus,
        totalCount: authUsers.total_count || usersWithAdminStatus.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      }
    );
  } catch (error) {
    console.error('Error in get-users function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
